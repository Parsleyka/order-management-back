const express = require("express");
const { serverUrl, serverPort } = require("./config/dotenv");
const { requestLogger, errorLogger } = require("./middlewares/loggerMiddleware");
const { rateLimiter } = require("./middlewares/rateLimiterMiddleware");

const ordersRouter = require("./routes/orderRouter");

const app = express();

app.use(express.json());

app.use(requestLogger);
app.use(rateLimiter);
app.use("/api", ordersRouter);
app.use(errorLogger);

app.listen(serverPort, () => {
    console.log(`Hosted on http://${serverUrl}:${serverPort}`);
});