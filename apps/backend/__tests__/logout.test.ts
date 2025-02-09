import { POST } from "../app/api/auth/logout/route";
import { UserError, Status } from "app/types/enums";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

jest.mock("@prisma/client", () => {
    const mockCreate = jest.fn(); // Mock for the 'create' method
    const mockTransaction = jest.fn(async (callback) => {
        return await callback({
            tokenBlacklist: {
                create: mockCreate, // Ensure the transaction uses the same mock
            },
        });
    });

    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            tokenBlacklist: {
                create: mockCreate, // Mock the create method for tokenBlacklist
            },
            $transaction: mockTransaction, // Mock the $transaction method
        })),
    };
});

jest.mock("jsonwebtoken", () => {
    const actualJwt = jest.requireActual("jsonwebtoken");
    return {
        ...actualJwt,
        verify: jest.fn((token, secret) => {
            if (token === "validToken") { // Check for a specific valid token
                return { userId: 123 }; // Return valid decoded payload
            }
            throw new Error("Invalid token"); // Simulate an invalid token error for any other token
        }),
    };
});

describe("Logout API", () => {
    let req: Request;

    beforeEach(() => {
        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {},
        });

        process.env.JWT_SECRET = 'test_secret'; // Set a mock secret
        jest.clearAllMocks(); // Clear mocks before each test
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 401 if no authorization header is provided", async () => {
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe("Missing token");
    });

    it("should return 401 if authorization header is invalid", async () => {
        const expiredToken = jwt.sign({ userId: 123 }, "test_secret", { expiresIn: -10 });
        
        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${expiredToken}`, // Pass expired token
            },
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe("Invalid token");
    });

    it("should return 401 if token is missing", async () => {
        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer ", // Set header with empty token
            },
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe("Missing token");
    });

    it("should return 500 if JWT_SECRET is missing", async () => {
        delete process.env.JWT_SECRET; // Remove JWT_SECRET
        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer validtoken", // Set a placeholder valid token
            },
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.error).toBe(UserError.INTERNAL_ERR);
    });

    it("should return 401 if JWT verification fails", async () => {
        const validToken = "validtoken"; // Use a placeholder token
        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${validToken}`, // Set header with valid token
            },
        });

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe("Invalid token");
    });

    it("should return 401 if JWT is expired", async () => {
        const expiredToken = jwt.sign({ userId: 'testUser' }, 'test_secret', { expiresIn: -3600 });
        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${expiredToken}`, // Set header with expired token
            },
        });

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw { name: "TokenExpiredError" };
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe(UserError.TOKEN_EXPIRED);
    });

    it("should return 200 if logout is successful", async () => {
        const validToken = jwt.sign({ userId: "123" }, "test_secret");

        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${validToken}`, // Use the actual token
            },
        });

        (jwt.verify as jest.Mock).mockReturnValue({ userId: "123" }); // Mock successful token verification

        const res = await POST(req);
        const json = await res.json();

        // Assertions
        expect(res.status).toBe(200);
        expect(json.message).toBe(Status.LOGOUT_SUCCESS);

        // Verify that the token was blacklisted
        const prismaClient = new PrismaClient(); // Instantiate the mock
        expect(prismaClient.tokenBlacklist.create).toHaveBeenCalledWith({
            data: { token: validToken },
        });
    });
    
    it("should return 500 if a database error occurs", async () => {
        const validToken = jwt.sign({ userId: "123" }, process.env.JWT_SECRET || 'secret'); // Create a valid token
        req = new Request("http://localhost/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${validToken}`, // Set header with valid token
            },
        });
    
        (jwt.verify as jest.Mock).mockReturnValue({ userId: "123" }); // Mock successful token verification
    
        // Get the instance of PrismaClient
        const prismaClientInstance = new PrismaClient(); // Create an instance of the mocked PrismaClient
    
        // Type assertion to mock the `create` method correctly
        (prismaClientInstance.tokenBlacklist.create as jest.Mock).mockRejectedValue(new Error("DB Error"));
    
        const res = await POST(req);
        const json = await res.json();
    
        expect(res.status).toBe(500);
        expect(json.error).toBe(UserError.INTERNAL_ERR);
    });
    
});
