import { NextResponse } from "next/server";
import { Error, Status } from "app/types/enums";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * Handles user logout by blacklisting the provided JWT token.
 *
 * This function performs the following steps:
 * 1. Extracts the JWT from the Authorization header.
 * 2. Retrieves the JWT secret from environment variables.
 * 3. Uses a Prisma transaction to ensure atomicity:
 *    - Verifies the token using the JWT secret.
 *    - Adds the token to the blacklist in the database.
 * 4. Returns a success response or an error response based on the outcome.
 * 5. Handles potential errors, including invalid/expired tokens, database errors, and
 *    other unexpected errors.
 * 6. Ensures the Prisma client is disconnected.
 */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: Error.UNAUTHORIZED }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: Error.UNAUTHORIZED }, { status: 401 });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is not defined");
            return NextResponse.json({ error: Error.INTERNAL_ERR }, { status: 500 });
        }

        try {
            await prisma.$transaction(async (tx) => { 
                try {
                    await jwt.verify(token, jwtSecret); 
                } catch (jwtError: any) {
                    if (jwtError.name === 'TokenExpiredError') {
                        return NextResponse.json({ error: Error.TOKEN_EXPIRED }, { status: 401 });
                    }
                    return NextResponse.json({ error: Error.UNAUTHORIZED }, { status: 401 });
                }

                await tx.tokenBlacklist.create({ 
                    data: { token },
                });
            });

            return NextResponse.json({ message: Status.LOGOUT_SUCCESS }, { status: 200 });
        } catch (prismaError: any) { 
            console.error("Prisma error during logout:", prismaError); 
            return NextResponse.json({ error: Error.DATABASE_ERROR }, { status: 500 }); 
        }

    } catch (error: any) { 
        console.error("Unexpected logout error:", error); 
        return NextResponse.json({ error: Error.INTERNAL_ERR }, { status: 500 });
    } finally {
        await prisma.$disconnect(); 
    }
}