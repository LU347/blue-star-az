//Get by ID, PUT, DELETE
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isIDValid } from "app/util/validators";

const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient
}

export const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

export async function PUT(req: Request, res: Response) {
    try {
        const body = await req.json();

        const { id, categoryName } = body;

        if (!id || isNaN(parseInt(id, 10))) {
            return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
        }

        const parsedId = parseInt(id, 10);

        const existingCategory = await prisma.category.findUnique({ where: { id: parsedId }});
        if (!existingCategory) {
            return NextResponse.json({ error: 'The category you are trying to update does not exist' }, { status: 404 })
        }

        await prisma.category.update({
            where: {
                id: parseInt(id, 10),
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
        return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
    }
}

export async function DELETE(req: Request, res: Response) {
    try {
        const body = await req.json();

        const { id } = body;

        const validationError = isIDValid(id); //replace with validateUserInput or it might be better to have three separate validator functions
        if (validationError) {
            return NextResponse.json({ error: validationError.error }, { status: 400 });
        }

        const categoryExists = await prisma.category.findUnique({ where: { id: parseInt(id, 10 )}});
        if (!categoryExists) {
            return NextResponse.json({ error: 'The category you are trying to delete does not exist' }, { status: 404});
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
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Error occurred when deleting category'}, { status: 500 });
    }
}