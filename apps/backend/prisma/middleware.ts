import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

const HASH_ROUNDS = process.env.HASH_ROUNDS ? parseInt(process.env.HASH_ROUNDS) : 12;

prisma.$use(async (params, next) => {
    if (params.model === 'User' && (params.action === 'create' || params.action === 'update')) {
        if (params.args.data?.password) {
            try {
                params.args.data.password = await bcrypt.hash(params.args.data.password, HASH_ROUNDS);
            } catch (error) {
                throw new Error('Failed to process password');
            }
            
        }
    }
    return next(params);
})

export default prisma;