import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";

export async function GET() {
    try {
        const database = await getDatabase();

        const users = await database
            .collection("users")
            .find(
                {},
                {
                    projection: {
                        password: 0,
                        passwordHash: 0,
                    },
                }
            )
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(users);
    } catch (error) {
        console.error("Could not retrieve users:", error);

        return NextResponse.json(
            { message: "Could not retrieve users." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (
            typeof body.firstName !== "string" ||
            !body.firstName.trim() ||
            typeof body.lastName !== "string" ||
            !body.lastName.trim() ||
            typeof body.email !== "string" ||
            !body.email.trim()
        ) {
            return NextResponse.json(
                {
                    message:
                        "First name, last name, and email are required.",
                },
                { status: 400 }
            );
        }

        const email = body.email.trim().toLowerCase();
        const database = await getDatabase();

        const existingUser = await database
            .collection("users")
            .findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: "A user with this email already exists." },
                { status: 409 }
            );
        }

        const newUser = {
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            email,
            role:
                body.role === "artisan" ? "artisan" : "customer",
            shopName:
                typeof body.shopName === "string"
                    ? body.shopName.trim()
                    : "",
            bio:
                typeof body.bio === "string"
                    ? body.bio.trim()
                    : "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await database
            .collection("users")
            .insertOne(newUser);

        return NextResponse.json(
            {
                ...newUser,
                _id: result.insertedId,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Could not create user:", error);

        return NextResponse.json(
            { message: "Could not create user." },
            { status: 500 }
        );
    }
}