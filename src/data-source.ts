import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Organisation } from "./entities/Organisation";
import 'dotenv/config';

export const AppDataSource = new DataSource({
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
  entities: [User, Organisation],
  migrations: [],
  subscribers: [],
});

