import "reflect-metadata";
import express from "express";
import authRoutes from "./routes/auth";
import apiRoutes from "./routes/api";
import 'dotenv/config';
import { createConnection, Connection } from "typeorm";
import { User } from "./entities/User";
import { Organisation } from "./entities/Organisation";

const app = express();
const port = process.env.PORT || 3000;
let sslStatus = true
if(process.env.DB_PASSWORD !== "verceldb") {
    sslStatus = false
  }
const connectionPromise: Promise<Connection> = createConnection({
  type: "postgres",
  port: 5432,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: sslStatus,
  synchronize: true,
  logging: false,
  entities: [User, Organisation],
  migrations: [],
  subscribers: [],
});

connectionPromise
  .then(() => {
    console.log("Database connection established successfully!");

    app.use(express.json());
    app.get("/", (req, res) => {
      return res.json({
        "message": "Welcome to the Auth API Home page",
        "data": process.env.DB_DATABASE,
        "status": res.statusCode,
      });
    });

    app.use("/auth", authRoutes);
    app.use("/api", apiRoutes);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error during database connection:", error);
  });

export { app, connectionPromise };
