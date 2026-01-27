"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync(req.query);
            req.query = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'Query validation failed',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync(req.params);
            req.params = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'Parameter validation failed',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validate.middleware.js.map