import express from 'express';
import { createServer } from 'http';
import type { Application, Request, Response, NextFunction } from 'express';
import { envVars } from './config/index.js';
import { socketService } from './common/services/socket.service.js';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import notificationRouter from './modules/notification/notification.routes.js';
import postRouter from './modules/post/post.routes.js';
import commentRouter from './modules/comment/comment.routes.js';
import storyRouter from './modules/story/story.routes.js';
import chatRouter from './modules/chat/chat.routes.js';
import { connectDB, connectRedis } from './db/index.js';
import { NotFoundError } from './common/index.js';
import { globalErrorHandler, authentication } from './middleware/index.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import cors from 'cors';

export const bootstrap = async () => {

    // Database Connection
    await connectDB();
    await connectRedis();

    const app: Application = express();
    
    // GraphQL Setup
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();


    const port = envVars.port;
    const corsOrigin = envVars.corsOrigin;
    const cleanOrigin = corsOrigin.endsWith('/') ? corsOrigin.slice(0, -1) : corsOrigin;

    // Middleware
    app.use(cors({
        origin: cleanOrigin,
        credentials: true
    }));
    app.use(express.json());
    app.use('/graphql', authentication(), express.json(), expressMiddleware(server, {
        context: async ({ req }) => ({ user: (req as any).user })
    }));
    app.use('/uploads', express.static('uploads'));

    // Routes
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/post', postRouter);
    app.use('/comment', commentRouter);
    app.use('/story', storyRouter);
    app.use('/notification', notificationRouter);
    app.use('/chat', chatRouter);

    // Basic route

    app.get('/', (req: Request, res: Response, next: NextFunction): void => {
        res.status(200).json({ message: 'Welcome to the Social Media API' });
    });

    // 404 Handler
    app.use((req: Request, res: Response, next: NextFunction) => {
        next(new NotFoundError(`Route ${req.originalUrl} not found`));
    });


    // Global Error Handler
    app.use(globalErrorHandler);


    // Start server
    const httpServer = createServer(app);
    socketService.init(httpServer);

    httpServer.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    }).on('error', (err: any) => {
        console.error('[server]: Failed to start server:', err);
    });
};



