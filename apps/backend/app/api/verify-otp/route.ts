import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        // Validate input
        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                otp: true,
                otpExpires: true,
            },
        });

        // Validate user and OTP
        if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // OTP verification successful, clear OTP fields
        await prisma.user.update({
            where: { email },
            data: { otp: null, otpExpires: null },
        });

        return NextResponse.json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect(); // Ensure the Prisma client is disconnected
    }
}
