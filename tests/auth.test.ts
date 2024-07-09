import request from "supertest";
import { app, connectionPromise } from "../src/test-server";
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
  it("should register a user successfully with default organisation", async () => {
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
    expect(res.body.data.user).toHaveProperty("firstName", "John");
    expect(res.body.data.user).toHaveProperty("lastName", "Doe");
    expect(res.body.data.user).toHaveProperty("email", "john.doe@example.com");
    expect(res.body.data.user).toHaveProperty("organisation");
    expect(res.body.data.user.organisation).toHaveProperty("name", "John's Organisation");
  });

  it("should log the user in successfully", async () => {
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

  it("should fail if required fields are missing", async () => {
    const testCases = [
      { field: "firstName", payload: { lastName: "Doe", email: "john.doe2@example.com", password: "password123", phone: "1234567890" } },
      { field: "lastName", payload: { firstName: "John", email: "john.doe2@example.com", password: "password123", phone: "1234567890" } },
      { field: "email", payload: { firstName: "John", lastName: "Doe", password: "password123", phone: "1234567890" } },
      { field: "password", payload: { firstName: "John", lastName: "Doe", email: "john.doe2@example.com", phone: "1234567890" } },
    ];

    for (const testCase of testCases) {
      const res = await request(server)
        .post("/auth/register")
        .send(testCase.payload);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status", "Bad request");
      expect(res.body).toHaveProperty("message", "Registration unsuccessful");
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: testCase.field, message: expect.any(String) })
        ])
      );
    }
  });

  it("should fail if there's a duplicate email", async () => {
    // First registration
    await request(server)
      .post("/auth/register")
      .send({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
        password: "password123",
        phone: "1234567890"
      });

    // Attempt to register with the same email
    const res = await request(server)
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
  });
});
