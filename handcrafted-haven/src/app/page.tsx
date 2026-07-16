import Link from "next/link";

const categories = [
  {
    name: "Jewelry",
    description: "Discover handcrafted pieces made with care.",
    icon: "◇",
  },
  {
    name: "Home Décor",
    description: "Add personality and warmth to your living space.",
    icon: "⌂",
  },
  {
    name: "Textiles",
    description: "Browse handmade clothing, blankets, and accessories.",
    icon: "✦",
  },
];

const products = [
  {
    id: 1,
    name: "Hand-Thrown Ceramic Mug",
    artisan: "Willow Creek Pottery",
    category: "Home Décor",
    price: 38,
    imageClass: "product-image-one",
  },
  {
    id: 2,
    name: "Sterling Silver Pendant",
    artisan: "Northern Light Jewelry",
    category: "Jewelry",
    price: 72,
    imageClass: "product-image-two",
  },
  {
    id: 3,
    name: "Handwoven Wool Scarf",
    artisan: "Prairie Threadworks",
    category: "Textiles",
    price: 55,
    imageClass: "product-image-three",
  },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="container navigation">
          <Link href="/" className="logo">
            Handcrafted Haven
          </Link>

          <nav aria-label="Main navigation">
            <ul className="nav-links">
              <li>
                <Link href="/products">Shop</Link>
              </li>
              <li>
                <Link href="/sellers">Artisans</Link>
              </li>
              <li>
                <Link href="/about">Our Story</Link>
              </li>
            </ul>
          </nav>

          <div className="account-links">
            <Link href="/login" className="text-link">
              Sign In
            </Link>
            <Link href="/register" className="button button-small">
              Join
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-content">
            <p className="eyebrow">Made by hand. Chosen with purpose.</p>

            <h1>Discover extraordinary creations from independent artisans.</h1>

            <p className="hero-description">
              Explore unique handcrafted products, support talented creators,
              and find meaningful items with stories behind them.
            </p>

            <div className="hero-actions">
              <Link href="/products" className="button">
                Browse Products
              </Link>

              <Link href="/register" className="button button-secondary">
                Become a Seller
              </Link>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="categories-heading">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Shop by interest</p>
                <h2 id="categories-heading">Explore handcrafted categories</h2>
              </div>

              <Link href="/products" className="text-link">
                View all products →
              </Link>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <article className="category-card" key={category.name}>
                  <span className="category-icon" aria-hidden="true">
                    {category.icon}
                  </span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <Link
                    href={`/products?category=${encodeURIComponent(
                      category.name,
                    )}`}
                  >
                    Explore category →
                  </Link>
                </article>
              ))}
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
                <h2 id="featured-heading">Featured creations</h2>
              </div>

              <Link href="/products" className="text-link">
                Shop all products →
              </Link>
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div
                    className={`product-image ${product.imageClass}`}
                    role="img"
                    aria-label={`Placeholder image for ${product.name}`}
                  />

                  <div className="product-details">
                    <p className="product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className="artisan-name">By {product.artisan}</p>

                    <div className="product-footer">
                      <strong>${product.price.toFixed(2)}</strong>
                      <Link href={`/products/${product.id}`}>
                        View product
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="artisan-section">
          <div className="container artisan-content">
            <div>
              <p className="eyebrow">Share your craftsmanship</p>
              <h2>Turn your creative passion into a thriving storefront.</h2>
              <p>
                Create a seller profile, tell your story, and introduce your
                handcrafted work to customers who value originality and
                thoughtful craftsmanship.
              </p>
            </div>

            <Link href="/register" className="button">
              Open Your Shop
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <Link href="/" className="logo footer-logo">
              Handcrafted Haven
            </Link>
            <p>Connecting thoughtful customers with talented creators.</p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="footer-links">
              <li>
                <Link href="/products">Shop</Link>
              </li>
              <li>
                <Link href="/sellers">Artisans</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
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
