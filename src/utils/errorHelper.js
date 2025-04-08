const { Prisma } = require("@prisma/client");

const createError = (errorObj) => {
    const error = new Error(errorObj.message);

    error.statusCode = errorObj.statusCode;

    return error;
};

const handleApiError = (res, error, defaultMessage = "An internal server error occurred.") => {
    let statusCode = error.statusCode || 500;
    let message = error.message || defaultMessage;

    if (error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = `Database error: ${message}`;
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        error: {
            message: message
        }
    });
};

module.exports = {
    createError,
    handleApiError
};