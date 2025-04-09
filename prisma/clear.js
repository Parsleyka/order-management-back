const { PrismaClient } = require("@prisma/client");

(async function clear() {
    const prisma = new PrismaClient();

    console.log("Start clearing");

    try {
        await prisma.order.deleteMany();
        await prisma.product.deleteMany();
        await prisma.user.deleteMany();

        console.log("Cleared");
    } catch (error) {
        console.log("Clearing failed");
        console.error(error);
    }
})();
