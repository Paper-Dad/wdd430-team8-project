import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;

        // Ping MongoDB to confirm that the connection works.
        await client.db("admin").command({ ping: 1 });

        const databaseName =
            process.env.MONGODB_DB ?? "handcrafted_haven";

        return NextResponse.json({
            success: true,
            message: "Connected to MongoDB successfully.",
            database: databaseName,
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "MongoDB connection failed.",
            },
            { status: 500 }
        );
    }
}