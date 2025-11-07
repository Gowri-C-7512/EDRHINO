import { validate } from 'class-validator';
import { Request, Response } from 'express';
import path from 'path';
import {
  ForgotRequestDTO,
  GoogleSignInDTO,
  LoginRequestDTO,
  LogoutRequestDTO,
  ProfileRequestDTO,
  RefreshRequestDTO,
  RegisterRequestDTO,
  ResetRequestDTO,
} from '../dto/auth.dto';
import { WithUserRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { getStaticFilePath } from '../utils/help.utils';
import logger from '../utils/winston.logger';

class AuthController {
  async register(req: Request, res: Response) {
    const RegisterUserRequest = new RegisterRequestDTO();
    Object.assign(RegisterUserRequest, req.body);

    const error = await validate(RegisterUserRequest);
    if (error.length > 0) {
      throw new ApiError(
        400,
        'It looks like some information is incorrect or missing. Please check and try again.',
        error,
      );
    }

    const userData: RegisterRequestDTO = req.body;
    const user = await authService.register(userData);

    return res
      .status(200)
      .json(new ApiResponse(201, user, 'register successfully'));
  }

  verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'email and OTP are required'));
    }

    const result = await authService.verifyOtp(email, Number(otp));

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'otp verified successfully'));
  };

  async login(req: Request, res: Response) {
    const LoginUserRequest = new LoginRequestDTO();
    Object.assign(LoginUserRequest, req.body);

    const error = await validate(LoginUserRequest);
    if (error.length > 0) {
      throw new ApiError(400, 'invalid inputs', error);
    }

    const { email, password } = LoginUserRequest;
    const user = await authService.login(email, password);

    return res
      .status(201)
      .json(new ApiResponse(201, user, 'login successfully'));
  }

  async forgotPassword(req: Request, res: Response) {
    const ForgotUserRequest = new ForgotRequestDTO();
    Object.assign(ForgotUserRequest, req.body);

    const errors = await validate(ForgotUserRequest);
    if (errors.length > 0) throw new ApiError(400, 'Invalid email', errors);

    const user = await authService.forgot(ForgotUserRequest.email);

    return res
      .status(200)
      .json(new ApiResponse(200, user, 'link sent to your email'));
  }

  async resetPassword(req: Request, res: Response) {
    const ResetUserPassword = new ResetRequestDTO();
    Object.assign(ResetUserPassword, req.body);

    const errors = await validate(ResetUserPassword);
    if (errors.length > 0)
      throw new ApiError(400, 'Invalid password reset request', errors);

    const { newPassword, token } = req.body;
    const result = await authService.resetPassword(newPassword, token);

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'Password changed successfully'));
  }

  async logout(req: Request, res: Response) {
    const logoutRequest = new LogoutRequestDTO();
    Object.assign(logoutRequest, req.body);

    const error = await validate(logoutRequest);
    if (error.length > 0) {
      throw new ApiError(400, 'invalid inputs', error);
    }

    const { refreshToken } = logoutRequest;
    const result = await authService.logout(refreshToken);

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'logout successfully'));
  }

  async refresh(req: Request, res: Response) {
    const RefreshUserRequest = new RefreshRequestDTO();
    Object.assign(RefreshUserRequest, req.body);

    const error = await validate(RefreshUserRequest);
    if (error.length > 0) throw new ApiError(400, 'invalid Token', error);

    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'refresh successfully'));
  }

  async google(req: Request, res: Response) {
    const GoogleUserLogin = new GoogleSignInDTO();
    Object.assign(GoogleUserLogin, req.body);

    const error = await validate(GoogleUserLogin);
    if (error.length > 0) throw new ApiError(400, 'invalid Token', error);

    const { token } = req.body;
    const result = await authService.google(token);

    return res.status(200).json(new ApiResponse(200, result, result.message));
  }

  async updateUser(req: WithUserRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    const ProfileRequest = new ProfileRequestDTO();
    Object.assign(ProfileRequest, req.body);
    const error = await validate(ProfileRequest);
    if (error.length > 0) {
      throw new ApiError(400, 'invalid inputs', error);
    }
    let file_name = ' ';
    const userData: ProfileRequestDTO = req.body;
    if (req.file) {
      const fileData = req.file;

      const file_url = fileData
        ? getStaticFilePath(req, fileData.filename)
        : '';
      userData.profile = file_url;
      file_name = fileData.filename;
      if (file_name) {
        const ext = path.extname(file_name).toLowerCase();
        logger.info(`ext:${ext}`);
      }
      logger.info(`filename ${file_name}`);
    }
    const updatedUser = await authService.update_user(userId, userData);

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, 'User updated successfully'));
  }

  async getUser(req: WithUserRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    const user = await authService.get_user(userId);
    return res.status(200).json(new ApiResponse(200, user, 'User found'));
  }

  async deleteUser(req: WithUserRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    const user = await authService.delete_user(userId);
    return res.status(200).json(new ApiResponse(200, user, 'User deleted'));
  }
}
const authController = new AuthController();
export { authController };
