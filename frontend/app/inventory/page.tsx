"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, ChevronDown, PackageSearch } from "lucide-react";

import {
  getInventoryBalances,
  getProducts,
  getWarehouses,
} from "@/lib/api";
import type { Warehouse } from "@/types/auth";
import type { InventoryBalance, ProductListItem } from "@/types/inventory";

function formatQuantity(value: string) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 3,
  }).format(Number(value));
}

export default function InventoryPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const lowStockCount = balances.filter((balance) => {
    const product = productById.get(balance.product_id);

    if (!product) {
      return false;
    }

    return Number(balance.quantity) <= Number(product.minimum_stock);
  }).length;

  useEffect(() => {
    async function loadCatalog() {
      const token = localStorage.getItem("opero_access_token");

      if (!token) {
        return;
      }

      setIsLoadingCatalog(true);
      setErrorMessage("");

      try {
        const [warehousesPage, productsPage] = await Promise.all([
          getWarehouses(token),
          getProducts(token),
        ]);

        setWarehouses(warehousesPage.items);
        setProducts(productsPage.items);

        if (warehousesPage.items.length > 0) {
          setSelectedWarehouseId(warehousesPage.items[0].id);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Не вдалося завантажити склад",
        );
      } finally {
        setIsLoadingCatalog(false);
      }
    }

    loadCatalog();
  }, []);

  useEffect(() => {
    async function loadBalances() {
      const token = localStorage.getItem("opero_access_token");

      if (!token || !selectedWarehouseId) {
        setBalances([]);
        return;
      }

      setIsLoadingBalances(true);
      setErrorMessage("");

      try {
        const inventoryBalances = await getInventoryBalances(token, selectedWarehouseId);
        setBalances(inventoryBalances);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Не вдалося завантажити залишки",
        );
      } finally {
        setIsLoadingBalances(false);
      }
    }

    loadBalances();
  }, [selectedWarehouseId]);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-opero-muted">Операції</p>
          <h2 className="text-2xl font-bold tracking-tight text-opero-text">
            Поточні залишки
          </h2>
          <p className="mt-1 text-sm text-opero-muted">
            Контроль товарів на обраному складі
          </p>
        </div>

        <label className="relative block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-opero-muted">
            Склад
          </span>
          <select
            value={selectedWarehouseId ?? ""}
            onChange={(event) => setSelectedWarehouseId(Number(event.target.value))}
            disabled={isLoadingCatalog || warehouses.length === 0}
            className="w-full appearance-none rounded-xl border border-opero-border bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-opero-text outline-none transition focus:border-opero-blue sm:w-72"
          >
            {warehouses.length === 0 ? (
              <option value="">Немає доступних складів</option>
            ) : null}

            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
                {warehouse.location ? ` — ${warehouse.location}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute bottom-3 right-3 text-opero-muted"
          />
        </label>
      </section>

      {lowStockCount > 0 ? (
        <section className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle size={19} className="shrink-0 text-amber-600" />
          Низький залишок у {lowStockCount} товарів
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-opero-border bg-white">
        {isLoadingCatalog || isLoadingBalances ? (
          <p className="p-6 text-sm text-opero-muted">Завантажуємо залишки</p>
        ) : null}

        {errorMessage ? (
          <p className="p-6 text-sm font-medium text-red-600">{errorMessage}</p>
        ) : null}

        {!isLoadingCatalog &&
        !isLoadingBalances &&
        !errorMessage &&
        balances.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <PackageSearch size={34} className="mb-3 text-opero-muted" />
            <h3 className="font-semibold text-opero-text">Залишків поки немає</h3>
            <p className="mt-1 text-sm text-opero-muted">
              Створи приймання товару, щоб він з’явився на складі
            </p>
          </div>
        ) : null}

        {!isLoadingCatalog &&
        !isLoadingBalances &&
        !errorMessage &&
        balances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-opero-border bg-slate-50 text-xs uppercase tracking-wide text-opero-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">SKU</th>
                  <th className="px-5 py-3 font-semibold">Товар</th>
                  <th className="px-5 py-3 font-semibold">Залишок</th>
                  <th className="px-5 py-3 font-semibold">Мінімум</th>
                  <th className="px-5 py-3 font-semibold">Стан</th>
                </tr>
              </thead>

              <tbody>
                {balances.map((balance) => {
                  const product = productById.get(balance.product_id);
                  const isLowStock =
                    product &&
                    Number(balance.quantity) <= Number(product.minimum_stock);

                  return (
                    <tr
                      key={balance.id}
                      className="border-b border-opero-border last:border-0"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-opero-muted">
                        {product?.sku ?? `ID-${balance.product_id}`}
                      </td>
                      <td className="px-5 py-4 font-semibold text-opero-text">
                        {product?.name ?? "Товар не знайдено"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-opero-text">
                        {formatQuantity(balance.quantity)} {product?.unit}
                      </td>
                      <td className="px-5 py-4 text-opero-muted">
                        {product
                          ? `${formatQuantity(product.minimum_stock)} ${product.unit}`
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            isLowStock
                              ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"
                              : "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
                          }
                        >
                          {isLowStock ? "Низький залишок" : "У нормі"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-opero-border bg-white p-5">
          <Boxes size={21} className="mb-3 text-opero-blue" />
          <p className="text-sm text-opero-muted">Найменувань у залишку</p>
          <p className="mt-1 text-3xl font-bold text-opero-text">{balances.length}</p>
        </div>

        <div className="rounded-2xl border border-opero-border bg-white p-5">
          <AlertTriangle size={21} className="mb-3 text-amber-500" />
          <p className="text-sm text-opero-muted">Потребують поповнення</p>
          <p className="mt-1 text-3xl font-bold text-opero-text">{lowStockCount}</p>
        </div>
      </section>
    </div>
  );
}