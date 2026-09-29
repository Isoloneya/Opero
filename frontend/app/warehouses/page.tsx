"use client";

import { useEffect, useState } from "react";
import { MapPin, Warehouse as WarehouseIcon } from "lucide-react";

import { getWarehouses } from "@/lib/api";
import type { Warehouse } from "@/types/auth";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWarehouses() {
      const token = localStorage.getItem("opero_access_token");

      if (!token) {
        return;
      }

      try {
        const response = await getWarehouses(token);
        setWarehouses(response.items);
        setTotal(response.total);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Не вдалося завантажити склади";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadWarehouses();
  }, []);

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
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          <WarehouseIcon size={18} />
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
    </div>
  );
}