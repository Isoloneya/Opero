"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const session = await login(email, password);
      localStorage.setItem("opero_access_token", session.access_token);
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося виконати вхід",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-opero-navy p-12 text-white lg:flex lg:flex-col">
        <div className="relative z-10 flex items-center gap-3 text-2xl font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-opero-blue text-lg">
            O
          </span>
          Opero
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
            Operations workspace
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Керуйте складом і процесами в одному просторі
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
            Заявки, задачі, товарні залишки та історія операцій для команди.
          </p>
        </div>

        <p className="relative z-10 text-sm text-slate-400">Opero 0.1.0</p>

        <span className="absolute -bottom-36 -right-24 size-96 rounded-full bg-opero-blue/30 blur-3xl" />
        <span className="absolute -top-24 left-1/3 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="mb-12 flex items-center gap-3 text-2xl font-bold text-opero-text lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-opero-blue text-lg text-white">
              O
            </span>
            Opero
          </Link>

          <p className="text-sm font-medium text-opero-muted">Вітаємо знову</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-opero-text">
            Вхід до Opero
          </h2>
          <p className="mt-3 text-sm leading-6 text-opero-muted">
            Увійди, щоб продовжити роботу з операціями команди.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-opero-text">
                Email
              </span>
              <span className="relative block">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-opero-muted"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-xl border border-opero-border bg-white py-2.5 pl-10 pr-3 text-sm text-opero-text outline-none transition placeholder:text-slate-400 focus:border-opero-blue focus:ring-4 focus:ring-blue-100"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-opero-text">
                Пароль
              </span>
              <span className="relative block">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-opero-muted"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  minLength={8}
                  placeholder="Введи пароль"
                  required
                  className="w-full rounded-xl border border-opero-border bg-white py-2.5 pl-10 pr-3 text-sm text-opero-text outline-none transition placeholder:text-slate-400 focus:border-opero-blue focus:ring-4 focus:ring-blue-100"
                />
              </span>
            </label>

            {errorMessage ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? "Виконуємо вхід" : "Увійти"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-opero-muted">
            Ще немає облікового запису?{" "}
            <Link href="/register" className="font-semibold text-opero-blue">
              Зареєструватися
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}