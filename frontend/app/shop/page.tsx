import Link from "next/link";
import Image from "next/image";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProducts, getCategories, type ProductListItem, type Category } from "@/lib/api";

/* ─── Helpers ─── */

function formatPrice(p: number) {
  return "₹" + p.toLocaleString("en-IN");
}

function discountPercent(price: number, mrp: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/* ─── Product Card ─── */

function ProductCard({ p }: { p: ProductListItem }) {
  const discount = p.price && p.mrp ? discountPercent(p.price, p.mrp) : 0;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Image */}
      <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-700">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <span className="text-6xl">📱</span>
        )}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-blue-600">{p.brand.name}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white">
          {p.title}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400">{p.category.name}</p>
        <div className="mt-auto pt-3">
          {p.price ? (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(p.price)}
              </span>
              {p.mrp && p.mrp > p.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(p.mrp)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">Price unavailable</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Sidebar Filters ─── */

function Sidebar({
  categories,
  activeCategory,
  search,
}: {
  categories: Category[];
  activeCategory?: string;
  search?: string;
}) {
  const roots = categories.filter((c) => c.parent === null);
  const children = (parentId: number) =>
    categories.filter((c) => c.parent === parentId);

  return (
    <aside className="w-full shrink-0 md:w-56">
      {/* Search */}
      <form className="mb-6">
        <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
          Search
        </label>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </form>

      {/* Categories */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">
          Categories
        </h3>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href="/shop"
              className={`block rounded-lg px-3 py-1.5 transition ${
                !activeCategory
                  ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/30"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              All Products
            </Link>
          </li>
          {roots.map((root) => (
            <li key={root.id}>
              <Link
                href={`/shop?category=${root.slug}`}
                className={`block rounded-lg px-3 py-1.5 font-medium transition ${
                  activeCategory === root.slug
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {root.name}
              </Link>
              <ul className="ml-3 mt-1 space-y-0.5">
                {children(root.id).map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/shop?category=${child.slug}`}
                      className={`block rounded-lg px-3 py-1 text-xs transition ${
                        activeCategory === child.slug
                          ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/30"
                          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ─── Page ─── */

export default async function ShopPage(props: {
  searchParams: Promise<{ category?: string; brand?: string; search?: string; page?: string; ordering?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { category, brand, search, page, ordering } = searchParams;

  let productsData: { count: number; next: string | null; previous: string | null; results: ProductListItem[] } = { count: 0, next: null, previous: null, results: [] };
  let categories: Category[] = [];

  try {
    const [pd, cats] = await Promise.all([
      getProducts({
        category,
        brand,
        search,
        ordering: ordering || "-created_at",
        page: page ? Number(page) : undefined,
      }),
      getCategories(),
    ]);
    productsData = pd;
    categories = cats;
  } catch {
    // Backend API unavailable — render page with empty data
  }

  const currentPage = page ? Number(page) : 1;
  const totalPages = Math.ceil(productsData.count / 20);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {category
              ? categories.find((c) => c.slug === category)?.name || "Shop"
              : search
              ? `Results for "${search}"`
              : "All Products"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {productsData.count} product{productsData.count !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar */}
          <Sidebar
            categories={categories}
            activeCategory={category}
            search={search}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="flex gap-2 text-xs">
                {[
                  { label: "Newest", value: "-created_at" },
                  { label: "Price ↑", value: "price" },
                  { label: "Price ↓", value: "-price" },
                  { label: "Name", value: "title" },
                ].map((s) => {
                  const isActive = (ordering || "-created_at") === s.value;
                  const params = new URLSearchParams();
                  if (category) params.set("category", category);
                  if (brand) params.set("brand", brand);
                  if (search) params.set("search", search);
                  params.set("ordering", s.value);
                  return (
                    <Link
                      key={s.value}
                      href={`/shop?${params.toString()}`}
                      className={`rounded-full px-3 py-1 transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {s.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            {productsData.results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {productsData.results.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-400">No products found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pg) => {
                    const params = new URLSearchParams();
                    if (category) params.set("category", category);
                    if (brand) params.set("brand", brand);
                    if (search) params.set("search", search);
                    if (ordering) params.set("ordering", ordering);
                    params.set("page", String(pg));
                    return (
                      <Link
                        key={pg}
                        href={`/shop?${params.toString()}`}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                          pg === currentPage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {pg}
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
