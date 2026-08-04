import Link from "next/link";
import { ObjectId } from "mongodb";
import Header from "@/components/header";
import ProductCard from "@/components/ProductCard";
import { getDatabase } from "@/lib/database";

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

interface Category {
    _id: string;
    name: string;
}

interface ProductsPageProps {
    searchParams: Promise<{
        category?: string | string[];
        minPrice?: string | string[];
        maxPrice?: string | string[];
    }>;
}

function getSingleValue(
    value: string | string[] | undefined,
): string {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function getCategories(): Promise<Category[]> {
    const database = await getDatabase();

    const categories = await database
        .collection("categories")
        .find({})
        .sort({ name: 1 })
        .toArray();

    return categories.map((category) => ({
        _id: category._id.toString(),
        name: category.name ?? "Unnamed category",
    }));
}

async function getProducts(
    categoryId: string,
    minPrice: number | null,
    maxPrice: number | null,
): Promise<Product[]> {
    const database = await getDatabase();

    const match: {
        categoryId?: ObjectId;
        price?: {
            $gte?: number;
            $lte?: number;
        };
    } = {};

    if (categoryId && ObjectId.isValid(categoryId)) {
        match.categoryId = new ObjectId(categoryId);
    }

    if (minPrice !== null || maxPrice !== null) {
        match.price = {};

        if (minPrice !== null) {
            match.price.$gte = minPrice;
        }

        if (maxPrice !== null) {
            match.price.$lte = maxPrice;
        }
    }

    const products = await database
        .collection("products")
        .aggregate([
            {
                $match: match,
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
        images: Array.isArray(product.images)
            ? product.images
            : [],
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

export default async function ProductsPage({
    searchParams,
}: ProductsPageProps) {
    const parameters = await searchParams;

    const selectedCategory = getSingleValue(parameters.category);
    const minimumPriceText = getSingleValue(parameters.minPrice);
    const maximumPriceText = getSingleValue(parameters.maxPrice);

    const parsedMinimum = Number(minimumPriceText);
    const parsedMaximum = Number(maximumPriceText);

    const minimumPrice =
        minimumPriceText !== "" &&
            Number.isFinite(parsedMinimum) &&
            parsedMinimum >= 0
            ? parsedMinimum
            : null;

    const maximumPrice =
        maximumPriceText !== "" &&
            Number.isFinite(parsedMaximum) &&
            parsedMaximum >= 0
            ? parsedMaximum
            : null;

    const [products, categories] = await Promise.all([
        getProducts(
            selectedCategory,
            minimumPrice,
            maximumPrice,
        ),
        getCategories(),
    ]);

    const invalidPriceRange =
        minimumPrice !== null &&
        maximumPrice !== null &&
        minimumPrice > maximumPrice;

    const filtersApplied =
        selectedCategory !== "" ||
        minimumPrice !== null ||
        maximumPrice !== null;

    return (
        <>
            <Header />

            <main className="products-page">
                <header className="products-header">
                    <h1>Handcrafted Products</h1>

                    <p>
                        Explore unique products created by independent
                        artisans.
                    </p>
                </header>

                <form
                    action="/products"
                    method="get"
                    className="product-filters"
                >
                    <div className="filter-field">
                        <label htmlFor="category">Category</label>

                        <select
                            id="category"
                            name="category"
                            defaultValue={selectedCategory}
                        >
                            <option value="">All categories</option>

                            {categories.map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-field">
                        <label htmlFor="minPrice">
                            Minimum price
                        </label>

                        <input
                            id="minPrice"
                            name="minPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            defaultValue={minimumPriceText}
                        />
                    </div>

                    <div className="filter-field">
                        <label htmlFor="maxPrice">
                            Maximum price
                        </label>

                        <input
                            id="maxPrice"
                            name="maxPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="100"
                            defaultValue={maximumPriceText}
                        />
                    </div>

                    <div className="filter-actions">
                        <button type="submit" className="button">
                            Apply Filters
                        </button>

                        {filtersApplied && (
                            <Link
                                href="/products"
                                className="filter-reset"
                            >
                                Clear Filters
                            </Link>
                        )}
                    </div>
                </form>

                {invalidPriceRange ? (
                    <p className="filter-message filter-error">
                        Minimum price cannot be greater than maximum
                        price.
                    </p>
                ) : (
                    <>
                        <p className="product-result-count">
                            {products.length}{" "}
                            {products.length === 1
                                ? "product"
                                : "products"}{" "}
                            found
                        </p>

                        {products.length === 0 ? (
                            <div className="no-products">
                                <p>
                                    No products match the selected
                                    filters.
                                </p>

                                <Link
                                    href="/products"
                                    className="text-link"
                                >
                                    Clear all filters
                                </Link>
                            </div>
                        ) : (
                            <section
                                className="product-grid"
                                aria-label="Available products"
                            >
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                    />
                                ))}
                            </section>
                        )}
                    </>
                )}
            </main>
        </>
    );
}