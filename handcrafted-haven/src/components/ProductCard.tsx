import Link from "next/link";
import Image from "next/image";

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
    eager?: boolean;
}

export default function ProductCard({
    product,
    eager = false,
}: ProductCardProps) {
    const image =
        product.images?.[0]?.trim() ||
        "/images/product-placeholder.jpg";

    return (
        <article className="product-card">
            <div className="product-image-container">
                <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 850px) 100vw, 33vw"
                    className="product-image"
                    loading={eager ? "eager" : "lazy"}
                />
            </div>

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