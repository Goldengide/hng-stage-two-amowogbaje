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
    // url: process.env.POSTGRES_URL,
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl: true,
    synchronize: true,
    logging: false,
    entities: [User_1.User, Organisation_1.Organisation],
    migrations: [],
    subscribers: [],
});
