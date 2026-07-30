import Link from "next/link";
import Header from "@/components/header";
import ProductCard from "@/components/ProductCard";

import { getDatabase } from "@/lib/database";

export const dynamic = "force-dynamic";

interface FeaturedProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  inventory: number;
  categoryName: string;
  artisanName: string;
  shopName: string;
}

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
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
        $limit: 3,
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
    categoryName: product.category?.name ?? "Uncategorized",
    artisanName:
      [product.artisan?.firstName, product.artisan?.lastName]
        .filter(Boolean)
        .join(" ") || "Unknown artisan",
    shopName: product.artisan?.shopName ?? "",
  }));
}

export default async function Home() {
  const products = await getFeaturedProducts();
  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <div className="container hero-content">
            <p className="eyebrow">
              Made by hand. Chosen with purpose.
            </p>

            <h1>
              Discover extraordinary creations from independent artisans.
            </h1>

            <p className="hero-description">
              Explore unique handcrafted products, support talented creators,
              and find meaningful items with stories behind them.
            </p>

            <div className="hero-actions">
              <Link href="/products" className="button">
                Browse Products
              </Link>

              <Link href="/artisans" className="button button-secondary">
                Meet the Artisans
              </Link>
            </div>
          </div>
        </section>

        <section
          className="section section-accent"
          aria-labelledby="featured-heading"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Made with care</p>
                <h2 id="featured-heading">
                  Featured creations
                </h2>
              </div>

              <Link href="/products" className="text-link">
                Shop all products →
              </Link>
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
            
          </div>
        </section>

        <section className="artisan-section">
          <div className="container artisan-content">
            <div>
              <p className="eyebrow">
                Share your craftsmanship
              </p>

              <h2>
                Turn your creative passion into a thriving storefront.
              </h2>

              <p>
                Create a seller profile, tell your story, and introduce
                your handcrafted work to customers who value originality
                and thoughtful craftsmanship.
              </p>
            </div>

            <Link href="/artisans" className="button">
              View Our Artisans
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  Customer experiences
                </p>

                <h2>
                  See what shoppers are saying
                </h2>
              </div>

              <Link href="/reviews" className="text-link">
                Read all reviews →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <Link href="/" className="logo footer-logo">
              Handcrafted Haven
            </Link>

            <p>
              Connecting thoughtful customers with talented creators.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>

              <li>
                <Link href="/products">Products</Link>
              </li>

              <li>
                <Link href="/artisans">Artisans</Link>
              </li>

              <li>
                <Link href="/reviews">Reviews</Link>
              </li>
            </ul>
          </nav>

          <p className="copyright">
            © {new Date().getFullYear()} Handcrafted Haven
          </p>
        </div>
      </footer>
    </>
  );
}