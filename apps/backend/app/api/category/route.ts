import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaGlobal = global as typeof global & { 
    prisma?: PrismaClient
}

export const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

//TODO: need to sanitize and validate input

//get category by id, get category by query, and get all categories
export async function GET(req: NextApiRequest) {
    try {
        if (!req.url) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
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
        
        return NextResponse.json(
            { status: 'success', message: 'Categories found', data: categoriesFound},
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json({ error: 'Error occurred while searching for category' }, { status: 500 });
    }
}

//create category
export async function POST(req: NextApiRequest) {
    try {
        if (!req.url) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const categoryName = searchParams.get('categoryName');
        const description = searchParams.get('description') || '';

        if (!categoryName) {
            return NextResponse.json({ error: 'Missing category name' }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({
            where: { categoryName }
        });

        if (existingCategory) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }

        await prisma.category.create({
            data: {
                categoryName,
                description
            },
        });

        return NextResponse.json(
            { status: 'success', message: 'Category successfully created' },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json({ error: 'Error occurred while creating category' }, { status: 500 })
    }
}

//update category name or description or name and description
export async function PUT(req: Request, res: Response) {
    try {
        const body = await req.json();

        const { id, categoryName, description } = body;

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({ where: { id: parseInt(id, 10) }});
        
        if (!existingCategory) {
            return NextResponse.json({ error: 'The category you are trying to update does not exist' }, { status: 404 })
        }

        const updateData = {
            ...(categoryName && { categoryName }),
            ...(description && { description }),
        };

        await prisma.category.update({
            where: {
                id: parseInt(id, 10),
            },
            data: updateData
        });

        return NextResponse.json(
            { status: 'success', message: 'Category successfully updated' },
            { status: 200 }
        );
        
    } catch (error) {
        return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
    }
}

// delete items w/ this category (?) if so, i need to add onDelete cascading or something
export async function DELETE(req: Request, res: Response) {
    try {
        const body = await req.json();

        const { id } = body;

        //refactor
        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
        }

        const categoryExists = await prisma.category.findUnique({ where: { id: parseInt(id, 10 )}});
        if (!categoryExists) {
            return NextResponse.json({ error: 'The category you are trying to delte does not exist' }, { status: 400});
        }

        await prisma.category.delete({
            where: {
                id: parseInt(id, 10)
            },
        });

        return NextResponse.json(
            { status: 'success', message: 'Category successfully deleted' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ error: 'Error occurred when deleting category'}, { status: 500 });
    }
}