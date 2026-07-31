import Header from "@/components/header";
import ProductForm from "@/components/ProductForm";
import { getDatabase } from "@/lib/database";

export const dynamic = "force-dynamic";

interface Category {
  _id: string;
  name: string;
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
    name: category.name ?? "Uncategorized",
  }));
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <>
      <Header />

      <main className="new-product-page">
        <header className="products-header">
          <h1>Add a new product</h1>
          <p>
            Share your handcrafted work with the Handcrafted Haven community.
          </p>
        </header>

        <ProductForm categories={categories} />
      </main>
    </>
  );
}
