import { type ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../common/index.js';

export type ValidationSchema = Partial<Record<keyof Request, ZodType>>;

/**
 * Strategy Pattern for Validation
 * Validates request parts (body, query, params, headers) using Zod schemas.
 */
export function validation(validationSchema: ValidationSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrs: any[] = [];

        for (const key in validationSchema) {
            const validationResult = validationSchema[key as keyof Request]!.safeParse(req[key as keyof Request]);
            
            if (!validationResult.success) {
                validationResult.error.issues.forEach((issue) => {
                    validationErrs.push({
                        field: issue.path.join('.'),
                        message: issue.message
                    });
                });
            }
        }

        if (validationErrs.length > 0) {
            return next(new BadRequestError("invalid validation", { validationErrs }));
        }

        next();
    };
}
