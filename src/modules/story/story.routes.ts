import { Router } from 'express';
import { storyController } from './story.controller.js';
import { authentication } from '../../middleware/auth.middleware.js';
import { multerHost } from '../../middleware/multer.middleware.js';

const storyRouter = Router();

storyRouter.use(authentication());

storyRouter.post('/', 
    multerHost().single('media'), 
    storyController.createStory.bind(storyController)
);

storyRouter.get('/', storyController.getActiveStories.bind(storyController));

storyRouter.patch('/:storyId/view', storyController.markAsViewed.bind(storyController));

export default storyRouter;
