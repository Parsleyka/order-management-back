const orderService = require("../services/orderService");
const { handleApiError } = require("../utils/errorHelper");
const { sendResponse } = require("../utils/responseHelper");

const postOrder = async (req, res) => {
    const body = req.body;

    try {
        const order = await orderService.postOrder(body);

        sendResponse(res, order);
    } catch (error) {
        handleApiError(req, res, error);
    }
};

const getOrderByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await orderService.getOrdersByUserIdService(userId);

        sendResponse(res, orders);
    } catch (error) {
        handleApiError(req, res, error);
    }
};

module.exports = {
    getOrderByUserId,
    postOrder
};