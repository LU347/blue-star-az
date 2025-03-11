
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';
import { isStringValid, isEmpty } from 'app/util/validators';

const prismaGlobal = global as typeof global & { 
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

//get category by id, get category by query, and get all categories
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url as string);
        const search = searchParams.get('search');

        let categoriesFound;

        if (search) {
            if (!isNaN(Number(search))) {
                categoriesFound = await prisma.category.findUnique({
                    where: { id: Number(search) }
                })
            } else {
                categoriesFound = await prisma.category.findMany({
                    where: {
                        categoryName: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                });
            }
        } else {
            categoriesFound = await prisma.category.findMany();
        }

        if (isEmpty(categoriesFound)) {
            return NextResponse.json({ error: 'No categories found' }, { status: 404 });
        }

        return NextResponse.json(
            { status: 'success', data: categoriesFound},
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Category search error:', error);
        return NextResponse.json({ 
            error: 'Error occurred while searching for category',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
    }
}

//create category
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { categoryName } = body;
        if (!categoryName) {
            return NextResponse.json({ error: 'Missing category name' }, { status: 400 });
        }

        if (!isStringValid(categoryName)) {
            return NextResponse.json({ error: 'Invalid category name' }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({
            where: { categoryName }
        });

        if (existingCategory) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }

        const newCategory = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            return tx.category.create({
                data: {
                    categoryName,
                },
            });
        });

        return NextResponse.json(
            { status: 'success', message: 'Category successfully created', data: newCategory },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error occurred while creating category' }, { status: 500 })
    }
}