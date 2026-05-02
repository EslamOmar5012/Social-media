import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validation } from '../../middleware/index.js';
import { authentication } from '../../middleware/auth.middleware.js';
import { signupSchema, loginSchema, confirmEmailSchema, resendConfirmEmailSchema, forgotPasswordSchema, resetPasswordSchema, logoutSchema } from './auth.validation.js';

const router = Router();

router.post('/signup', validation(signupSchema), authController.signup.bind(authController));
router.post('/login', validation(loginSchema), authController.login.bind(authController));
router.post('/confirm-email', validation(confirmEmailSchema), authController.confirmEmail.bind(authController));
router.post('/resend-confirm-email', validation(resendConfirmEmailSchema), authController.resendConfirmEmail.bind(authController));
router.post('/forgot-password', validation(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.patch('/reset-password', validation(resetPasswordSchema), authController.resetPassword.bind(authController));
router.patch('/logout', authentication(), validation(logoutSchema), authController.logout.bind(authController));

export default router;
