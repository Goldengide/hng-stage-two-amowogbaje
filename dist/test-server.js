"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionPromise = exports.app = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const api_1 = __importDefault(require("./routes/api"));
require("dotenv/config");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Organisation_1 = require("./entities/Organisation");
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT || 3000;
let sslStatus = true;
if (process.env.DB_DATABASE !== "verceldb") {
    sslStatus = false;
}
const connectionPromise = (0, typeorm_1.createConnection)({
    type: "postgres",
    port: 5432,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: true,
    synchronize: true,
    logging: false,
    entities: [User_1.User, Organisation_1.Organisation],
    migrations: [],
    subscribers: [],
});
exports.connectionPromise = connectionPromise;
connectionPromise
    .then(() => {
    console.log("Database connection established successfully!");
    app.use(express_1.default.json());
    app.get("/", (req, res) => {
        return res.json({
            "message": "Welcome to the Auth API Home page",
            "data": process.env.DB_DATABASE,
            "status": res.statusCode,
        });
    });
    app.use("/auth", auth_1.default);
    app.use("/api", api_1.default);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})
    .catch((error) => {
    console.error("Error during database connection:", error);
});
