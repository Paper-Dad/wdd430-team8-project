import clientPromise from "@/lib/mongodb";

const databaseName =
    process.env.MONGODB_DB ?? "handcrafted_haven";

export async function getDatabase() {
    const client = await clientPromise;
    return client.db(databaseName);
}