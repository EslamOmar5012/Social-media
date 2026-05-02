import type { Response } from 'express';

export const errorResponse = (res: Response, error: any) => {
    let code = parseInt(error.code) || 500;
    if (code < 100 || code > 599) code = 500; // Ensure it's a valid HTTP status code
    const message = error.message || 'Internal Server Error';
    const data = error.data || null;

    return res.status(code).json({
        status: 'error',
        message,
        code,
        ...(data && { data })
    });
};
