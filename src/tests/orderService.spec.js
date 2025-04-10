const FILE_PATH = "../services/orderService";

const { Prisma } = require('@prisma/client');

const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const prismaMock = {
    user: {
        findUnique: sinon.stub(),
        update: sinon.stub()
    },
    product: {
        findUnique: sinon.stub(),
        update: sinon.stub()
    },
    order: {
        findMany: sinon.stub(),
        create: sinon.stub()
    },
    $transaction: sinon.stub()
};

const errorHelperMock = {
    createError: sinon.stub()
};

const orderService = proxyquire(FILE_PATH, {
    "../config/database": prismaMock,
    "../utils/errorHelper": errorHelperMock
});

describe('Order Service', () => {
    beforeEach(() => {
        sinon.resetHistory();

        prismaMock.user.findUnique.reset();
        prismaMock.product.findUnique.reset();
        prismaMock.order.findMany.reset();
        prismaMock.user.update.reset();
        prismaMock.product.update.reset();
        prismaMock.order.create.reset();
        prismaMock.$transaction.reset();

        errorHelperMock.createError.reset();
        errorHelperMock.createError.callsFake(({ message, statusCode }) => {
            const error = new Error(message);
            error.statusCode = statusCode;
            return error;
        });
    });

    describe('getOrdersByUserIdService', () => {
        const testUserId = 'user-uuid-123';

        it('should call prisma.user.findUnique with the correct userId', async () => {
            prismaMock.user.findUnique.resolves({ id: testUserId, name: 'Test User' });
            prismaMock.order.findMany.resolves([]);

            await orderService.getOrdersByUserIdService(testUserId);

            expect(prismaMock.user.findUnique.calledOnceWith({ where: { id: testUserId } })).to.be.true;
        });

        it('should throw a 404 error via createError if user is not found', async () => {
            prismaMock.user.findUnique.resolves(null);

            try {
                await orderService.getOrdersByUserIdService(testUserId);

                expect.fail('Expected function to throw an error, but it did not.');
            } catch (error) {
                expect(errorHelperMock.createError.calledOnce).to.be.true;
                expect(errorHelperMock.createError.calledOnceWith({
                    message: "User not found",
                    statusCode: 404
                })).to.be.true;

                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal("User not found");
                expect(prismaMock.order.findMany.called).to.be.false;
            }
        });

        it('should call prisma.order.findMany with correct args if user is found', async () => {
            const mockUser = { id: testUserId, name: 'Test User' };
            prismaMock.user.findUnique.resolves(mockUser);
            prismaMock.order.findMany.resolves([]);

            await orderService.getOrdersByUserIdService(testUserId);

            expect(prismaMock.order.findMany.calledOnce).to.be.true;
            expect(prismaMock.order.findMany.calledOnceWith({
                where: { userId: testUserId },
                include: {
                    product: true,
                    user: true
                }
            })).to.be.true;
        });

        it('should return the result of prisma.order.findMany if user is found', async () => {
            const mockUser = { id: testUserId, name: 'Test User' };
            const mockOrders = [{ id: 'order1', quantity: 1 }, { id: 'order2', quantity: 2 }];
            prismaMock.user.findUnique.resolves(mockUser);
            prismaMock.order.findMany.resolves(mockOrders);

            const result = await orderService.getOrdersByUserIdService(testUserId);

            expect(result).to.deep.equal(mockOrders);
            expect(errorHelperMock.createError.called).to.be.false;
        });
    });

    describe('postOrder', () => {
        const testInput = {
            userId: 'user-uuid-456',
            productId: 'prod-uuid-789',
            quantity: '2'
        };
        const quantityNumber = 2;
        const mockUser = { id: testInput.userId, name: 'Test User', balance: new Prisma.Decimal(100.00) };
        const mockProduct = { id: testInput.productId, name: 'Test Product', price: new Prisma.Decimal(20.00), stock: 10 };
        const totalPrice = mockProduct.price * quantityNumber;

        beforeEach(() => {
            prismaMock.$transaction.callsFake(async (callback) => {

                const txMock = {
                    user: { update: prismaMock.user.update },
                    product: { update: prismaMock.product.update },
                    order: { create: prismaMock.order.create }
                };

                prismaMock.user.update.resolves({});
                prismaMock.product.update.resolves({});
                prismaMock.order.create.resolves({
                    id: 'new-order-uuid',
                    ...testInput,
                    quantity: quantityNumber,
                    totalPrice: totalPrice
                });

                return await callback(txMock);
            });
        });

        it('should find user and product with correct IDs', async () => {
            prismaMock.user.findUnique.resolves(mockUser);
            prismaMock.product.findUnique.resolves(mockProduct);

            await orderService.postOrder(testInput);

            expect(prismaMock.user.findUnique.calledOnceWith({ where: { id: testInput.userId } })).to.be.true;
            expect(prismaMock.product.findUnique.calledOnceWith({ where: { id: testInput.productId } })).to.be.true;
        });

        it('should throw 404 via createError if user not found', async () => {
            prismaMock.user.findUnique.resolves(null);
            prismaMock.product.findUnique.resolves(mockProduct);

            try {
                await orderService.postOrder(testInput);
                expect.fail('Expected function to throw');
            } catch (error) {
                expect(errorHelperMock.createError.calledOnceWith({ message: "User not found", statusCode: 404 })).to.be.true;
                expect(prismaMock.$transaction.called).to.be.false;
            }
        });

        it('should throw 404 via createError if product not found', async () => {
            prismaMock.user.findUnique.resolves(mockUser);
            prismaMock.product.findUnique.resolves(null);

            try {
                await orderService.postOrder(testInput);
                expect.fail('Expected function to throw');
            } catch (error) {
                expect(errorHelperMock.createError.calledOnceWith({ message: "Product not found", statusCode: 404 })).to.be.true;
                expect(prismaMock.$transaction.called).to.be.false;
            }
        });

        it('should throw 422 via createError if balance is insufficient', async () => {
            const lowBalanceUser = { ...mockUser, balance: new Prisma.Decimal(10.00) };
            prismaMock.user.findUnique.resolves(lowBalanceUser);
            prismaMock.product.findUnique.resolves(mockProduct);

            try {
                await orderService.postOrder(testInput);
                expect.fail('Expected function to throw');
            } catch (error) {
                expect(errorHelperMock.createError.calledOnceWith({ message: "Insufficient balance.", statusCode: 422 })).to.be.true;
                expect(prismaMock.$transaction.called).to.be.false;
            }
        });

        it('should throw 422 via createError if stock is insufficient', async () => {
            const lowStockProduct = { ...mockProduct, stock: 1 };
            prismaMock.user.findUnique.resolves(mockUser);
            prismaMock.product.findUnique.resolves(lowStockProduct);

            try {
                await orderService.postOrder(testInput);
                expect.fail('Expected function to throw');
            } catch (error) {
                expect(errorHelperMock.createError.calledOnceWith({ message: "Insufficient stock for product.", statusCode: 422 })).to.be.true;
                expect(prismaMock.$transaction.called).to.be.false;
            }
        });

        it('should call $transaction and perform updates/create within it on success', async () => {
            prismaMock.user.findUnique.resolves(mockUser);
            prismaMock.product.findUnique.resolves(mockProduct);
            const expectedCreatedOrder = { id: 'new-order-uuid', quantity: quantityNumber, totalPrice: totalPrice, userId: testInput.userId, productId: testInput.productId };
            prismaMock.order.create.resolves(expectedCreatedOrder);

            const result = await orderService.postOrder(testInput);

            expect(prismaMock.$transaction.calledOnce).to.be.true;

            expect(prismaMock.user.update.calledOnceWith({
                where: { id: testInput.userId },
                data: { balance: { decrement: totalPrice } }
            })).to.be.true;

            expect(prismaMock.product.update.calledOnceWith({
                where: { id: testInput.productId },
                data: { stock: { decrement: quantityNumber } }
            })).to.be.true;

            expect(prismaMock.order.create.calledOnceWith({
                data: {
                    quantity: quantityNumber,
                    totalPrice: totalPrice,
                    userId: testInput.userId,
                    productId: testInput.productId
                }
            })).to.be.true;

            expect(errorHelperMock.createError.called).to.be.false;

            expect(result).to.deep.equal(expectedCreatedOrder);
        });

        it('should correctly parse string quantity to number', async () => {
            prismaMock.user.findUnique.resolves(mockUser);
            prismaMock.product.findUnique.resolves(mockProduct);

            await orderService.postOrder(testInput);

            expect(prismaMock.product.update.calledOnceWith(
                sinon.match({ data: { stock: { decrement: 2 } } })
            )).to.be.true;
            expect(prismaMock.order.create.calledOnceWith(
                sinon.match({ data: { quantity: 2, totalPrice: 40.00 } })
            )).to.be.true;
        });

    });
});