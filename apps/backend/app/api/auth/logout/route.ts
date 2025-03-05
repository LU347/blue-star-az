import { NextResponse } from "next/server";
import { UserError, Status } from "app/types/enums";
import { Prisma, PrismaClient } from "@prisma/client";
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
        const parts = authHeader?.split(" ") || [];

        if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
            return NextResponse.json({ error: "Invalid or missing token" }, { status: 401 });
        }       

        const token = parts[1];

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json({ error: UserError.INTERNAL_ERR }, { status: 500 });
        }

        try {
            jwt.verify(token, jwtSecret);
        } catch (jwtError) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                return NextResponse.json({ error: UserError.TOKEN_EXPIRED }, { status: 401 });
            } else if (jwtError instanceof jwt.JsonWebTokenError) {
                return NextResponse.json({ error: UserError.INVALID_TOKEN }, { status: 401 });
            }
            return NextResponse.json({ error: UserError.INTERNAL_ERR }, { status: 500 });
        }
        
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            try {
                await tx.tokenBlacklist.create({
                    data: { token },
                    select: { id: true }
                });
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === "P2002") {
                        return NextResponse.json({ message: Status.LOGOUT_SUCCESS }, { status: 200 });
                    }
                }
                throw error;
            }
            return NextResponse.json({ message: Status.LOGOUT_SUCCESS }, { status: 200 });
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: UserError.INTERNAL_ERR }, { status: 500 });
    }
}
