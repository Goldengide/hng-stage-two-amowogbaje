import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Organisation } from "./entities/Organisation";
import 'dotenv/config';

export const AppDataSource = new DataSource({
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
  entities: [User, Organisation],
  migrations: [],
  subscribers: [],
});

