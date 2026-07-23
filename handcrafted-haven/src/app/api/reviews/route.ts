import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
    try {
        const productId =
            request.nextUrl.searchParams.get("productId");

        const filter =
            productId && ObjectId.isValid(productId)
                ? { productId: new ObjectId(productId) }
                : {};

        const database = await getDatabase();

        const reviews = await database
            .collection("reviews")
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Could not retrieve reviews:", error);

        return NextResponse.json(
            { message: "Could not retrieve reviews." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (
            typeof body.productId !== "string" ||
            !ObjectId.isValid(body.productId) ||
            typeof body.userId !== "string" ||
            !ObjectId.isValid(body.userId) ||
            !Number.isInteger(body.rating) ||
            body.rating < 1 ||
            body.rating > 5
        ) {
            return NextResponse.json(
                {
                    message:
                        "Valid product ID, user ID, and rating from 1 to 5 are required.",
                },
                { status: 400 }
            );
        }

        const newReview = {
            productId: new ObjectId(body.productId),
            userId: new ObjectId(body.userId),
            rating: body.rating,
            title:
                typeof body.title === "string"
                    ? body.title.trim()
                    : "",
            comment:
                typeof body.comment === "string"
                    ? body.comment.trim()
                    : "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const database = await getDatabase();

        const result = await database
            .collection("reviews")
            .insertOne(newReview);

        return NextResponse.json(
            {
                ...newReview,
                _id: result.insertedId,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Could not create review:", error);

        return NextResponse.json(
            { message: "Could not create review." },
            { status: 500 }
        );
    }
}