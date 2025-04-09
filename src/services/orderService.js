const prisma = require("../config/database");
const { createError } = require("../utils/errorHelper");

const getOrdersByUserIdService = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw createError({
            message: "User not found",
            statusCode: 404
        });
    }

    return prisma.order.findMany({
        where: { userId },
        include: {
            product: true,
            user: true
        }
    });
};

const postOrder = async (postOrderInput) => {
    const { userId, productId, quantity} = postOrderInput;
    const quantityNumber = parseInt(quantity)

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!user) {
        throw createError({
            message: "User not found",
            statusCode: 404
        });
    }

    if (!product) {
        throw createError({
            message: "Product not found",
            statusCode: 404
        });
    }

    const totalPrice = product.price * quantityNumber;

    if (user.balance < totalPrice) {
        throw createError({
            message: "Insufficient balance.",
            statusCode: 422
        });
    }

    if (product.stock < quantity) {
        throw createError({
            message: "Insufficient stock for product.",
            statusCode: 422
        });
    }

    return prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: totalPrice
                }
            }
        });

        await tx.product.update({
            where: { id: productId },
            data: {
                stock: {
                    decrement: quantityNumber
                }
            }
        });

        return tx.order.create({
            data: {
                quantity: quantityNumber,
                totalPrice,
                userId,
                productId
            }
        });
    });
};

module.exports = {
    getOrdersByUserIdService,
    postOrder
};