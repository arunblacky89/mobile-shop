import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet, type Order } from "@/lib/api";
import { getCartSession } from "@/lib/cartClient";

function formatPrice(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "₹0";
  return "₹" + n.toLocaleString("en-IN");
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;
  const cartSession = await getCartSession();

  let order: Order;
  try {
    order = await apiGet<Order>(`/api/orders/${id}/`, {
      headers: cartSession ? { "X-Cart-Session": cartSession } : undefined,
    });
  } catch {
    // Fallback: for guests, the backend requires auth to list orders
    // but we just placed the order, so we fetch directly
    // If it truly fails, show a generic message
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Placed!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your order <span className="font-mono text-sm">{id}</span> has been placed successfully.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const addr = order.shipping_address;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Success banner */}
        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/40">
            <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-green-800 dark:text-green-200">
            Order Placed Successfully!
          </h1>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            Order ID:{" "}
            <span className="font-mono">{order.id}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ─── Order Items ─── */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Items Ordered
            </h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const v = item.product_variant;
                const label =
                  typeof v === "object" && v.attributes
                    ? Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${String(val)}`)
                        .join(" • ")
                    : typeof v === "object"
                      ? v.sku
                      : `Variant #${v}`;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {label}
                      </p>
                      {typeof v === "object" && (
                        <p className="text-xs text-gray-400">{v.sku}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(item.price_snapshot)}
                    </p>
                  </div>
                );
              })}
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(order.subtotal)} {order.currency}
              </span>
            </div>
            <div className="mt-2 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              {order.status.replace(/_/g, " ")}
            </div>
          </section>

          {/* ─── Shipping Address ─── */}
          {addr && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Shipping To
              </h2>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {addr.full_name}
                </p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.state} – {addr.postal_code}
                </p>
                <p>{addr.country}</p>
                {addr.phone && (
                  <p className="mt-2 text-gray-500">📞 {addr.phone}</p>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
