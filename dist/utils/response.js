"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginated = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, errors) => {
    const response = {
        success: false,
        error: message,
        errors,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendPaginated = (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Total-Pages', totalPages.toString());
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    });
};
exports.sendPaginated = sendPaginated;
//# sourceMappingURL=response.js.map