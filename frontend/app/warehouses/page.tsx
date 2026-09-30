"use client";

import { FormEvent, useEffect, useState } from "react";
import { MapPin, Plus, Warehouse as WarehouseIcon, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { createWarehouse, getWarehouses } from "@/lib/api";
import type {
  CreateWarehousePayload,
  Warehouse,
} from "@/types/auth";

const initialForm: CreateWarehousePayload = {
  name: "",
  location: "",
};

export default function WarehousesPage() {
  const searchParams = useSearchParams();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<CreateWarehousePayload>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function loadWarehouses() {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    try {
      const response = await getWarehouses(token);
      setWarehouses(response.items);
      setTotal(response.total);
      setErrorMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося завантажити склади";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWarehouses();
  }, []);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setForm(initialForm);
      setFormErrorMessage("");
      setIsFormOpen(true);
    }
  }, [searchParams]);

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
      await createWarehouse(token, form);
      setIsFormOpen(false);
      setForm(initialForm);
      setIsLoading(true);
      await loadWarehouses();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося створити склад";
      setFormErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-opero-muted">Операції</p>
          <h2 className="text-2xl font-bold tracking-tight text-opero-text">Склад</h2>
          <p className="mt-1 text-sm text-opero-muted">Усього складів: {total}</p>
        </div>

        <button
          type="button"
          onClick={openForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          <Plus size={18} />
          Додати склад
        </button>
      </section>

      {isLoading ? (
        <p className="rounded-2xl border border-opero-border bg-white p-6 text-sm text-opero-muted">
          Завантажуємо склади
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((warehouse) => (
            <article
              key={warehouse.id}
              className="rounded-2xl border border-opero-border bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-opero-blue">
                  <WarehouseIcon size={22} />
                </span>

                <span
                  className={
                    warehouse.is_active
                      ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
                      : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600"
                  }
                >
                  {warehouse.is_active ? "Активний" : "Деактивований"}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-opero-text">{warehouse.name}</h3>

              <div className="mt-2 flex items-center gap-2 text-sm text-opero-muted">
                <MapPin size={16} />
                {warehouse.location ?? "Локацію не вказано"}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!isLoading && !errorMessage && warehouses.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-opero-border bg-white p-10 text-center">
          <WarehouseIcon className="mx-auto text-opero-muted" size={32} />
          <h3 className="mt-4 font-bold text-opero-text">Складів ще немає</h3>
          <p className="mt-2 text-sm text-opero-muted">
            Створи перший склад для обліку товарних залишків.
          </p>
        </section>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-20 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-6">
          <section className="w-full rounded-t-2xl bg-white p-6 sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-opero-muted">Операції</p>
                <h2 className="text-xl font-bold text-opero-text">Новий склад</h2>
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
                Назва складу
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
                  maxLength={120}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-opero-text">
                Локація
                <input
                  type="text"
                  value={form.location}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      location: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-opero-border px-3 py-2.5 font-normal outline-none transition focus:border-opero-blue"
                  maxLength={255}
                />
              </label>

              {formErrorMessage ? (
                <p className="text-sm font-medium text-red-600">{formErrorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-opero-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Створюємо склад" : "Створити склад"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
