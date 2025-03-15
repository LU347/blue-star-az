import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../service/emailService";

const prisma = new PrismaClient();

function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }
    
    return otp;
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        const otp = generateOTP(6);

        if (!user) {
            await sendEmail(email, "Your OTP Code: ", otp);
        }

        return NextResponse.json({ exists: !!user });
    } catch (error) {
        console.error("Error checking email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}