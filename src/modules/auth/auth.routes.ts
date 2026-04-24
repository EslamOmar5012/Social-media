import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validation } from '../../middleware/index.js';
import { signupSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post('/signup', validation(signupSchema), authController.signup.bind(authController));
router.post('/login', validation(loginSchema), authController.login.bind(authController));

export default router;
