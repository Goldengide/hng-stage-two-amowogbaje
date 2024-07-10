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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_server_1 = require("../src/test-server");
const typeorm_1 = require("typeorm");
const User_1 = require("../src/entities/User");
const Organisation_1 = require("../src/entities/Organisation");
let server;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield test_server_1.connectionPromise; // Ensure the connection is established before running tests
    server = test_server_1.app.listen(4000); // Use a different port to avoid conflicts during testing
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, typeorm_1.getRepository)(User_1.User).delete({});
    yield (0, typeorm_1.getRepository)(Organisation_1.Organisation).delete({});
    yield (yield test_server_1.connectionPromise).close(); // Properly close the database connection
    server.close(); // Close the server
}));
describe("Auth API", () => {
    it("should register a user successfully with default organisation", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server)
            .post("/auth/register")
            .send({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "password123",
            phone: "1234567890"
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("status", "success");
        expect(res.body).toHaveProperty("message", "Registration successful");
        expect(res.body.data).toHaveProperty("accessToken");
        expect(res.body.data.user).toHaveProperty("userId");
        expect(res.body.data.user).toHaveProperty("firstName", "John");
        expect(res.body.data.user).toHaveProperty("lastName", "Doe");
        expect(res.body.data.user).toHaveProperty("email", "john.doe@example.com");
        expect(res.body.data.user).toHaveProperty("organisation");
        expect(res.body.data.user.organisation).toHaveProperty("name", "John's Organisation");
    }));
    it("should log the user in successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server)
            .post("/auth/login")
            .send({
            email: "john.doe@example.com",
            password: "password123"
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("status", "success");
        expect(res.body).toHaveProperty("message", "Login successful");
        expect(res.body.data).toHaveProperty("accessToken");
        expect(res.body.data.user).toHaveProperty("userId");
    }));
    it("should fail if required fields are missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const testCases = [
            { field: "firstName", payload: { lastName: "Doe", email: "john.doe2@example.com", password: "password123", phone: "1234567890" } },
            { field: "lastName", payload: { firstName: "John", email: "john.doe2@example.com", password: "password123", phone: "1234567890" } },
            { field: "email", payload: { firstName: "John", lastName: "Doe", password: "password123", phone: "1234567890" } },
            { field: "password", payload: { firstName: "John", lastName: "Doe", email: "john.doe2@example.com", phone: "1234567890" } },
        ];
        for (const testCase of testCases) {
            const res = yield (0, supertest_1.default)(server)
                .post("/auth/register")
                .send(testCase.payload);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("status", "Bad request");
            expect(res.body).toHaveProperty("message", "Registration unsuccessful");
            expect(res.body.errors).toEqual(expect.arrayContaining([
                expect.objectContaining({ field: testCase.field, message: expect.any(String) })
            ]));
        }
    }));
    it("should fail if there's a duplicate email", () => __awaiter(void 0, void 0, void 0, function* () {
        // First registration
        yield (0, supertest_1.default)(server)
            .post("/auth/register")
            .send({
            firstName: "Jane",
            lastName: "Doe",
            email: "jane.doe@example.com",
            password: "password123",
            phone: "1234567890"
        });
        // Attempt to register with the same email
        const res = yield (0, supertest_1.default)(server)
            .post("/auth/register")
            .send({
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.doe@example.com",
            password: "password123",
            phone: "0987654321"
        });
        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty("status", "error");
        expect(res.body).toHaveProperty("message", "User already exists");
    }));
});
