import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import { envVars } from './config/index.js';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import notificationRouter from './modules/notification/notification.routes.js';
import postRouter from './modules/post/post.routes.js';
import commentRouter from './modules/comment/comment.routes.js';
import storyRouter from './modules/story/story.routes.js';
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

    // Middleware
    app.use(express.json());
    app.use('/graphql', authentication(), cors<any>(), express.json(), expressMiddleware(server));
    app.use('/uploads', express.static('uploads'));

    // Routes
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/post', postRouter);
    app.use('/comment', commentRouter);
    app.use('/story', storyRouter);
    app.use('/notification', notificationRouter);

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

    app.listen(port, (err?: any) => {
        if (err) 
            return console.error('[server]: Failed to start server:', err);

        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
};



