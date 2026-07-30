import Header from "@/components/header";
import ProductCard from "@/components/ProductCard";
import { getDatabase } from "@/lib/database";
import Link from "next/link";
export const dynamic = "force-dynamic";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    inventory: number;
    materials: string[];
    categoryName: string;
    artisanName: string;
    shopName: string;
}

async function getProducts(): Promise<Product[]> {
    const database = await getDatabase();

    const products = await database
        .collection("products")
        .aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "artisanId",
                    foreignField: "_id",
                    as: "artisan",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$artisan",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    name: 1,
                },
            },
        ])
        .toArray();

    return products.map((product) => ({
        _id: product._id.toString(),
        name: product.name ?? "Unnamed product",
        description: product.description ?? "",
        price: product.price ?? 0,
        images: Array.isArray(product.images) ? product.images : [],
        inventory: product.inventory ?? 0,
        materials: Array.isArray(product.materials)
            ? product.materials
            : [],
        categoryName: product.category?.name ?? "Uncategorized",
        artisanName:
            [product.artisan?.firstName, product.artisan?.lastName]
                .filter(Boolean)
                .join(" ") || "Unknown artisan",
        shopName: product.artisan?.shopName ?? "",
    }));
}

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <>
            <Header />

            <main className="products-page">
                <header className="products-header">
                    <h1>Handcrafted Products</h1>
                    <p>
                        Explore unique products created by independent artisans.
                    </p>
                </header>

                {products.length === 0 ? (
                    <p className="no-products">
                        No products are currently available.
                    </p>
                ) : (
                        <section className="product-grid">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                />
                            ))}
                        </section>
                )}
            </main>
        </>
    );
}