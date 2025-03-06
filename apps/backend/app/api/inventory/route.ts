import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isStringValid } from "app/util/validators";
import { sanitizeField } from "app/util/sanitizers";

const prismaGlobal = global as typeof global & { 
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

function validateAndSanitizeInput(body: unknown) {
    const { itemName, categoryId } = body as { itemName: string; categoryId: number };
    const errors = [];

    if (!isStringValid(itemName)) {
        errors.push("Invalid item name")
    }

    if (!categoryId || typeof categoryId !== 'number') {
        errors.push("Category ID is required and must be a number.");
    }

    const sanitizedItemName = sanitizeField(itemName);

    return {
        errors,
        sanitizedInput: {
            itemName: sanitizedItemName,
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

        const { itemName, categoryId } = sanitizedInput;

        const existingItem = await prisma.item.findUnique({ where: { itemName: itemName as string }});
        if (existingItem) {
            return NextResponse.json({ error: "Item already exists" }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({ where: { id: categoryId }});
        if (!existingCategory) {
            return NextResponse.json({ error: "Missing or invalid item category" }, { status: 400 });
        }

        await prisma.item.create({
            data: {
                itemName: itemName as string,
                category: { connect: { id: categoryId }}
            }
        });
        
        return NextResponse.json(
            { status: 'success', message: "Item successfully created!" },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Item creation failed" }, { status: 500 })
    }
}