import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Error, Status } from "app/types/enums";

const prisma = new PrismaClient();

/*
    Handles user login:
    - Parses the incoming POST request.
    - Validates that the required fields are provided.
    - Checks if a user with the given email exists.
    - Compares the password with the stored hashed password.
    - Returns an appropriate response based on authentication success or failure.
*/
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: Error.MISSING_FIELDS}, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: Error.INVALID_CREDENTIALS }, { status: 400 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: Error.INVALID_CREDENTIALS }, { status: 401 });
        }

        const token = jwt.sign({ userId: user.id, userType: user.userType }, `${process.env.JWT_SECRET}`, { expiresIn: '1h' });

        return NextResponse.json({ message: Status.LOGIN_SUCCESS, token }, { status: 200 });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: Error.INTERNAL_ERR }, { status: 500 });
    }
}