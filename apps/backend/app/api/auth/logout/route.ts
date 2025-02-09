import { NextResponse } from "next/server";
import { UserError, Status } from "app/types/enums";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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
            console.log(decoded);
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
