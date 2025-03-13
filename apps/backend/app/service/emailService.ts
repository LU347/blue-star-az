import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., "smtp.gmail.com"
    port: Number(process.env.SMTP_PORT) || 587, // 465 for SSL, 587 for TLS
    secure: process.env.SMTP_PORT === "465", // Use TLS/SSL
    auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your email password or app password
    },
});

// Function to send an email
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"Your Name" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
