import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isEmpty, isStringValid } from "app/util/validators";
import { WhereConditions } from "app/types/interfaces";

const MAX_RESULTS = 50

const prismaGlobal = global as typeof global & { 
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('search')?.trim();
        const categoryId = searchParams.get('categoryId')?.trim();

        if (query && !isStringValid(query)) {
            return NextResponse.json({ error: 'Invalid search query' }, { status: 400 });
        }

        if (categoryId && isNaN(Number(categoryId))) {
            return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
        }

        const whereConditions: WhereConditions = {};

        if (query) {
            whereConditions.itemName = { contains: query, mode: 'insensitive' }; 
        }

        if (categoryId) {
            const parsedCategoryId = Number(categoryId);
            if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
                return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
            }

            const categoryExists = await prisma.category.findUnique({
                where: { id: parsedCategoryId }
            });

            if (!categoryExists) {
                return NextResponse.json({ error: 'Category does not exist' }, { status: 404 });
            }
        }

        const itemsFound = await prisma.item.findMany({
            where: whereConditions, 
            take: MAX_RESULTS 
        });

        if (isEmpty(itemsFound)) {
            return NextResponse.json({ error: 'No items found' }, { status: 404 });
        }

        return NextResponse.json(
            { status: 'success', data: itemsFound },
            { status: 200 }
        )
    } catch (error) {
        console.error(error);
        return NextResponse.json({ 
            error: 'Error occurred while searching for items',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { itemName, categoryId } = body;
        if (!isStringValid(itemName)) {
            return NextResponse.json({ error: 'Missing or invalid item name' }, { status: 400})
        }

        const existingItem = await prisma.item.findUnique({ where: { itemName: itemName as string }});
        if (existingItem) {
            return NextResponse.json({ error: "Item already exists" }, { status: 400 });
        }

        const parsedCategoryId = parseInt(categoryId, 10);

        const existingCategory = await prisma.category.findUnique({ where: { id: parsedCategoryId }});
        if (!existingCategory) {
            return NextResponse.json({ error: "Missing or invalid item category" }, { status: 400 });
        }

        await prisma.item.create({
            data: {
                itemName: itemName as string,
                category: { connect: { id: parsedCategoryId }}
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