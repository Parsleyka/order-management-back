/*global __dirname, process*/

const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
    databaseUrl: process.env.DATABASE_URL,
    serverPort: process.env.SERVER_PORT || 3000,
    serverUrl: process.env.SERVER_URL || "localhost"
};