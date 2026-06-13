import { Router } from 'express';
import { chatController } from './chat.controller.js';
import { authentication } from '../../middleware/auth.middleware.js';
import { validation } from '../../middleware/index.js';
import { createGroupChatSchema, sendMessageSchema, getChatHistorySchema } from './chat.validation.js';
import { multerMemory } from '../../middleware/multer.middleware.js';

const chatRouter = Router();

// All routes under this router require authentication
chatRouter.use(authentication());

/**
 * @route  POST /chat/create-group
 * @desc   Create a new group chat with name, participants list, and optional avatar image
 * @access Private
 */
chatRouter.post(
    '/create-group',
    multerMemory().single('groupImage'),
    validation(createGroupChatSchema),
    chatController.createGroupChat.bind(chatController)
);

/**
 * @route  GET /chat/my-groups
 * @desc   Get all group chats the authenticated user belongs to
 * @access Private
 */
chatRouter.get(
    '/my-groups',
    chatController.getMyGroups.bind(chatController)
);

/**
 * @route  GET /chat/room/:roomID/messages
 * @desc   Get paginated message history for a chat room
 * @query  page (default: 1), limit (default: 50)
 * @access Private – participants only
 */
chatRouter.get(
    '/room/:roomID/messages',
    validation(getChatHistorySchema),
    chatController.getChatHistory.bind(chatController)
);

/**
 * @route  POST /chat/room/:roomID/messages
 * @desc   Send a message to a chat room (supports optional file attachment)
 * @access Private – participants only
 */
chatRouter.post(
    '/room/:roomID/messages',
    multerMemory().single('attachment'),
    validation(sendMessageSchema),
    chatController.sendMessage.bind(chatController)
);

export default chatRouter;
