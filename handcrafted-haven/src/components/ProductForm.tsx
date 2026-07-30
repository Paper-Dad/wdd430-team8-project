"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  _id: string;
  name: string;
}

export default function ProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?._id ?? "");
  const [inventory, setInventory] = useState("0");
  const [materials, setMaterials] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [customizable, setCustomizable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsedPrice = Number(price);
    if (
      !name.trim() ||
      !description.trim() ||
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      setError("Please fill in a name, description, and a valid price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parsedPrice,
          categoryId: categoryId || null,
          inventory: Number.isInteger(Number(inventory))
            ? Number(inventory)
            : 0,
          materials: materials
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean),
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
          customizable,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Could not create product.");
      }

      const created = await response.json();
      router.push(`/products/${created._id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <div className="form-field">
        <label htmlFor="name">Product name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="inventory">Inventory</label>
          <input
            id="inventory"
            type="number"
            min="0"
            step="1"
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="materials">Materials (comma separated)</label>
        <input
          id="materials"
          type="text"
          placeholder="Stoneware clay, glaze"
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div className="checkbox-field">
        <input
          id="customizable"
          type="checkbox"
          checked={customizable}
          onChange={(e) => setCustomizable(e.target.checked)}
        />
        <label htmlFor="customizable">This product can be customized</label>
      </div>

      <div className="form-actions">
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create product"}
        </button>
      </div>
    </form>
  );
}
