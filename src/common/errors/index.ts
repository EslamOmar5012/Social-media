import { ApiError } from '../utils/ApiError.utils.js';

export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found', data?: any) {
        super(message, 404, data);
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad Request', data?: any) {
        super(message, 400, data);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized', data?: any) {
        super(message, 401, data);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string = 'Forbidden', data?: any) {
        super(message, 403, data);
    }
}

export class ConflictError extends ApiError {
    constructor(message: string = 'Conflict', data?: any) {
        super(message, 409, data);
    }
}

export class InternalServerError extends ApiError {
    constructor(message: string = 'Internal Server Error', data?: any) {
        super(message, 500, data);
    }
}
