const rateLimit = require("express-rate-limit");
const { createError, handleApiError } = require("../utils/errorHelper");

const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => req?.body?.userId || req?.params?.userId || req?.ip,
    handler: (req, res, next, options) => {
        const error = createError({
            message: options.message,
            statusCode: options.statusCode
        });

        handleApiError(res, error);
    }
});

module.exports = {
    rateLimiter
};