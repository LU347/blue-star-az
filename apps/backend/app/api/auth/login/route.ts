import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserError, Status } from "app/types/enums";

const prisma = new PrismaClient();

interface LoginRequestBody {
    email: string;
    password: string;
}

/**
 * Validates that the request body includes the required login fields.
 *
 * This function checks for the presence of the 'email' and 'password' properties in the provided body.
 * If either required field is missing, it returns an error object containing the appropriate error code
 * and a 400 HTTP status. If all required fields are present, it returns null.
 *
 * @param body - The request body to validate, expected to have 'email' and 'password' properties.
 * @returns An object with error and status properties if validation fails, otherwise null.
 */
export function validateUserInput(body: any) {
    const requiredFields: (keyof LoginRequestBody)[] = ['email', 'password'];
    for (const field of requiredFields) {
        if (!body[field]) {
            return { error: UserError.MISSING_FIELDS, status: 400 };
        }
    }
    return null;
}
/**
 * Handles user login via a POST request.
 *
 * This function processes the login attempt by performing the following steps:
 * - Parses the incoming request body as JSON, expecting an object conforming to the LoginRequestBody interface.
 * - Validates that the required fields (email and password) are provided using the validateUserInput function.
 * - Queries the database for a user with the provided email.
 * - If a user is found, compares the provided password with the stored hashed password using bcrypt.
 * - Generates a JWT token signed with a secret (retrieved from environment variables) that includes the user's ID and type, set to expire in one hour.
 * - Returns appropriate HTTP responses:
 *    - 200 with a success message and the JWT token if authentication is successful.
 *    - 400 if required fields are missing.
 *    - 401 if the user does not exist or if the password is invalid.
 *    - 500 for internal errors or if the JWT secret is not defined.
 *
 * @param req - The HTTP request object containing the login credentials in its JSON body.
 * @returns A Promise that resolves to a NextResponse object with the outcome of the login attempt.
 *
 * @throws Error if the JWT secret is not defined in the environment variables.
 */
export async function POST(req: Request) {
    try {
        const body: LoginRequestBody = await req.json();
        const validationError = validateUserInput(body);
        if (validationError) {
            return NextResponse.json(validationError, { status: validationError.status });
        }

        const { email, password } = body;
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: UserError.USER_NONEXISTENT }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: UserError.INVALID_CREDENTIALS }, { status: 401 });
        }

        const tokenSecret = process.env.JWT_SECRET;
        if (!tokenSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables.");
}
        const token = jwt.sign(
            { userId: user.id, userType: user.userType },
            tokenSecret, 
            { expiresIn: '1h' }
        );

        return NextResponse.json({ message: Status.LOGIN_SUCCESS, token }, { status: 200 });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: UserError.INTERNAL_ERR }, { status: 500 });
    }
}