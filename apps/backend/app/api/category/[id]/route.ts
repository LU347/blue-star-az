//Get by ID, PUT, DELETE
import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { isIDValid, isStringValid } from "app/util/validators";

const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

export async function PUT(req: Request) {
    try {
        const body = await req.json();

        const { id, categoryName } = body;

        if (!isIDValid(id)) {
            return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
        }
        const parsedId = parseInt(id, 10);

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

export async function DELETE(req: Request) {
    try {
        const body = await req.json();

        const { id } = body;

        if (!isIDValid(id)) {
            return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
        }

        const parsedInt = parseInt(id, 10);

        const categoryExists = await prisma.category.findUnique({ where: { id: parsedInt }});
        if (!categoryExists) {
            return NextResponse.json({ error: 'The category you are trying to delete does not exist' }, { status: 404});
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            return tx.category.delete({
                where: {
                    id: parsedInt
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