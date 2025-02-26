import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prismaGlobal = global as typeof global & { 
    prisma?: PrismaClient
}

export const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

function validateAndSanitizeInput(body: any) {
    const { itemName, description, categoryId } = body;
    const errors = [];

    if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
        errors.push("Item name is required and must be a non-empty string.");
    }

    if (description && typeof description !== 'string') {
        errors.push("Description must be a string if provided.");
    }

    if (!categoryId || typeof categoryId !== 'number') {
        errors.push("Category ID is required and must be a number.");
    }

    const sanitizedItemName = itemName.trim().replace(/'/g, "''");
    const sanitizedDescription = description ? description.trim().replace(/'/g, "''") : null;

    return {
        errors,
        sanitizedInput: {
            itemName: sanitizedItemName,
            description: sanitizedDescription,
            categoryId
        }
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { errors, sanitizedInput } = validateAndSanitizeInput(body);
        if (errors.length > 0) {
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        const { itemName, description, categoryId } = sanitizedInput;

        const existingItem = await prisma.item.findUnique({ where: { itemName }});
        if (existingItem) {
            return NextResponse.json({ error: "Item already exists" }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({ where: { id: categoryId }});
        if (!existingCategory) {
            return NextResponse.json({ error: "Missing or invalid item category" }, { status: 400 });
        }

        const newItem = await prisma.item.create({
            data: {
                itemName,
                description,
                category: { connect: { id: categoryId }}
            }
        });

        return NextResponse.json(
            { status: 'success', message: "Item successfully created!" },
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json({ error: "Item creation failed" }, { status: 500 })
    }
}