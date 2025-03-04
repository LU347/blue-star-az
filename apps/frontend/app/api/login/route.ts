"use server";

import { LoginUserRequest } from "../../types/auth"; 
import { NextResponse } from "next/server";

if (!process.env.DEV_LOGIN_API_URL) {
    throw new Error("ENV variable not configured properly");
}
const API_URL = process.env.DEV_LOGIN_API_URL;
/**
 * Handles a POST request to log in a user.
 *
 * This function validates the incoming request body for the presence of the 'email' and 'password' fields.
 * If either required field is missing, it returns a JSON response with a 400 status code and a message indicating
 * the missing fields. If all required fields are present, it sends a request to the API server to authenticate the user
 * using the provided credentials. If the API server returns an error, it returns a JSON response with the error
 * message and the corresponding status code. If the API server returns a valid response, it returns a JSON response
 * with a 200 status code and the user data.
 *
 * @param req - The incoming request containing the user credentials in its JSON body.
 * @returns A JSON response indicating the outcome of the login attempt.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json() as LoginUserRequest;
        const requiredFields = ["email", "password"];
        const missingFields = requiredFields.filter(field => !body[field as keyof LoginUserRequest]);
        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields: ${missingFields.join(', ')}`},
                { status: 400 }
            )
        }
        const {
            email, password
        } = body;
        const dataToSend = {
            email,
            password,
        };
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ message: data.error }, { status: response.status });
        }
        return NextResponse.json({ message: "Login successful", data }, { status: 200 });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Internal Server Error';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
