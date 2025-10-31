import { User } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import { QuestionRequestDTO, RegisterRequestDTO } from '../dto/auth.dto';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import {
  generateOTP,
  sendOTPEmail,
  sendVerificationEmail,
} from '../utils/email.utils';
import { generateToken, verifyToken } from '../utils/token';
class AuthService {
  register = async (user: RegisterRequestDTO) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ApiError(400, 'User already exists. Please login');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
        last_login: new Date(),
        is_active: true,
      },
    });
    const [accessToken, refreshToken] = await Promise.all([
      generateToken('1d', {
        email: user.email,
        id: newUser.id,
        type: 'access',
      }),
      generateToken('7d', {
        email: user.email,
        id: newUser.id,
        type: 'refresh',
      }),
    ]);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        otp,
        otp_expiry: otpExpiry,
      },
    });
    await sendOTPEmail(user.email, otp.toString());

    return newUser;
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
        is_active: true,
        otp: 0,
        otp_expiry: null,
      },
    });
    return updatedUser;
  };

  login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(user);
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
    return updatedUser;
  };

  forgot = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const token = await generateToken('10m', {
      email: user.email,
      id: user.id,
      type: 'access',
    });
    await sendVerificationEmail(email, token);
    return user;
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

    await prisma.user.update({
      where: { email: payload.email },
      data: {
        password: newPassword,
      },
    });
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

    return user;
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
      return updatedUser;
    }
    throw new ApiError(400, 'Invalid or expired refresh token');
  }

  async question(userData: QuestionRequestDTO) {
    if (!userData.token) throw new ApiError(400, 'token required');

    const { payload } = await verifyToken(userData.token);

    if (!payload.email) {
      throw new ApiError(400, 'token does not match this user');
    }
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) throw new ApiError(404, 'User not found');

    const userUpdated = await prisma.user.update({
      where: { email: payload.email },
      data: {
        subject: userData.subject,
        standard: userData.standard,
      },
    });
    return userUpdated;
  }

  async update_user(userId: number, updateData: Partial<User>) {
    console.log(updateData, 'update');
    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    const { password, ...safeUser } = updateUser;
    console.log(password);

    return safeUser;
  }

  async google(token: string) {
    if (!token) {
      throw new ApiError(400, 'Google token is required');
    }
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
    );
    const { email, name, family_name, given_name, picture } =
      googleResponse.data;
    if (!email) {
      throw new ApiResponse(400, null, 'Google account email not found');
    }
    const user = await UserModel.findOne({ email });
    if (user) {
      if (user.provider !== 'google') {
        throw new ApiResponse(
          403,
          null,
          `This email is already registered using ${user.provider}. Please use the correct login method.`,
        );
      } else {
        const [accessToken, refreshToken] = await Promise.all([
          generateToken('1d', {
            email: user.email,
            userid: user.id,
            type: 'access',
          }),
          generateToken('7d', {
            email: user.email,
            userid: user.id,
            type: 'refresh',
          }),
        ]);

        await UserModel.findByIdAndUpdate(
          user.id,
          {
            last_login: new Date(),
            profile_picture: picture,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
          { new: true },
        );

        return {
          user,
          accessToken,
          refreshToken,
          message: 'Login successful',
        };
      }
    } else {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = await UserModel.create({
        email,
        full_name: given_name || name,
        last_name: family_name,
        password: hashedPassword,
        profile_picture: picture,
        provider: 'google',
        timezone: 'asia',
        last_login: new Date(),
        is_active: true,
        is_verified: true,
      });

      const [accessToken, refreshToken] = await Promise.all([
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
      newUser.accessToken = accessToken;
      newUser.refreshToken = refreshToken;
      await newUser.save();
      return {
        user: newUser,
        accessToken,
        refreshToken,
        message: 'Signup successfully',
      };
    }
  }
}

export const authService = new AuthService();
