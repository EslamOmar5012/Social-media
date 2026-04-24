export class ApiError extends Error {
    public code: number;
    public data?: any;

    constructor(message: string, code: number, data?: any) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
