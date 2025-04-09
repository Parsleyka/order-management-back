const express = require("express");
const cors = require("cors");

const { serverUrl, serverPort } = require("./config/dotenv");
const { requestLogger } = require("./middlewares/loggerMiddleware");
const { rateLimiter } = require("./middlewares/rateLimiterMiddleware");
const { notFound } = require("./middlewares/notFoundMiddleware");

const ordersRouter = require("./routes/orderRouter");

const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST']
}
app.use(cors(corsOptions));
app.use(express.json());

app.use(requestLogger);
app.use(rateLimiter);
app.use("/api", ordersRouter);
app.use(notFound);

app.listen(serverPort, () => {
    console.log(`Hosted on http://${serverUrl}:${serverPort}`);
});