import request from "supertest";
import { app, connectionPromise } from "../src/apptest";
import { getRepository } from "typeorm";
import { User } from "../src/entities/User";
import { Organisation } from "../src/entities/Organisation";

let server: any;

beforeAll(async () => {
  await connectionPromise; // Ensure the connection is established before running tests
  server = app.listen(4000); // Use a different port to avoid conflicts during testing
});

afterAll(async () => {
  await getRepository(User).delete({});
  await getRepository(Organisation).delete({});
  await (await connectionPromise).close(); // Properly close the database connection
  server.close(); // Close the server
});

describe("Auth API", () => {
  it("should register a user successfully", async () => {
    const res = await request(server)
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
  });

  it("should login a user successfully", async () => {
    const res = await request(server)
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
  });
});
