import Link from "next/link";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import Header from "@/components/header";
import { getDatabase } from "@/lib/database";

export const dynamic = "force-dynamic";

interface ProductDetails {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    inventory: number;
    materials: string[];
    categoryName: string;
    categoryDescription: string;
    artisanId: string | null;
    artisanName: string;
    shopName: string;
    artisanBio: string;
}

interface ProductReview {
    _id: string;
    rating: number;
    title: string;
    comment: string;
    reviewerName: string;
}

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getProductDetails(id: string) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    const database = await getDatabase();
    const productObjectId = new ObjectId(id);

    const productDocuments = await database
        .collection("products")
        .aggregate([
            {
                $match: {
                    _id: productObjectId,
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
        ])
        .toArray();

    const productDocument = productDocuments[0];

    if (!productDocument) {
        return null;
    }

    const reviewDocuments = await database
        .collection("reviews")
        .aggregate([
            {
                $match: {
                    productId: productObjectId,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    rating: -1,
                },
            },
        ])
        .toArray();

    const product: ProductDetails = {
        _id: productDocument._id.toString(),
        name: productDocument.name ?? "Unnamed product",
        description: productDocument.description ?? "",
        price: productDocument.price ?? 0,
        images: Array.isArray(productDocument.images)
            ? productDocument.images
            : [],
        inventory: productDocument.inventory ?? 0,
        materials: Array.isArray(productDocument.materials)
            ? productDocument.materials
            : [],
        categoryName:
            productDocument.category?.name ?? "Uncategorized",
        categoryDescription:
            productDocument.category?.description ?? "",
        artisanId: productDocument.artisan?._id
            ? productDocument.artisan._id.toString()
            : null,
        artisanName:
            [
                productDocument.artisan?.firstName,
                productDocument.artisan?.lastName,
            ]
                .filter(Boolean)
                .join(" ") || "Unknown artisan",
        shopName:
            productDocument.artisan?.shopName ??
            "Independent Artisan",
        artisanBio: productDocument.artisan?.bio ?? "",
    };

    const reviews: ProductReview[] = reviewDocuments.map((review) => ({
        _id: review._id.toString(),
        rating: review.rating ?? 0,
        title: review.title ?? "Untitled review",
        comment: review.comment ?? "",
        reviewerName:
            [review.user?.firstName, review.user?.lastName]
                .filter(Boolean)
                .join(" ") || "Anonymous customer",
    }));

    const averageRating =
        reviews.length > 0
            ? reviews.reduce(
                (total, review) => total + review.rating,
                0,
            ) / reviews.length
            : 0;

    return {
        product,
        reviews,
        averageRating,
    };
}

export default async function ProductDetailsPage({
    params,
}: ProductPageProps) {
    const { id } = await params;
    const data = await getProductDetails(id);

    if (!data) {
        notFound();
    }

    const { product, reviews, averageRating } = data;

    const mainImage =
        product.images[0] ??
        "/images/product-placeholder.jpg";

    return (
        <>
            <Header />

            <main className="product-details-page">
                <Link href="/products" className="text-link">
                    ← Back to products
                </Link>

                <section className="product-details">
                    <div className="product-details-image-container">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="product-details-image"
                        />
                    </div>

                    <div className="product-details-content">
                        <p className="product-category">
                            {product.categoryName}
                        </p>

                        <h1>{product.name}</h1>

                        <p className="product-details-price">
                            ${product.price.toFixed(2)}
                        </p>

                        {reviews.length > 0 && (
                            <p className="product-average-rating">
                                {"★".repeat(
                                    Math.round(averageRating),
                                )}
                                {"☆".repeat(
                                    5 - Math.round(averageRating),
                                )}{" "}
                                {averageRating.toFixed(1)} from{" "}
                                {reviews.length}{" "}
                                {reviews.length === 1
                                    ? "review"
                                    : "reviews"}
                            </p>
                        )}

                        <p className="product-details-description">
                            {product.description}
                        </p>

                        {product.materials.length > 0 && (
                            <div className="product-material-list">
                                <h2>Materials</h2>

                                <ul>
                                    {product.materials.map(
                                        (material) => (
                                            <li key={material}>
                                                {material}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}

                        <p
                            className={
                                product.inventory > 0
                                    ? "in-stock"
                                    : "out-of-stock"
                            }
                        >
                            {product.inventory > 0
                                ? `${product.inventory} available`
                                : "Out of stock"}
                        </p>
                    </div>
                </section>

                <section className="product-artisan-section">
                    <p className="eyebrow">
                        Created by
                    </p>

                    <h2>{product.shopName}</h2>

                    <p className="product-artisan-name">
                        {product.artisanName}
                    </p>

                    {product.artisanBio && (
                        <p>{product.artisanBio}</p>
                    )}

                    {product.artisanId && (
                        <Link
                            href={`/artisans/${product.artisanId}`}
                            className="button"
                        >
                            View Artisan
                        </Link>
                    )}
                </section>

                <section
                    className="product-reviews-section"
                    aria-labelledby="product-reviews-heading"
                >
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                Customer experiences
                            </p>

                            <h2 id="product-reviews-heading">
                                Product Reviews
                            </h2>
                        </div>

                        <Link
                            href="/reviews"
                            className="text-link"
                        >
                            View all reviews →
                        </Link>
                    </div>

                    {reviews.length === 0 ? (
                        <p>
                            This product does not have any reviews yet.
                        </p>
                    ) : (
                        <div className="reviews-grid">
                            {reviews.map((review) => (
                                <article
                                    key={review._id}
                                    className="review-card"
                                >
                                    <div
                                        className="review-rating"
                                        aria-label={`${review.rating} out of 5 stars`}
                                    >
                                        {"★".repeat(review.rating)}
                                        {"☆".repeat(
                                            Math.max(
                                                0,
                                                5 - review.rating,
                                            ),
                                        )}
                                    </div>

                                    <h3>{review.title}</h3>

                                    <p className="review-author">
                                        Reviewed by{" "}
                                        {review.reviewerName}
                                    </p>

                                    <p>{review.comment}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}