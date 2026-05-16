import { Router } from 'express';
import { postController } from './post.controller.js';
import { authentication } from '../../middleware/auth.middleware.js';
import { validation } from '../../middleware/index.js';
import { createPostSchema, updatePostSchema, postIdSchema, getAllPostsSchema } from './post.validation.js';
import { multerHost } from '../../middleware/multer.middleware.js';

const postRouter = Router();

postRouter.use(authentication());

postRouter.post('/', 
    multerHost().array('attachments', 10), 
    validation(createPostSchema), 
    postController.createPost.bind(postController)
);

postRouter.get('/', validation(getAllPostsSchema), postController.getAllPosts.bind(postController));

postRouter.get('/:postId', 
    validation(postIdSchema), 
    postController.getPostById.bind(postController)
);

postRouter.patch('/:postId', 
    validation(postIdSchema), 
    validation(updatePostSchema), 
    postController.updatePost.bind(postController)
);

postRouter.delete('/:postId', 
    validation(postIdSchema), 
    postController.deletePost.bind(postController)
);

postRouter.patch('/:postId/like', 
    validation(postIdSchema), 
    postController.likePost.bind(postController)
);

export default postRouter;
