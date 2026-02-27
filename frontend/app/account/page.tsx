import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchWithAuth } from "@/lib/auth";
import type { CartItem } from "@/lib/api";

type OrderItem = {
  product_variant: CartItem["product_variant"];
  quantity: number;
  price_snapshot: number | string;
  mrp_snapshot: number | string | null;
};

type Order = {
  id: string;
  status: string;
  subtotal: number | string;
  currency: string;
  items: OrderItem[];
  created_at: string;
};

export default async function AccountPage() {
  let orders: Order[] = [];
  try {
    orders = await fetchWithAuth<Order[]>("/api/orders/");
  } catch {
    // Not logged in or API unavailable
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          My account
        </h1>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Login to see your recent orders. If you are already logged in, you do not have any
            orders yet.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Order {order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-100">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

