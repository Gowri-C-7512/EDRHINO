import { Router } from 'express';
import { authController } from '../controller/auth.controller';
import { verifyjwt } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import Promisify from '../utils/Promisify';

const authRouter = Router();

authRouter.route('/register').post(Promisify(authController.register));
authRouter.route('/otp-verify').post(Promisify(authController.verifyOtp));
authRouter.route('/login').post(Promisify(authController.login));
authRouter
  .route('/forgot-password')
  .post(Promisify(authController.forgotPassword));
authRouter
  .route('/reset-password')
  .post(Promisify(authController.resetPassword));
authRouter.route('/logout').post(Promisify(authController.logout));
authRouter.route('/refresh').post(Promisify(authController.refresh));
authRouter.route('/google').post(Promisify(authController.google));
authRouter
  .route('/user-profile')
  .patch(
    verifyjwt,
    upload.single('profile'),
    Promisify(authController.updateUser),
  );
authRouter.route('/profile').get(verifyjwt, Promisify(authController.getUser));
authRouter
  .route('/deleteProfile')
  .delete(verifyjwt, Promisify(authController.deleteUser));
export { authRouter };
