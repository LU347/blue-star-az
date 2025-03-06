import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isIDValid, isStringValid } from "app/util/validators";

const prismaGlobal = global as typeof global & { 
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

function validateAndSanitizeInput(body: unknown) {
    const { itemName, categoryId } = body as { itemName: string, categoryId: number};
    const errors = [];

    if (!isStringValid(itemName)) {
        errors.push("Invalid item name")
    }

    if (!isIDValid(categoryId)) {
        errors.push("Invalid ID provided");
    }

    const sanitizedItemName = itemName.trim().replace(/'/g, "''");

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

        const existingItem = await prisma.item.findUnique({ where: { itemName }});
        if (existingItem) {
            return NextResponse.json({ error: "Item already exists" }, { status: 400 });
        }

        const existingCategory = await prisma.category.findUnique({ where: { id: categoryId }});
        if (!existingCategory) {
            return NextResponse.json({ error: "Missing or invalid item category" }, { status: 404 });
        }

        await prisma.item.create({
            data: {
                itemName,
                category: { connect: { id: categoryId }}
            }
        });
        
        return NextResponse.json(
            { status: 'success', message: "Item successfully created!" },
            { status: 201 }
        )
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Item creation failed" }, { status: 500 })
    }
}