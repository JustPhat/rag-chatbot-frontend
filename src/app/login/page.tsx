"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      saveAuth(response.access_token, {
        user_id: response.user_id,
        email: response.email,
        full_name: response.full_name,
      });

      router.push("/chat");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-4 text-[var(--text-main)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-main)] bg-[var(--panel-bg)] p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
            RAG Chatbot
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Đăng nhập để hỏi đáp với tài liệu của bạn.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-main)]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--card-bg)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-main)]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--card-bg)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-medium text-blue-500 transition hover:text-blue-400"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </main>
  );
}
