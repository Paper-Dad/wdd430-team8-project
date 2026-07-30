import Link from "next/link";

export default function Header() {
    return (
        <header className="site-header">
            <div className="header-content">
                <Link href="/" className="site-logo">
                    Handcrafted Haven
                </Link>

                <nav aria-label="Main navigation">
                    <ul className="nav-links">
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
            </div>
        </header>
    );
}