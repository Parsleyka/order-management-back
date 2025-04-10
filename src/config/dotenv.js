/*global process*/

const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    databaseUrl: process.env.DATABASE_URL,
    serverPort: process.env.SERVER_PORT || 3000,
    serverUrl: process.env.SERVER_URL || "localhost"
};