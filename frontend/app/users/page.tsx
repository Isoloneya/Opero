"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";

import { createUser, getUsers } from "@/lib/api";
import type { CreateUserPayload, UserListItem } from "@/types/auth";

const roleLabels = {
  admin: "Адміністратор",
  manager: "Менеджер",
  warehouse_keeper: "Комірник",
  employee: "Працівник",
};

const initialForm: CreateUserPayload = {
  full_name: "",
  email: "",
  password: "",
  role: "employee",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<CreateUserPayload>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function loadUsers() {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    try {
      const response = await getUsers(token);
      setUsers(response.items);
      setTotal(response.total);
      setErrorMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося завантажити користувачів";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function openForm() {
    setForm(initialForm);
    setFormErrorMessage("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (!isSubmitting) {
      setIsFormOpen(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      setFormErrorMessage("Сесія завершилася. Увійди до системи повторно.");
      return;
    }

    setIsSubmitting(true);
    setFormErrorMessage("");

    try {
      await createUser(token, form);
      setIsFormOpen(false);
      setForm(initialForm);
      setIsLoading(true);
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося створити користувача";
      setFormErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-opero-muted">Адміністрування</p>
          <h2 className="text-2xl font-bold tracking-tight text-opero-text">
            Користувачі
          </h2>
          <p className="mt-1 text-sm text-opero-muted">Усього користувачів: {total}</p>
        </div>

        <button
          type="button"
          onClick={openForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          <UserPlus size={18} />
          Додати користувача
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-opero-border bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-opero-muted">Завантажуємо користувачів</p>
        ) : null}

        {errorMessage ? (
          <p className="p-6 text-sm font-medium text-red-600">{errorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-opero-border bg-slate-50 text-xs uppercase tracking-wide text-opero-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Користувач</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Роль</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-opero-border last:border-0">
                    <td className="px-5 py-4 font-semibold text-opero-text">
                      {user.full_name}
                    </td>
                    <td className="px-5 py-4 text-opero-muted">{user.email}</td>
                    <td className="px-5 py-4 text-opero-muted">
                      {roleLabels[user.role]}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          user.is_active
                            ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
                            : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600"
                        }
                      >
                        {user.is_active ? "Активний" : "Деактивований"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-20 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-6">
          <section className="w-full rounded-t-2xl bg-white p-6 sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-opero-muted">Адміністрування</p>
                <h2 className="text-xl font-bold text-opero-text">Новий користувач</h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="grid size-10 place-items-center rounded-xl border border-opero-border text-opero-muted"
                aria-label="Закрити форму"
              >
                <X size={20} />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-semibold text-opero-text">
                Повне ім’я
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      full_name: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                  minLength={2}
                  maxLength={120}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-opero-text">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      email: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-opero-text">
                Пароль
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      password: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                  minLength={8}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-opero-text">
                Роль
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      role: event.target.value as CreateUserPayload["role"],
                    }))
                  }
                  className="rounded-xl border border-opero-border bg-white px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                >
                  <option value="employee">Працівник</option>
                  <option value="warehouse_keeper">Комірник</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Адміністратор</option>
                </select>
              </label>

              {formErrorMessage ? (
                <p className="text-sm font-medium text-red-600">{formErrorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-opero-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Створюємо користувача" : "Створити користувача"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}