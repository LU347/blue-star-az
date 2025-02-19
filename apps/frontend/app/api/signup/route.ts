import { NextResponse } from "next/server";

const API_URL = "http://localhost:3001/api/auth/register"; // temp 

export async function POST(req: Request) {
    try {
        const body = await req.json();
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
            return NextResponse.json({ message: data.message || "Signup failed" }, { status: response.status });
        }

        return NextResponse.json({ message: "Signup successful", user: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
