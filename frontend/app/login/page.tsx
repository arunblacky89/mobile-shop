import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { login } from "@/lib/auth";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    if (!username || !password) return;
    try {
      await login(username, password);
      redirect("/account");
    } catch {
      redirect("/login?error=1");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          Login
        </h1>
        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Username
            </label>
            <input
              name="username"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              name="password"
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

