import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
    try {
        const database = await getDatabase();

        const categories = await database
            .collection("categories")
            .find({})
            .sort({ name: 1 })
            .toArray();

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Could not retrieve categories:", error);

        return NextResponse.json(
            { message: "Could not retrieve categories." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (typeof body.name !== "string" || !body.name.trim()) {
            return NextResponse.json(
                { message: "Category name is required." },
                { status: 400 }
            );
        }

        const newCategory = {
            name: body.name.trim(),
            description:
                typeof body.description === "string"
                    ? body.description.trim()
                    : "",
            imageUrl:
                typeof body.imageUrl === "string"
                    ? body.imageUrl.trim()
                    : "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const database = await getDatabase();

        const result = await database
            .collection("categories")
            .insertOne(newCategory);

        return NextResponse.json(
            {
                ...newCategory,
                _id: result.insertedId,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Could not create category:", error);

        return NextResponse.json(
            { message: "Could not create category." },
            { status: 500 }
        );
    }
}