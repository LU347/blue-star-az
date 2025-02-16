import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

const parsedRounds = parseInt(process.env.HASH_ROUNDS || '', 10);
const HASH_ROUNDS = (!Number.isNaN(parsedRounds) && parsedRounds > 0) ? parsedRounds : 12;

prisma.$use(async (params, next) => {
    if (params.model === 'User' && (params.action === 'create' || params.action === 'update')) {
        if (params.args.data?.password) {
            try {
                params.args.data.password = await bcrypt.hash(params.args.data.password, HASH_ROUNDS);
            } catch (error) {
                if (error instanceof Error)
                throw new Error(`Failed to process password: ${error.message}`);
            }
            
        }
    }
    return next(params);
})

export default prisma;