import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;
console.log(process.env.DB_DATABASE)
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.use(express.json());
app.get("/", (req, res) => {
  console.log(process.env.DB_NAME)
  return res.json({
    "message": "Welcome the Auth Api Home page",
    "data": process.env.DB_DATABASE,
    "status": res.statusCode,

  })
});
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
