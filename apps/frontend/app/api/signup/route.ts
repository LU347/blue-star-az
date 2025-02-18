import { NextResponse } from "next/server";

const API_URL = "";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email, password, phoneNumber, first_name, last_name, 
            gender, military_branch, address_one, address_two,
            city, zip_code, country, state
        } = body;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ message: data.message || "Signup failed" }, { status: response.status });
        }

        return NextResponse.json({ message: "Signup successful", user: data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error " }, { status: 500 });
    }
}