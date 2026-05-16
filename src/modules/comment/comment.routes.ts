import { Router } from 'express';
import { commentController } from './comment.controller.js';
import { authentication } from '../../middleware/auth.middleware.js';
import { validation } from '../../middleware/index.js';
import { createCommentSchema, updateCommentSchema, commentIdSchema, postIdParamsSchema, replyCommentSchema } from './comment.validation.js';
import { multerHost } from '../../middleware/multer.middleware.js';

const commentRouter = Router();

commentRouter.use(authentication());

commentRouter.post('/', 
    multerHost().array('attachments', 5), 
    validation(createCommentSchema), 
    commentController.createComment.bind(commentController)
);

commentRouter.post('/:commentId', 
    multerHost().array('attachments', 5), 
    validation(replyCommentSchema), 
    commentController.replyToComment.bind(commentController)
);

commentRouter.get('/post/:postId', 
    validation(postIdParamsSchema), 
    commentController.getCommentsByPost.bind(commentController)
);

commentRouter.patch('/:commentId', 
    validation(commentIdSchema), 
    validation(updateCommentSchema), 
    commentController.updateComment.bind(commentController)
);

commentRouter.delete('/:commentId', 
    validation(commentIdSchema), 
    commentController.deleteComment.bind(commentController)
);

commentRouter.patch('/:commentId/like', 
    validation(commentIdSchema), 
    commentController.likeComment.bind(commentController)
);

export default commentRouter;
