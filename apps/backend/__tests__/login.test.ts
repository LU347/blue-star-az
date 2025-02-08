import { POST } from "../app/api/auth/login/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserError, Status } from "app/types/enums";

// Mock the Prisma Client and bcrypt
jest.mock("@prisma/client", () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});
jest.mock("bcryptjs");

const prisma = new PrismaClient();

function createMockRequest(body: { email: string; password: string }) {
    return {
        json: async () => body,
    };
}

describe("POST Login Endpoint", () => {
    beforeAll(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET;
    })

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it("should return an error if the password is incorrect", async () => {
        const req = createMockRequest({ email: "lucile.smith@example.com", password: "wrongpassword" });

        // Mocking the user retrieval
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 1,
            email: "lucile.smith@example.com",
            password: await bcrypt.hash("password", 10), // Correct hashed password
        });

        // Mocking bcrypt to simulate password comparison failure
        (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Simulate incorrect password

        const response = await POST(req as any);
        const responseBody = await response.json();

        expect(responseBody.error).toEqual(UserError.INVALID_CREDENTIALS);
        expect(response.status).toBe(401);
    });

    it("should return a token and success message for valid credentials", async () => {
        const req = createMockRequest({ email: "lucile.smith@example.com", password: "password" });

        // Mocking the user retrieval
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: 1,
            email: "lucile.smith@example.com",
            password: await bcrypt.hash("password", 10), // Correct hashed password
        });

        // Mocking bcrypt to simulate password comparison success
        (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Simulate correct password

        const response = await POST(req as any);
        const responseBody = await response.json();

        expect(responseBody).toEqual({
            message: Status.LOGIN_SUCCESS,
            token: expect.any(String), // Check if token is a string
        });
        expect(response.status).toBe(200);
    });

    it("should return an error if the email is missing", async () => {
        const req = createMockRequest({
            password: "password",
            email: ""
        }); // No email provided
    
        const response = await POST(req as any);
        const responseBody = await response.json();
    
        expect(responseBody.error).toEqual(UserError.MISSING_FIELDS);
        expect(response.status).toBe(400);
    });

    it("should return an error if the password is missing", async () => {
        const req = createMockRequest({
            email: "lucile.smith@example.com",
            password: ""
        }); // No password provided
    
        const response = await POST(req as any);
        const responseBody = await response.json();
    
        expect(responseBody.error).toEqual(UserError.MISSING_FIELDS);
        expect(response.status).toBe(400);
    });

    it("should return an error if the user does not exist", async () => {
        const req = createMockRequest({ email: "nonexistent@example.com", password: "password" });
    
        // Mocking user retrieval to return null
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    
        const response = await POST(req as any);
        const responseBody = await response.json();
    
        expect(responseBody.error).toEqual(UserError.USER_NONEXISTENT);
        expect(response.status).toBe(401);
    });
});
