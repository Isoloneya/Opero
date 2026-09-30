"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { register } from "@/lib/api";
import type { RegisterPayload } from "@/types/auth";

const initialForm: RegisterPayload = {
  full_name: "",
  email: "",
  password: "",
  role: "employee",
};

const roleLabels = {
  employee: "Працівник",
  warehouse_keeper: "Комірник",
  manager: "Менеджер",
  admin: "Адміністратор",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterPayload>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const session = await register(form);
      localStorage.setItem("opero_access_token", session.access_token);
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося зареєструватися",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-opero-navy p-12 text-white lg:flex lg:flex-col">
        <Link href="/login" className="relative z-10 flex items-center gap-3 text-2xl font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-opero-blue text-lg">
            O
          </span>
          Opero
        </Link>

        <div className="relative z-10 my-auto max-w-md">
          <span className="grid size-12 place-items-center rounded-2xl bg-blue-500/20 text-blue-200">
            <ShieldCheck size={25} />
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight">
            Створи демо-простір для тестування Opero
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            У демо-режимі можна обрати роль і перевірити всі сценарії системи.
          </p>
        </div>

        <p className="relative z-10 text-sm text-slate-400">Opero 0.1.0</p>

        <span className="absolute -bottom-36 -right-24 size-96 rounded-full bg-opero-blue/30 blur-3xl" />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="mb-10 flex items-center gap-3 text-2xl font-bold text-opero-text lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-opero-blue text-lg text-white">
              O
            </span>
            Opero
          </Link>

          <p className="text-sm font-medium text-opero-muted">Демо-режим</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-opero-text">
            Створити обліковий запис
          </h1>
          <p className="mt-3 text-sm leading-6 text-opero-muted">
            Після реєстрації ти одразу потрапиш на дашборд.
          </p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-opero-text">
                Повне ім’я
              </span>
              <span className="relative block">
                <UserRound
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-opero-muted"
                />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      full_name: event.target.value,
                    }))
                  }
                  minLength={2}
                  maxLength={120}
                  placeholder="Ім’я та прізвище"
                  required
                  className="w-full rounded-xl border border-opero-border bg-white py-2.5 pl-10 pr-3 text-sm text-opero-text outline-none transition placeholder:text-slate-400 focus:border-opero-blue focus:ring-4 focus:ring-blue-100"
                />
              </span>
            </label>

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
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
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
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  minLength={8}
                  placeholder="Щонайменше 8 символів"
                  required
                  className="w-full rounded-xl border border-opero-border bg-white py-2.5 pl-10 pr-3 text-sm text-opero-text outline-none transition placeholder:text-slate-400 focus:border-opero-blue focus:ring-4 focus:ring-blue-100"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-opero-text">
                Роль для демо
              </span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as RegisterPayload["role"],
                  }))
                }
                className="w-full rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none transition focus:border-opero-blue focus:ring-4 focus:ring-blue-100"
              >
                {Object.entries(roleLabels).map(([role, label]) => (
                  <option key={role} value={role}>
                    {label}
                  </option>
                ))}
              </select>
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
              {isLoading ? "Створюємо обліковий запис" : "Створити й увійти"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-opero-muted">
            Уже є обліковий запис?{" "}
            <Link href="/login" className="font-semibold text-opero-blue">
              Увійти
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}