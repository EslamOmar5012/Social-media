import type { Response } from 'express';

export const errorResponse = (res: Response, error: any) => {
    const code = error.code || 500;
    const message = error.message || 'Internal Server Error';
    const data = error.data || null;

    return res.status(code).json({
        status: 'error',
        message,
        code,
        ...(data && { data })
    });
};
