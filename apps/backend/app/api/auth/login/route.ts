import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserError, Status } from "app/types/enums";
import { isBodyValid, isEmailValid, isPasswordValid } from "app/util/validators";

const prisma = new PrismaClient();

interface LoginRequestBody {
    email: string;
    password: string;
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

        if (!isBodyValid(body)) {
            return NextResponse.json({ error: 'Missing or invalid fields'}, { status: 400 });
        }

        const { email, password } = body;

        if (!isEmailValid(email)) {
            return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 });
        }

        if (!isPasswordValid(password)) {
            return NextResponse.json({ error: 'Missing or invalid password' }, { status: 400 });
        }
        
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: UserError.USER_NONEXISTENT }, { status: 401 });
        }

        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            return NextResponse.json({ error: UserError.INVALID_CREDENTIALS }, { status: 401 });
        }

        const tokenSecret = process.env.JWT_SECRET;
        if (!tokenSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables."); //Generate a key using ```openssl rand -base64 60``` and place it in your .env file
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