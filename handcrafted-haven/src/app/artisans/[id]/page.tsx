import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import Header from "@/components/header";
import { getDatabase } from "@/lib/database";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface Artisan {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    shopName: string;
    bio: string;
}

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

interface ArtisanPageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getArtisanAndProducts(id: string) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    const database = await getDatabase();
    const artisanObjectId = new ObjectId(id);

    const artisanDocument = await database.collection("users").findOne({
        _id: artisanObjectId,
        role: "artisan",
    });

    if (!artisanDocument) {
        return null;
    }

    const productDocuments = await database
        .collection("products")
        .aggregate([
            {
                $match: {
                    artisanId: artisanObjectId,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
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

    const artisan: Artisan = {
        _id: artisanDocument._id.toString(),
        firstName: artisanDocument.firstName ?? "",
        lastName: artisanDocument.lastName ?? "",
        email: artisanDocument.email ?? "",
        shopName: artisanDocument.shopName ?? "Independent Artisan",
        bio: artisanDocument.bio ?? "",
    };

    const products: Product[] = productDocuments.map((product) => ({
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
            [artisanDocument.firstName, artisanDocument.lastName]
                .filter(Boolean)
                .join(" ") || "Unknown artisan",
        shopName:
            artisanDocument.shopName ?? "Independent Artisan",
    }));

    return {
        artisan,
        products,
    };
}

export default async function ArtisanDetailsPage({
    params,
}: ArtisanPageProps) {
    const { id } = await params;
    const data = await getArtisanAndProducts(id);

    if (!data) {
        notFound();
    }

    const { artisan, products } = data;

    return (
        <>
            <Header />

            <main className="artisan-details-page">
                <section className="artisan-profile">
                    <div className="artisan-profile-initials" aria-hidden="true">
                        {artisan.firstName.charAt(0)}
                        {artisan.lastName.charAt(0)}
                    </div>

                    <div>
                        <p className="eyebrow">Featured artisan</p>

                        <h1>{artisan.shopName}</h1>

                        <p className="artisan-profile-name">
                            {artisan.firstName} {artisan.lastName}
                        </p>

                        <p className="artisan-profile-bio">{artisan.bio}</p>

                    </div>
                </section>

                <section
                    className="artisan-products-section"
                    aria-labelledby="artisan-products-heading"
                >
                    <div className="artisan-products-heading">
                        <div>
                            <p className="eyebrow">Made by this artisan</p>

                            <h2 id="artisan-products-heading">
                                Products from {artisan.shopName}
                            </h2>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <p className="no-products">
                            This artisan has not listed any products yet.
                        </p>
                    ) : (
                        <div className="product-grid">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}