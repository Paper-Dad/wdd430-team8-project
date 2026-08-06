import Header from "@/components/header";
import { getDatabase } from "@/lib/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Artisan {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  shopName: string;
  bio: string;
}

async function getArtisans(): Promise<Artisan[]> {
  const database = await getDatabase();

  const artisans = await database
    .collection("users")
    .find({ role: "artisan" })
    .sort({ firstName: 1, lastName: 1 })
    .toArray();

  return artisans.map((artisan) => ({
    _id: artisan._id.toString(),
    firstName: artisan.firstName ?? "",
    lastName: artisan.lastName ?? "",
    email: artisan.email ?? "",
    shopName: artisan.shopName ?? "Independent Artisan",
    bio: artisan.bio ?? "",
  }));
}

export default async function ArtisansPage() {
  const artisans = await getArtisans();

  return (
    <>
      <Header />

      <main className="artisans-page">
        <header className="artisans-header">
          <h1>Meet Our Artisans</h1>
          <p>Discover the talented creators behind our handcrafted products.</p>
        </header>

        {artisans.length === 0 ? (
          <p className="no-artisans">
            No artisan profiles are currently available.
          </p>
        ) : (
          <section className="artisans-grid">
            {artisans.map((artisan) => (
              <article key={artisan._id} className="artisan-card">
                <div className="artisan-initials" aria-hidden="true">
                  {artisan.firstName.charAt(0)}
                  {artisan.lastName.charAt(0)}
                </div>

                <h2>{artisan.shopName}</h2>

                <p className="artisan-owner">
                  {artisan.firstName} {artisan.lastName}
                </p>

                <p className="artisan-bio">{artisan.bio}</p>
                <div className="artisan-card-actions">
                  <a href={`mailto:${artisan.email}`} className="text-link">
                    {artisan.email}
                  </a>
                  <Link href={`/artisans/${artisan._id}`} className="button">
                    View Artisan
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

