import { NextResponse } from "next/server";
import { Error, Status } from "app/types/enums";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/*
    Handles user logout by blacklisting the provided JWT token.
    - Parses the authorization header from the incoming request.
    - Validates the token format and presence.
    - Verifies the token using the JWT secret.
    - Adds the token to the blacklist in the database upon successful verification.
    - Returns an appropriate response based on the outcome.
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
            return NextResponse.json({ error: Error.INTERNAL_ERR }, { status: 500 });
        }

        jwt.verify(token, jwtSecret, async (err) => {
            if (err) {
                return NextResponse.json({ error: Error.UNAUTHORIZED }, { status: 401 });
            }

            await prisma.tokenBlacklist.create({
                data: { token },
            });

            return NextResponse.json({ message: Status.LOGOUT_SUCCESS }, { status: 200 });
        });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: Error.INTERNAL_ERR }, { status: 500 });
    }
}