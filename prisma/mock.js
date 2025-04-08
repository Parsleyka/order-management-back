const { PrismaClient } = require("@prisma/client");

(async function mock() {
    const prisma = new PrismaClient()

    console.log('Start Mocking');

    try {
        const alice = await prisma.user.create({
            data: {
                name: "Alice",
                email: "alice@example.com",
                balance: 150.00
            }
        });

        const book = await prisma.product.create({
            data: {
                name: "Book",
                price: 25.99,
                stock: 100
            }
        });

        await prisma.order.create({
            data: {
                quantity: 2,
                totalPrice: 51.98,
                userId: alice.id,
                productId: book.id
            }
        });

        console.log('Mocked');

    } catch (error) {
        console.log('Mocking failed');
        console.error(error);
    }
})();
