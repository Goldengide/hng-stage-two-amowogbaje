"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./data-source");
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization:", err);
});
app.use(express_1.default.json());
app.get("/", (req, res) => {
    return res.json({
        "message": "Welcome the Auth Api Home page",
        "data": null,
        "status": res.statusCode,
    });
});
app.use("/auth", auth_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
