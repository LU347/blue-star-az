"use server";

import { NextResponse } from "next/server";

if (!process.env.API_URL) {
    throw new Error("ENV variable not configured properly");
}
const API_URL = process.env.API_URL + "/user/fetch";

// let API_URL = "http://localhost:3000/api/user/fetch"; 

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const token = body.token;
        console.log(API_URL);
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ message: data.error }, { status: response.status });
        }
        return NextResponse.json({
            message: "User fetched successfully",
            data: data.data || null
        }, { status: 200 });
    } catch (error) {
        const errorMessage = (error as Error).message || 'Internal Server Error';
        console.log(errorMessage);
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
