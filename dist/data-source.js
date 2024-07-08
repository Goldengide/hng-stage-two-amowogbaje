"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const User_1 = require("./entities/User");
const Organisation_1 = require("./entities/Organisation");
require("dotenv/config");
const typeorm_1 = require("typeorm");
// export const AppDataSource = new DataSource({
//   type: "postgres",
//   port: 5432,
//   // url: process.env.DB_URL,s
//   host: process.env.DB_HOST,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   // ssl: true,
//   synchronize: true,
//   logging: false,
//   entities: [User, Organisation],
//   migrations: [],
//   subscribers: [],
// });
exports.AppDataSource = {
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, typeorm_1.createConnection)({
                type: "postgres",
                port: 5432,
                // url: process.env.DB_URL,s
                host: process.env.DB_HOST,
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                // ssl: true,
                synchronize: true,
                logging: false,
                entities: [User_1.User, Organisation_1.Organisation],
                migrations: [],
                subscribers: [],
            });
            console.log("Data Source has been initialized!");
        });
    }
};
