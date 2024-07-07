import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    console.log(process.env.DB_NAME)
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
    console.log(process.env.DB_NAME)
  });

app.use(express.json());
app.get("/", (req, res) => {
  
  return res.json({
    "message": "Welcome the Auth Api Home page",
    "data": process.env.DB_NAME,
    "status": res.statusCode,

  })
});
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
