import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

/*
    Needs input validation and sanitation
*/

const prismaGlobal = global as typeof global & { 
    prisma?: PrismaClient
}

export const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, description, category } = body;

        const existingItem = await prisma.item.findUnique({ where: { name }});
        if (existingItem) {
            return NextResponse.json({ error: "Item already exists" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (prisma) => {
            try {
                const newItem = await prisma.item.create({
                    data: {
                        name,
                        description,
                        category
                    },
                })

                return newItem;
            } catch (error) {
                return NextResponse.json({ error: "Error creating item" }, { status: 500 });
            }
        });

        if (result) {
            return NextResponse.json(
                { status: 'success', message: "Item successfully created!" },
                { status: 201 }
            )
        }
    } catch (error) {
        return NextResponse.json({ error: "Item creation failed" }, { status: 500 })
    }
}