import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
    try {
        const database = await getDatabase();

        const products = await database
            .collection("products")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(products);
    } catch (error) {
        console.error("Could not retrieve products:", error);

        return NextResponse.json(
            { message: "Could not retrieve products." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (
            typeof body.name !== "string" ||
            !body.name.trim() ||
            typeof body.description !== "string" ||
            !body.description.trim() ||
            typeof body.price !== "number" ||
            body.price < 0
        ) {
            return NextResponse.json(
                {
                    message:
                        "Name, description, and a valid price are required.",
                },
                { status: 400 }
            );
        }

        const newProduct = {
            name: body.name.trim(),
            description: body.description.trim(),
            price: body.price,
            categoryId: body.categoryId ?? null,
            artisanId: body.artisanId ?? null,
            images: Array.isArray(body.images)
                ? body.images
                : [],
            inventory: Number.isInteger(body.inventory)
                ? body.inventory
                : 0,
            materials: Array.isArray(body.materials)
                ? body.materials
                : [],
            customizable: Boolean(body.customizable),
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const database = await getDatabase();

        const result = await database
            .collection("products")
            .insertOne(newProduct);

        return NextResponse.json(
            {
                ...newProduct,
                _id: result.insertedId,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Could not create product:", error);

        return NextResponse.json(
            { message: "Could not create product." },
            { status: 500 }
        );
    }
}