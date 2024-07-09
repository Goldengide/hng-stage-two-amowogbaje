import "reflect-metadata";
import express from "express";
import authRoutes from "./routes/auth";
import apiRoutes from "./routes/api";
import 'dotenv/config';
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Organisation } from "./entities/Organisation";

const app = express();
const port = process.env.PORT || 3000;

createConnection({
  type: "postgres",
  port: 5432,
  // url: process.env.DB_URL,

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
})
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
      console.log(`Server is up on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error during database connection:", error);
  });

export default app