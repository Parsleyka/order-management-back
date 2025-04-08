const orderService = require("../services/orderService");
const { handleApiError } = require("../utils/errorHelper");

const postOrder = async (req, res) => {
    const body = req.body;

    try {
        const order = await orderService.postOrder(body);

        return res.json(order);
    } catch (error) {
        handleApiError(res, error)
    }
}

const getOrderByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await orderService.getOrdersByUserIdService(userId);

        return res.json(orders);
    } catch (error) {
        handleApiError(res, error)
    }
}

module.exports = {
    getOrderByUserId,
    postOrder
};