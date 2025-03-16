import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const otpRecord = await prisma.oTP.findUnique({
            where: { email },
        });

        if (!otpRecord) {
            return NextResponse.json({ error: "OTP not found for this email" }, { status: 400 });
        }

        // Check if the OTP has expired
        const currentTime = new Date();
        if (otpRecord.expiresAt < currentTime) {
            console.log("expired");
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

        // Check if the provided OTP matches the stored OTP
        if (otpRecord.otp !== otp) {
            console.log("doesn't match");
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // OTP is valid, proceed with your logic (e.g., allowing access, or user verification)
        // Optionally, delete the OTP record to prevent reuse
        await prisma.oTP.delete({
            where: { email },
        });

        return NextResponse.json({
            result: {
                success: true,
                message: "OTP verified successfully",
            },
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
