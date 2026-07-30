import { getDatabase } from "@/lib/database";
import Header from "@/components/header";

export const dynamic = "force-dynamic";

interface Review {
    _id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt?: string;
    productName: string;
    reviewerName: string;
}

async function getReviews(): Promise<Review[]> {
    const database = await getDatabase();

    const reviews = await database
        .collection("reviews")
        .aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
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
                    path: "$product",
                    preserveNullAndEmptyArrays: true,
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
                    createdAt: -1,
                },
            },
        ])
        .toArray();

    return reviews.map((review) => ({
        _id: review._id.toString(),
        rating: review.rating ?? 0,
        title: review.title ?? "Untitled review",
        comment: review.comment ?? "",
        productName: review.product?.name ?? "Unknown product",
        reviewerName:
            [review.user?.firstName, review.user?.lastName]
                .filter(Boolean)
                .join(" ") || "Anonymous customer",
        createdAt:
            review.createdAt instanceof Date
                ? review.createdAt.toISOString()
                : undefined,
    }));
}

export default async function ReviewsPage() {
    const reviews = await getReviews();

    return (
        <>
            <Header />

            <main className="reviews-page">
                <header className="reviews-header">
                    <h1>Customer Reviews</h1>
                    <p>
                        See what customers are saying about our handcrafted products.
                    </p>
                </header>

                {reviews.length === 0 ? (
                    <p className="no-reviews">
                        No reviews have been submitted yet.
                    </p>
                ) : (
                    <section className="reviews-grid">
                        {reviews.map((review) => (
                            <article key={review._id} className="review-card">
                                <div
                                    className="review-rating"
                                    aria-label={`${review.rating} out of 5 stars`}
                                >
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(Math.max(0, 5 - review.rating))}
                                </div>

                                <h2>{review.title}</h2>

                                <p className="review-product">
                                    Product: {review.productName}
                                </p>

                                <p className="review-author">
                                    Reviewed by {review.reviewerName}
                                </p>

                                <p>{review.comment}</p>

                                {review.createdAt && (
                                    <time dateTime={review.createdAt}>
                                        {new Date(
                                            review.createdAt
                                        ).toLocaleDateString("en-CA", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </time>
                                )}
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </>
    );
}