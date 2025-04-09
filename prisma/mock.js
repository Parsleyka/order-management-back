const { PrismaClient } = require("@prisma/client");

(async function mock() {
    const prisma = new PrismaClient();

    console.log("Start Mocking");

    try {
        const user = await prisma.user.create({
            data: {
                name: "TestUser",
                email: "test@test.com",
                balance: 150.00
            }
        });

        const product = await prisma.product.create({
            data: {
                name: "TestProduct",
                price: 25.99,
                stock: 100
            }
        });

        const quantity = 2;
        const totalPrice = product.price * 2;

        await prisma.order.create({
            data: {
                quantity: quantity,
                totalPrice: totalPrice,
                userId: user.id,
                productId: product.id
            }
        });

        console.log("Mocked");
    } catch (error) {
        console.log("Mocking failed");
        console.error(error);
    }
})();
