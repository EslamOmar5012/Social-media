import { Router } from 'express';
import { userController } from './user.controller.js';
import { authentication } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authentication(), userController.getProfile.bind(userController));

export default router;
