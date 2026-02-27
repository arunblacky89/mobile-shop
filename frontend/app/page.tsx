import Link from "next/link";

/* ─── Mock data (will come from API later) ─── */

const CATEGORIES = [
  { name: "Smartphones", slug: "smartphones", emoji: "📱" },
  { name: "Tablets", slug: "tablets", emoji: "💻" },
  { name: "Earbuds & Headphones", slug: "earbuds-headphones", emoji: "🎧" },
  { name: "Smartwatches", slug: "smartwatches", emoji: "⌚" },
  { name: "Chargers & Cables", slug: "chargers-cables", emoji: "🔌" },
  { name: "Power Banks", slug: "power-banks", emoji: "🔋" },
  { name: "Cases & Covers", slug: "cases-covers", emoji: "🛡️" },
  { name: "Screen Protectors", slug: "screen-protectors", emoji: "🖥️" },
];

const BEST_SELLERS = [
  { name: "iPhone 16 Pro Max", brand: "Apple", price: 144900, discount: 5, rating: 4.7, reviews: 2340, slug: "iphone-16-pro-max" },
  { name: "Galaxy S25 Ultra", brand: "Samsung", price: 134999, discount: 8, rating: 4.6, reviews: 1890, slug: "samsung-galaxy-s25-ultra" },
  { name: "OnePlus 13", brand: "OnePlus", price: 69999, discount: 10, rating: 4.5, reviews: 3200, slug: "oneplus-13" },
  { name: "Pixel 9 Pro", brand: "Google", price: 109999, discount: 12, rating: 4.5, reviews: 980, slug: "google-pixel-9-pro" },
  { name: "Redmi Note 14 Pro", brand: "Xiaomi", price: 18999, discount: 15, rating: 4.3, reviews: 12000, slug: "xiaomi-redmi-note-14-pro" },
  { name: "AirPods Pro 2", brand: "Apple", price: 24900, discount: 10, rating: 4.8, reviews: 15000, slug: "apple-airpods-pro-2" },
  { name: "Galaxy A55", brand: "Samsung", price: 29999, discount: 15, rating: 4.3, reviews: 4500, slug: "samsung-galaxy-a55" },
  { name: "Apple Watch Ultra 2", brand: "Apple", price: 89900, discount: 5, rating: 4.7, reviews: 1200, slug: "apple-watch-ultra-2" },
];

const DEALS = [
  { label: "₹10,000 Off", subtitle: "Flagship Phones", color: "from-orange-500 to-red-500" },
  { label: "Up to 40% Off", subtitle: "Earbuds & Audio", color: "from-purple-500 to-pink-500" },
  { label: "Under ₹999", subtitle: "Accessories", color: "from-green-500 to-teal-500" },
  { label: "New Arrivals", subtitle: "Wearables", color: "from-blue-500 to-indigo-500" },
];

/* ─── Helpers ─── */

function formatPrice(p: number) {
  return "₹" + p.toLocaleString("en-IN");
}
function salePrice(p: number, d: number) {
  return Math.round(p * (1 - d / 100));
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
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-16 text-white sm:py-24">
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
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl bg-gradient-to-br ${d.color} p-5 text-center text-white shadow-md transition hover:scale-105`}
          >
            <span className="text-lg font-bold">{d.label}</span>
            <span className="mt-1 text-xs opacity-90">{d.subtitle}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <span className="text-4xl">{c.emoji}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ p }: { p: (typeof BEST_SELLERS)[0] }) {
  const sale = salePrice(p.price, p.discount);
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      {/* placeholder image */}
      <div className="flex h-48 items-center justify-center rounded-t-xl bg-gray-100 text-6xl dark:bg-gray-700">
        📱
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-blue-600">{p.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white">
          {p.name}
        </h3>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(sale)}
            </span>
            {p.discount > 0 && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(p.price)}
                </span>
                <span className="text-xs font-semibold text-green-600">
                  {p.discount}% off
                </span>
              </>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <span className="text-yellow-500">★</span>
            {p.rating} ({p.reviews.toLocaleString()})
          </div>
        </div>
      </div>
    </Link>
  );
}

function BestSellers() {
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
        {BEST_SELLERS.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}

function BrandsStrip() {
  const brands = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Google", "Nothing", "Motorola"];
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Top Brands
      </h2>
      <div className="flex flex-wrap gap-3">
        {brands.map((b) => (
          <Link
            key={b}
            href={`/brand/${b.toLowerCase()}`}
            className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {b}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-4 py-10 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">MobileShop</h3>
            <p className="text-sm text-gray-500">India&apos;s #1 destination for smartphones, accessories and wearables.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/shop" className="hover:text-blue-600">All Products</Link></li>
              <li><Link href="/deals" className="hover:text-blue-600">Today&apos;s Deals</Link></li>
              <li><Link href="/brands" className="hover:text-blue-600">Brands</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/contact" className="hover:text-blue-600">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-blue-600">FAQ</Link></li>
              <li><Link href="/returns" className="hover:text-blue-600">Returns & Refunds</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          © 2026 MobileShop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-extrabold text-blue-600">
            📱 MobileShop
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link href="/shop" className="hidden hover:text-blue-600 sm:inline">Shop</Link>
            <Link href="/deals" className="hidden hover:text-blue-600 sm:inline">Deals</Link>
            <Link href="/cart" className="relative hover:text-blue-600">
              🛒
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                0
              </span>
            </Link>
            <Link href="/login" className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <HeroBanner />
      <DealsStrip />
      <CategoryGrid />
      <BestSellers />
      <BrandsStrip />
      <Footer />
    </div>
  );
}
