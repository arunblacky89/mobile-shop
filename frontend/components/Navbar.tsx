import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-extrabold text-blue-600">
          📱 MobileShop
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="/shop" className="hidden hover:text-blue-600 sm:inline">
            Shop
          </Link>
          <Link href="/deals" className="hidden hover:text-blue-600 sm:inline">
            Deals
          </Link>
          <Link href="/cart" className="relative hover:text-blue-600">
            🛒
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              0
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
