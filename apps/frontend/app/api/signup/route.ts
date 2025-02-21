"use server";

import { CreateUserRequest } from "../../types/auth"; 

import { NextResponse } from "next/server";

if (!process.env.DEV_REGISTER_API_URL) {
    throw new Error("ENV variable not configured properly");
}
const API_URL = process.env.DEV_REGISTER_API_URL;

interface SignupBody extends CreateUserRequest {
    confirmPassword: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as SignupBody;

        const requiredFields = ["email", "password", "phoneNumber", "firstName", "lastName", "gender", "branch"];
        const missingFields = requiredFields.filter(field => !body[field as keyof SignupBody]);
        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields: ${missingFields.join(', ')}`},
                { status: 400 }
            )
        }

        const {
            email, password, phoneNumber, firstName, lastName, 
            gender, branch, addressLineOne, addressLineTwo,
            city, zipCode, country, state, confirmPassword
        } = body;

        if (password !== confirmPassword) {
            return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
        }

        const dataToSend = {
            email,
            password,
            phoneNumber,
            firstName,
            lastName,
            gender,
            branch,
            addressLineOne,
            addressLineTwo,
            city,
            zipCode,
            country,
            state,
            userType: "SERVICE_MEMBER", 
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

        return NextResponse.json({ message: "Signup successful", user: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
