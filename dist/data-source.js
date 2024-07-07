"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Organisation_1 = require("./entities/Organisation");
require("dotenv/config");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    port: 5432,
    // url: process.env.DB_URL,s
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
