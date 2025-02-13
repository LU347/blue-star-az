import { NextResponse } from "next/server";
import { UserError, Status } from "app/types/enums";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * Handles a POST request to log out a user by blacklisting the provided JWT token.
 *
 * This function extracts the token from the "Authorization" header of the incoming request, verifies its format,
 * and validates it using the JWT secret from environment variables. If the token is missing, malformed, expired, or
 * invalid, it returns an appropriate error message with a corresponding HTTP status (401 for authentication issues
 * or 500 for internal errors). Upon successful validation, the function records the token in the database's token
 * blacklist using a transactional operation, ensuring that the token cannot be reused.
 *
 * @param req - The incoming HTTP request containing the "Authorization" header.
 * @returns A NextResponse object with a JSON payload indicating the outcome: a 200 status on success, or an error message
 *          with a 401 or 500 status on failure.
 *
 * @remarks
 * - HTTP 401 is returned for missing, malformed, or invalid/expired tokens.
 * - HTTP 500 is returned for internal errors, such as a missing JWT secret.
 */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing token" }, { status: 401 });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return NextResponse.json({ error: "Invalid header" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Invalid header" }, { status: 401 });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json({ error: UserError.INTERNAL_ERR }, { status: 500 });
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
        } catch (jwtError: any) {
            if (jwtError.name === "TokenExpiredError") {
                return NextResponse.json({ error: UserError.TOKEN_EXPIRED }, { status: 401 });
            }
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        

        return await prisma.$transaction(async (tx) => {
            await tx.tokenBlacklist.create({ data: { token } });
            return NextResponse.json({ message: Status.LOGOUT_SUCCESS }, { status: 200 });
        });

    } catch (error: any) {
        return NextResponse.json({ error: UserError.INTERNAL_ERR }, { status: 500 });
    }
}
