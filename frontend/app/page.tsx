import Link from "next/link";
import Image from "next/image";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProducts, getCategories, getBrands } from "@/lib/api";
import type { Product, Category, Brand, Paginated } from "@/lib/types";

/* ─── Static promo data (not from API) ─── */

const DEALS = [
  { label: "₹10,000 Off", subtitle: "Flagship Phones", color: "from-orange-500 to-red-500" },
  { label: "Up to 40% Off", subtitle: "Earbuds & Audio", color: "from-purple-500 to-pink-500" },
  { label: "Under ₹999", subtitle: "Accessories", color: "from-green-500 to-teal-500" },
  { label: "New Arrivals", subtitle: "Wearables", color: "from-blue-500 to-indigo-500" },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  smartphones: "📱",
  tablets: "💻",
  "earbuds-headphones": "🎧",
  earbuds: "🎧",
  headphones: "🎧",
  smartwatches: "⌚",
  wearables: "⌚",
  "chargers-cables": "🔌",
  chargers: "🔌",
  "power-banks": "🔋",
  "cases-covers": "🛡️",
  cases: "🛡️",
  "screen-protectors": "🖥️",
  accessories: "🎒",
  laptops: "💻",
  audio: "🎵",
};

/* ─── Helpers ─── */

function formatPrice(p: number) {
  return "₹" + p.toLocaleString("en-IN");
}

function discountPercent(price: number, mrp: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/* ─── Components ─── */

function SearchBar() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <input
        type="text"
        placeholder="Search phones, accessories, brands..."
        className="w-full rounded-full border border-gray-300 bg-white py-3 pl-5 pr-12 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <button className="absolute right-1.5 top-1.5 rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-16 text-white sm:py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white" />
      </div>
      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-200">
          India&apos;s #1 Mobile Store
        </p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
          Latest Smartphones,<br />
          <span className="text-yellow-300">Unbeatable Prices</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
          Shop flagship phones from ₹14,999. Free delivery, easy EMI, 7-day returns.
        </p>
        <div className="mt-8">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}

function DealsStrip() {
  return (
    <section className="bg-gray-50 py-6 dark:bg-gray-900">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:grid-cols-4">
        {DEALS.map((d) => (
          <div
            key={d.label}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl bg-linear-to-br ${d.color} p-5 text-center text-white shadow-md transition hover:scale-105`}
          >
            <span className="text-lg font-bold">{d.label}</span>
            <span className="mt-1 text-xs opacity-90">{d.subtitle}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.slice(0, 8).map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <span className="text-4xl">{CATEGORY_EMOJIS[c.slug] || "📦"}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ p }: { p: Product }) {
  const discount =
    p.price != null && p.mrp != null ? discountPercent(p.price, p.mrp) : 0;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Image */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-700">
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
        <p className="text-xs font-medium text-blue-600">
          {p.brand?.name ?? ""}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white">
          {p.title}
        </h3>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {p.price != null ? formatPrice(p.price) : "—"}
            </span>
            {discount > 0 && p.mrp != null && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(p.mrp)}
                </span>
                <span className="text-xs font-semibold text-green-600">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {p.category?.name ?? ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

function BestSellers({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Best Sellers
        </h2>
        <Link href="/shop" className="text-sm font-medium text-blue-600 hover:underline">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

function BrandsStrip({ brands }: { brands: Brand[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Top Brands
      </h2>
      <div className="flex flex-wrap gap-3">
        {brands.slice(0, 12).map((b) => (
          <Link
            key={b.slug}
            href={`/shop?brand=${b.slug}`}
            className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── Page (Server Component — fetches from Django API at build/request time) ─── */

export default async function Home() {
  let products: Product[] = [];
  let categories: Category[] = [];
  let brands: Brand[] = [];

  try {
    const [productsRes, cats, brs] = await Promise.all([
      getProducts({ page: 1 }),
      getCategories(),
      getBrands(),
    ]);
    products = productsRes.results;
    categories = cats;
    brands = brs;
  } catch {
    // Backend API unavailable — render page with empty data
  }

  const apiOnline = products.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Sections */}
      <HeroBanner />
      <DealsStrip />
      <CategoryGrid categories={categories} />
      <BestSellers products={products} />
      <BrandsStrip brands={brands} />
      <Footer />

      {/* Live API indicator */}
      {apiOnline && (
        <div className="fixed bottom-4 right-4 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
          ✅ Live from Django API
        </div>
      )}
    </div>
  );
}
