import axios from 'axios';
import bcrypt from 'bcrypt';
import { User } from '../@types/auth';
import { prisma } from '../config/db';
import { RegisterRequestDTO } from '../dto/auth.dto';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import {
  generateOTP,
  sendOTPEmail,
  sendVerificationEmail,
} from '../utils/email.utils';
import { generateToken, verifyToken } from '../utils/token';

class AuthService {
  register = async (userData: RegisterRequestDTO) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ApiError(400, 'User already exists. Please login');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        otp,
        otp_expiry: otpExpiry,
        provider: 'EMAIL',
        last_login: new Date(),
        is_active: true,
      },
    });
    await sendOTPEmail(userData.email, otp);
    const { password, ...user } = newUser;
    console.log(password);

    return user;
  };

  verifyOtp = async (email: string, otp: number) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new ApiError(404, 'User not found');

    if (user.is_verify) {
      throw new ApiError(400, 'Email already verified');
    }
    if (user.otp !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }
    if (user.otp_expiry && user.otp_expiry < new Date()) {
      throw new ApiError(400, 'OTP expired');
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        is_verify: true,
        otp: 0,
        otp_expiry: null,
      },
    });

    return updatedUser;
  };

  login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(400, 'User not found, please register');
    }
    if (!user.is_verify) {
      throw new ApiError(400, 'Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, 'Invalid password');
    }

    const [accessToken, refreshToken] = await Promise.all([
      generateToken('1d', {
        email: user.email,
        id: user.id,
        type: 'access',
      }),
      generateToken('7d', {
        email: user.email,
        id: user.id,
        type: 'refresh',
      }),
    ]);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        last_login: new Date(),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  };

  forgot = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const token = await generateToken('3m', {
      email: user.email,
      id: user.id,
      type: 'access',
    });
    await sendVerificationEmail(email, token);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  };

  async resetPassword(newPassword: string, token: string) {
    if (!token) throw new ApiError(400, 'token required');

    const { payload } = await verifyToken(token);

    if (!payload.email) {
      throw new ApiError(400, 'token does not match this user');
    }
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) throw new ApiError(404, 'User not found');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: payload.email },
      data: {
        password: hashedPassword,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...res } = user;

    return res;
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });

    if (!user) {
      throw new ApiError(
        400,
        'Invalid refresh token or user already logged out',
      );
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: '' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...res } = user;

    return res;
  }
  async refresh(refreshToken: string) {
    const { valid, payload } = await verifyToken(refreshToken);

    if (valid) {
      const user = await prisma.user.findUnique({
        where: { id: Number(payload.id) },
      });

      if (!user) {
        throw new ApiError(400, 'User does not exist. Please Register');
      }

      const [accessToken, newRefreshToken] = await Promise.all([
        generateToken('1d', {
          email: user.email,
          id: user.id,
          type: 'access',
        }),
        generateToken('7d', {
          email: user.email,
          id: user.id,
          type: 'refresh',
        }),
      ]);
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...res } = updatedUser;

      return res;
    }
    throw new ApiError(400, 'Invalid or expired refresh token');
  }

  async google(token: string) {
    if (!token) {
      throw new ApiError(400, 'Google token is required');
    }
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
    );
    const data = googleResponse.data as {
      email: string;
      name: string;
      picture: string;
    };
    const { email, name, picture } = data;

    if (!email) {
      throw new ApiResponse(400, null, 'Google account email not found');
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.provider !== 'GOOGLE') {
        throw new ApiResponse(
          403,
          null,
          `This email is already registered using ${user.provider}. Please use the correct login method.`,
        );
      }

      const [access_token, refresh_token] = await Promise.all([
        generateToken('1d', {
          email: user.email,
          id: user.id,
          type: 'access',
        }),
        generateToken('7d', {
          email: user.email,
          id: user.id,
          type: 'refresh',
        }),
      ]);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          last_login: new Date(),
          profile: picture,
          access_token,
          refresh_token,
        },
      });

      return {
        user: updatedUser,
        access_token,
        refresh_token,
        message: 'Login successful',
      };
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name,
        password: hashedPassword,
        profile: picture,
        provider: 'GOOGLE',
        last_login: new Date(),
        is_active: true,
        is_verify: true,
      },
    });

    const [access_token, refresh_token] = await Promise.all([
      generateToken('1d', {
        email: newUser.email,
        id: newUser.id,
        type: 'access',
      }),
      generateToken('7d', {
        email: newUser.email,
        id: newUser.id,
        type: 'refresh',
      }),
    ]);

    await prisma.user.update({
      where: { id: newUser.id },
      data: { access_token, refresh_token },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...res } = newUser;
    return {
      user: res,
      access_token,
      refresh_token,
      message: 'Signup successfully',
    };
  }

  async update_user(userId: number, data: Partial<User>) {
    const updateUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password, ...safeUser } = updateUser;
    console.log(password);

    return safeUser;
  }

  async get_user(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const { password, ...safeUser } = user;
    console.log(password);
    return safeUser;
  }
  async delete_user(userId: number) {
    const user = await prisma.user.delete({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

export const authService = new AuthService();
