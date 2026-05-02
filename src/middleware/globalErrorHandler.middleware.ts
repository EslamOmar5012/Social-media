import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../common/responses/errorResponse.js';

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error for development/debugging
    if (process.env['NODE_ENV'] !== 'production') {
        console.error('Error Stack:', err.stack);
    }

    // Use the predefined errorResponse utility
    return errorResponse(res, {
        code: err.statusCode || err.status || (typeof err.code === 'number' ? err.code : 500),
        message: err.message || 'Internal Server Error',
        data: err.data || null
    });
};
