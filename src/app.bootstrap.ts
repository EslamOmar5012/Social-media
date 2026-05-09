import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import { envVars } from './config/index.js';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import { connectDB, connectRedis } from './db/index.js';
import { NotFoundError } from './common/index.js';
import { globalErrorHandler } from './middleware/index.js';

export const bootstrap = async () => {

    // Database Connection
    await connectDB();
    await connectRedis();

    const app: Application = express();


    const port = envVars.port;

    // Middleware
    app.use(express.json());
    app.use('/uploads', express.static('uploads'));

    // Routes
    app.use('/auth', authRouter);
    app.use('/user', userRouter);

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



