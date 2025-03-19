import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export async function authenticateUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        return { success: false, error: 'Access denied, no token provided' };
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token as string, SECRET_KEY);
        return { success: true, user: decoded };
    } catch (error) {
        return { success: false, error: 'Invalid or expired token' };
    }
}
