import Link from "next/link";

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        description: string;
        price: number;
        images: string[];
        inventory?: number;
        categoryName: string;
        artisanName: string;
        shopName?: string;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const image =
        product.images[0] ?? "/images/product-placeholder.jpg";

    return (
        <article className="product-card">
            <img
                src={image}
                alt={product.name}
                className="product-image"
            />

            <div className="product-content">
                <p className="product-category">
                    {product.categoryName}
                </p>

                <h2>{product.name}</h2>

                <p className="product-description">
                    {product.description}
                </p>

                <p className="product-price">
                    ${product.price.toFixed(2)}
                </p>

                <p className="product-artisan">
                    By {product.shopName || product.artisanName}
                </p>

                {typeof product.inventory === "number" && (
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
                )}

                <Link
                    href={`/products/${product._id}`}
                    className="button"
                >
                    View Product
                </Link>
            </div>
        </article>
    );
}