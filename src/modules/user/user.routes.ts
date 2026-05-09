import { Router } from 'express';
import { userController } from './user.controller.js';
import { authentication, authorization } from '../../middleware/auth.middleware.js';
import { Role } from '../../common/index.js';
import { multerHost } from '../../middleware/multer.middleware.js';

const router = Router();

router.get('/profile', authentication(), userController.getProfile.bind(userController));

router.patch('/profile-pic', 
    authentication(), 
    multerHost().single('profilePic'), 
    userController.updateProfilePic.bind(userController)
);

router.patch('/cover-pics', 
    authentication(), 
    multerHost().array('coverPics', 5), 
    userController.updateCoverPics.bind(userController)
);

router.get('/download/:type', 
    authentication(), 
    userController.downloadImage.bind(userController)
);

router.delete('/image/:type', 
    authentication(), 
    userController.deleteImage.bind(userController)
);

router.delete('/soft/:userId', 
    authentication(), 
    authorization([Role.ADMIN]), 
    userController.softDeleteUser.bind(userController)
);

router.delete('/hard/:userId', 
    authentication(), 
    authorization([Role.ADMIN]), 
    userController.hardDeleteUser.bind(userController)
);

router.patch('/restore/:userId', 
    authentication(), 
    authorization([Role.ADMIN]), 
    userController.restoreUser.bind(userController)
);

export default router;
