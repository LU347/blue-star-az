// apps/backend/app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    console.log("Hello");
    const origin = request.headers.get("origin") || "";
    const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3001";

    console.log(`[Middleware] Method: ${request.method}, URL: ${request.url}`);
    console.log(`[Middleware] Origin: ${origin}`);
    console.log(`[Middleware] Allowed Origin: ${allowedOrigin}`);

    if (request.method === "OPTIONS") {
        console.log("[Middleware] Handling OPTIONS request");
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    console.log("[Middleware] Headers set on response:", {
        "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
        "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
    });

    return response;
}

export const config = {
    matcher: "/api/auth/login",
};