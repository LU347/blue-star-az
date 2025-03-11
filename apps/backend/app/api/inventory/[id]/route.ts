//PUT, DELETE
import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { isStringValid } from "app/util/validators";
import { UpdateData } from "app/types/interfaces";

const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        if (!params || !params.id) {
            return NextResponse.json({ error: 'Item ID parameter is missing' }, { status: 400 });
        }

        const parsedId = parseInt(params.id, 10);
        if (isNaN(parsedId)) {
            return NextResponse.json({ error: 'Invalid item ID provided' }, { status: 400 });
        }

        const existingItem = await prisma.item.findUnique({ where: { id: parsedId }});
        if (!existingItem) {
            return NextResponse.json({ error: 'The item you are trying to update does not exist' }, { status: 404 });
        }
        const body = await req.json();
        const { newItemName, categoryId } = body;

        if (newItemName && !isStringValid(newItemName)) {
            return NextResponse.json({ error: 'Invalid item name' }, { status: 400 });
        }

        if (categoryId) {
            const parsedCategoryId = Number(categoryId);
            if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
                return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
            }

            const categoryExists = await prisma.category.findUnique({
                where: { id: parsedCategoryId },
            });

            if (!categoryExists) {
                return NextResponse.json({ error: 'Category does not exist' }, { status: 404 });
            }
        }

        const updateData: UpdateData = {};
        if (newItemName) updateData.itemName = newItemName;
        if (categoryId) updateData.categoryId = Number(categoryId);

        const updatedItem = await prisma.item.update({
            where: {
                id: parsedId,
            },
            data: updateData,
        });

        return NextResponse.json(
            { status: 'success', data: updatedItem },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: 'Error occurred while updating the item',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        if (!params || !params.id) {
            return NextResponse.json({ error: 'Item ID parameter is missing' }, { status: 400 });
        }

        const parsedId = parseInt(params.id, 10);
        if (isNaN(parsedId)) {
            return NextResponse.json({ error: 'Invalid item ID provided' }, { status: 400 });
        }

        const itemExists = await prisma.item.findUnique({
            where: { id: parsedId },
        });

        if (!itemExists) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        await prisma.item.delete({
            where: { id: parsedId },
        });

        return NextResponse.json({ status: 'success', message: 'Item deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: 'Error occurred while deleting the item',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        }, { status: 500 });
    }
}
