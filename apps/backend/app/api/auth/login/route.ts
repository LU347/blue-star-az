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

export function validateUserInput(body: any) {
    const requiredFields: (keyof LoginRequestBody)[] = ['email', 'password'];
    for (const field of requiredFields) {
        if (!body[field]) {
            return { error: UserError.MISSING_FIELDS, status: 400 };
        }
    }
    return null;
}
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