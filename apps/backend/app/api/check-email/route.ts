import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../service/emailService";

const prisma = new PrismaClient();

// Function to generate OTP
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

        // Check if the user exists in the database
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            return NextResponse.json({ error: "Email address taken" }, { status: 400 });
        }

        const otp = generateOTP(6);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

        // Store OTP in the database temporarily
        await prisma.oTP.create({
            data: {
                email,
                otp,
                expiresAt,
            },
        });

        try {
            // Send the OTP via email
            await sendEmail(email, "Your One Time Password", `Your one-time password is: ${otp}`);
            console.log("Email sent successfully!");
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
        }

        // Return the response after successfully sending OTP and storing it
        return NextResponse.json({
            result: {
                success: true,
                message: "OTP sent successfully to your email.",
                exists: !!user,
                email: email
            }
        });

    } catch (error) {
        console.error("Error checking email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
