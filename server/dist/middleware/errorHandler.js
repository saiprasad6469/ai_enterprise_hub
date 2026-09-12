"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, _req, res, _next) => {
    // Default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors = undefined;
    if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        const mongooseErr = err;
        errors = Object.values(mongooseErr.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const keyValue = err.keyValue;
        const field = Object.keys(keyValue)[0];
        message = `Duplicate value for "${field}": "${keyValue[field]}". This value already exists.`;
    }
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ID format: ${err.value}`;
    }
    // JWT errors are handled in auth middleware, but catch stragglers
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token.';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired.';
    }
    console.error(`[${statusCode}] ${message}`, process.env.NODE_ENV === 'development' ? err.stack : '');
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map