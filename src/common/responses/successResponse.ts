import type { Response } from 'express';

export interface ISuccessResponse<T> {
    status: 'success';
    message: string;
    code: number;
    data: T | null;
}

export const successResponse = <T>(
    res: Response,
    data: T | null = null,
    message: string = 'Success',
    code: number = 200
): Response<ISuccessResponse<T>> => {
    return res.status(code).json({
        status: 'success',
        message,
        code,
        data
    });
};
