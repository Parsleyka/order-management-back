const { createError, handleApiError } = require("../utils/errorHelper");

const notFound = (req, res) => {
    const error = createError({
        message: "Route not found",
        statusCode: 404
    });

    handleApiError(req, res, error);
};

module.exports = {
    notFound
};