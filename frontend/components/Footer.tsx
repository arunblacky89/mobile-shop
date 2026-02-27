import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-4 py-10 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              MobileShop
            </h3>
            <p className="text-sm text-gray-500">
              India&apos;s #1 destination for smartphones, accessories and
              wearables.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/shop" className="hover:text-blue-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-blue-600">
                  Today&apos;s Deals
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-blue-600">
                  Brands
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase text-gray-500">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-blue-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-blue-600">
                  Returns & Refunds
                </Link>
              </li>
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
