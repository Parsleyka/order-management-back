const { Router } = require("express");
const orderController = require("../controllers/orderController");

const router = new Router();

router.post("/orders", orderController.postOrder);
router.get("/orders/:userId", orderController.getOrderByUserId);

module.exports = router;