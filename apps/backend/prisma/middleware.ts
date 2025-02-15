import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

prisma.$use(async (params, next) => {
    if (params.model === 'User' && (params.action === 'create' || params.action === 'update')) {
        if (params.args.data.password) {
            params.args.data.password = await bcrypt.hash(params.args.data.password, 10);
        }
    }
    return next(params);
})

export default prisma;