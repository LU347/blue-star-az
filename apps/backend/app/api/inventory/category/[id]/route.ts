//PUT, DELETE
import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { isStringValid } from "app/util/validators";

const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

export async function PUT(req: Request, { params }: { params: { id: string }}) {
    try {
        if (!params || !params.id) {
            return NextResponse.json({ error: 'ID parameter is missing' }, { status: 400 });
        }

        const parsedId = parseInt(params.id, 10);
        if (isNaN(parsedId)) {
            return NextResponse.json({ error: 'Invalid ID provided ' }, { status: 400 });
        }

        const body = await req.json();
        const { categoryName } = body;

        if (!isStringValid(categoryName)) {
            return NextResponse.json({ error: 'Missing or invalid category name' }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({ where: { id: parsedId }});
        if (!existingCategory) {
            return NextResponse.json({ error: 'The category you are trying to update does not exist' }, { status: 404 })
        }

        await prisma.category.update({
            where: {
                id: parsedId,
            },
            data: {
                categoryName: categoryName
            }
        });

        return NextResponse.json(
            { status: 'success', message: 'Category successfully updated' },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
    try {
        if (!params || !params.id) {
            return NextResponse.json({ error: 'ID parameter is missing' }, { status: 400 });
        }

        const parsedId = parseInt(params.id, 10);
        if (isNaN(parsedId)) {
            return NextResponse.json({ error: 'Invalid ID provided ' }, { status: 400 });
        }

        const categoryExists = await prisma.category.findUnique({ where: { id: parsedId }});
        if (!categoryExists) {
            return NextResponse.json({ error: 'The category you are trying to delete does not exist' }, { status: 404});
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            return tx.category.delete({
                where: {
                    id: parsedId
                },
            });
        });

        return NextResponse.json(
            { status: 'success', message: 'Category successfully deleted' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Error occurred when deleting category'}, { status: 500 });
    }
}