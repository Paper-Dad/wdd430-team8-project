import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Header() {
  const session = await auth();

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
        <div className="account-links">
          {session?.user ? (
            <>
              <span className="account-name">{session.user.name}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-link">
                Sign In
              </Link>
              <Link href="/register" className="button button-small">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

