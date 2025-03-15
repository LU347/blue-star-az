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

        try {
            // Send the OTP via email
            await sendEmail(email, "Your One Time Password", `Your one-time password is: ${otp}`);
            console.log("Email sent successfully!");
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
        }

        // Store OTP temporarily if needed (e.g., in the database or cache)
        // For now, we are just sending a dummy response with the email existence
        return NextResponse.json({
            exists: !!user,
            message: "OTP sent successfully to your email."
        });
    } catch (error) {
        console.error("Error checking email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
