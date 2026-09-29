"use client";

import { FormEvent, useEffect, useState } from "react";
import { Package, PackagePlus, Search, X } from "lucide-react";

import {
  createProduct,
  getProducts,
  type CreateProductPayload,
  type Product,
} from "@/lib/products-api";

const initialForm = {
  sku: "",
  name: "",
  unit: "шт",
  minimum_stock: "0",
};

function formatQuantity(value: string) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 3,
  }).format(Number(value));
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function loadProducts(currentSearch: string) {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    try {
      const response = await getProducts(token, currentSearch);
      setProducts(response.items);
      setTotal(response.total);
      setErrorMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося завантажити товари";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts(search);
  }, [search]);

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

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setSearch(searchInput);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      setFormErrorMessage("Сесія завершилася. Увійди до системи повторно.");
      return;
    }

    const payload: CreateProductPayload = {
      sku: form.sku,
      name: form.name,
      unit: form.unit,
      minimum_stock: Number(form.minimum_stock),
    };

    setIsSubmitting(true);
    setFormErrorMessage("");

    try {
      await createProduct(token, payload);
      setIsFormOpen(false);
      setForm(initialForm);
      setIsLoading(true);
      await loadProducts(search);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося створити товар";
      setFormErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm text-opero-muted">Адміністрування</p>
          <h2 className="text-2xl font-bold tracking-tight text-opero-text">Товари</h2>
          <p className="mt-1 text-sm text-opero-muted">Усього товарів: {total}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Пошук за SKU або назвою"
              className="w-full rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-opero-blue sm:w-72"
            />
            <button
              type="submit"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-opero-border bg-white text-opero-muted transition hover:bg-slate-50"
              aria-label="Шукати"
            >
              <Search size={18} />
            </button>
          </form>

          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            <PackagePlus size={18} />
            Додати товар
          </button>
        </div>
      </section>

      {isLoading ? (
        <p className="rounded-2xl border border-opero-border bg-white p-6 text-sm text-opero-muted">
          Завантажуємо товари
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage ? (
        <section className="overflow-hidden rounded-2xl border border-opero-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-opero-border bg-slate-50 text-xs uppercase tracking-wide text-opero-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">SKU</th>
                  <th className="px-5 py-3 font-semibold">Товар</th>
                  <th className="px-5 py-3 font-semibold">Одиниця</th>
                  <th className="px-5 py-3 font-semibold">Мінімальний залишок</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-opero-border last:border-0">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-opero-muted">
                      {product.sku}
                    </td>
                    <td className="px-5 py-4 font-semibold text-opero-text">{product.name}</td>
                    <td className="px-5 py-4 text-opero-muted">{product.unit}</td>
                    <td className="px-5 py-4 text-opero-muted">
                      {formatQuantity(product.minimum_stock)} {product.unit}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          product.is_active
                            ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
                            : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600"
                        }
                      >
                        {product.is_active ? "Активний" : "Деактивований"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!isLoading && !errorMessage && products.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-opero-border bg-white p-10 text-center">
          <Package className="mx-auto text-opero-muted" size={32} />
          <h3 className="mt-4 font-bold text-opero-text">Товарів не знайдено</h3>
          <p className="mt-2 text-sm text-opero-muted">
            Зміни пошуковий запит або створи перший товар.
          </p>
        </section>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-20 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-6">
          <section className="w-full rounded-t-2xl bg-white p-6 sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-opero-muted">Адміністрування</p>
                <h2 className="text-xl font-bold text-opero-text">Новий товар</h2>
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
                SKU
                <input
                  type="text"
                  value={form.sku}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      sku: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                  maxLength={64}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-opero-text">
                Назва товару
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                  minLength={2}
                  maxLength={160}
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-2 text-sm font-semibold text-opero-text">
                  Одиниця виміру
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        unit: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                    maxLength={20}
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-opero-text">
                  Мінімальний залишок
                  <input
                    type="number"
                    value={form.minimum_stock}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        minimum_stock: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                    min="0"
                    step="0.001"
                    required
                  />
                </label>
              </div>

              {formErrorMessage ? (
                <p className="text-sm font-medium text-red-600">{formErrorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-opero-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Створюємо товар" : "Створити товар"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}