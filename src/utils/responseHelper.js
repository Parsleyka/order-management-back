const sendResponse = (res, body) => {
    return res.json({
        success: true,
        status: 200,
        body: body
    });
};

module.exports = {
    sendResponse: sendResponse
};