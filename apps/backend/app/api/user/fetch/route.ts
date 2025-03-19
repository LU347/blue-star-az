import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { JwtPayload } from 'jsonwebtoken';
import { authenticateUser } from '../../../util/authMiddleware'; // Authentication middleware

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Authenticate the user
        const authResponse = await authenticateUser(req);
        if (!authResponse.success) {
            return NextResponse.json({ error: authResponse.error }, { status: 401 });
        }
        // Get the user ID from the decoded token
        const userId = (authResponse.user as JwtPayload).userId || null;
        // Fetch user details from the database
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({data : user}, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
