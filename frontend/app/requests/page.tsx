"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ClipboardList,
  PackagePlus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  PackageCheck,
} from "lucide-react";

import {
  createRequest,
  decideRequest,
  getCurrentUser,
  getProducts,
  getRequests,
  getWarehouses,
  completeRequest,
} from "@/lib/api";
import type { CurrentUser, Warehouse } from "@/types/auth";
import type { ProductListItem } from "@/types/inventory";
import type { RequestData, RequestType } from "@/types/request";

type DraftItem = {
  lineId: number;
  productId: number;
  quantity: string;
};

const statusLabels = {
  pending: "Очікує погодження",
  approved: "Погоджено",
  rejected: "Відхилено",
  completed: "Виконано",
};

const typeLabels = {
  issue: "Видача товарів",
  purchase: "Закупівля",
};

function formatQuantity(value: string) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 3,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);
  const [requestType, setRequestType] = useState<RequestType>("issue");
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [formError, setFormError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const warehouseById = useMemo(
    () => new Map(warehouses.map((warehouse) => [warehouse.id, warehouse])),
    [warehouses],
  );

  const canDecide =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const canComplete =
    currentUser?.role === "admin" || currentUser?.role === "warehouse_keeper";

  function closeCreateForm() {
    setIsCreateFormOpen(false);
    setRequestType("issue");
    setWarehouseId(warehouses[0]?.id ?? null);
    setReason("");
    setDraftItems(
      products[0]
        ? [
            {
              lineId: 1,
              productId: products[0].id,
              quantity: "",
            },
          ]
        : [],
    );
    setFormError("");
  }

  function openCreateForm() {
    setWarehouseId(warehouses[0]?.id ?? null);
    setDraftItems(
      products[0]
        ? [
            {
              lineId: 1,
              productId: products[0].id,
              quantity: "",
            },
          ]
        : [],
    );
    setFormError("");
    setIsCreateFormOpen(true);
  }

  function addDraftItem() {
    const firstProduct = products[0];

    if (!firstProduct) {
      return;
    }

    setDraftItems((items) => [
      ...items,
      {
        lineId: Date.now(),
        productId: firstProduct.id,
        quantity: "",
      },
    ]);
  }

  function updateDraftItem(
    lineId: number,
    field: "productId" | "quantity",
    value: number | string,
  ) {
    setDraftItems((items) =>
      items.map((item) =>
        item.lineId === lineId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function removeDraftItem(lineId: number) {
    setDraftItems((items) => items.filter((item) => item.lineId !== lineId));
  }

  async function loadData() {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const [requestsPage, warehousesPage, productsPage, user] = await Promise.all([
        getRequests(token),
        getWarehouses(token),
        getProducts(token),
        getCurrentUser(token),
      ]);

      setRequests(requestsPage.items);
      setWarehouses(warehousesPage.items);
      setProducts(productsPage.items.filter((product) => product.is_active));
      setCurrentUser(user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося завантажити заявки",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("opero_access_token");

    if (!token || !warehouseId || !reason.trim() || draftItems.length === 0) {
      setFormError("Заповни склад, причину та щонайменше одну позицію");
      return;
    }

    const items = draftItems.map((item) => ({
      product_id: item.productId,
      quantity: Number(item.quantity),
    }));

    if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      setFormError("Кількість кожної позиції має бути більшою за нуль");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const createdRequest = await createRequest(token, {
        type: requestType,
        warehouse_id: warehouseId,
        reason: reason.trim(),
        items,
      });

      setRequests((items) => [createdRequest, ...items]);
      closeCreateForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Не вдалося створити заявку",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDecision(
    requestId: number,
    status: "approved" | "rejected",
    decisionComment?: string,
  ) {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const updatedRequest = await decideRequest(token, requestId, {
        status,
        decision_comment: decisionComment,
      });

      setRequests((items) =>
        items.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request,
        ),
      );
      setRejectingRequestId(null);
      setRejectionReason("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося оновити заявку",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

    async function handleCompleteRequest(requestId: number) {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
        return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
        const updatedRequest = await completeRequest(token, requestId);

        setRequests((items) =>
        items.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request,
        ),
        );
    } catch (error) {
        setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося виконати заявку",
        );
    } finally {
        setIsSubmitting(false);
    }
    }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-opero-muted">Операції</p>
          <h2 className="text-2xl font-bold tracking-tight text-opero-text">Заявки</h2>
          <p className="mt-1 text-sm text-opero-muted">
            Створення, погодження та контроль заявок
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          disabled={isLoading || products.length === 0 || warehouses.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Нова заявка
        </button>
      </section>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <section className="rounded-2xl border border-opero-border bg-white p-6 text-sm text-opero-muted">
          Завантажуємо заявки
        </section>
      ) : null}

      {!isLoading && requests.length === 0 ? (
        <section className="flex flex-col items-center rounded-2xl border border-opero-border bg-white px-6 py-16 text-center">
          <ClipboardList size={36} className="mb-3 text-opero-muted" />
          <h3 className="font-semibold text-opero-text">Заявок поки немає</h3>
          <p className="mt-1 text-sm text-opero-muted">
            Створи першу заявку на видачу товарів або закупівлю
          </p>
        </section>
      ) : null}

      {!isLoading && requests.length > 0 ? (
        <section className="space-y-3">
          {requests.map((request) => {
            const warehouse = warehouseById.get(request.warehouse_id);
            const isPending = request.status === "pending";

            return (
              <article
                key={request.id}
                className="rounded-2xl border border-opero-border bg-white p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-bold text-opero-text">
                        {request.request_number}
                      </p>
                      <span
                        className={
                          request.type === "issue"
                            ? "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700"
                            : "rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700"
                        }
                      >
                        {typeLabels[request.type]}
                      </span>
                      <span
                        className={
                          request.status === "pending"
                            ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"
                            : request.status === "approved"
                              ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"
                              : request.status === "rejected"
                                ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"
                                : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700"
                        }
                      >
                        {statusLabels[request.status]}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-opero-text">{request.reason}</p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-opero-muted">
                      <span>{warehouse?.name ?? "Склад не знайдено"}</span>
                      <span>{formatDate(request.created_at)}</span>
                      <span>{request.items.length} позицій</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {request.items.map((item) => {
                        const product = productById.get(item.product_id);

                        return (
                          <span
                            key={item.id}
                            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-opero-text"
                          >
                            {product?.name ?? `Товар #${item.product_id}`} ·{" "}
                            {formatQuantity(item.quantity)} {product?.unit}
                          </span>
                        );
                      })}
                    </div>

                    {request.decision_comment ? (
                      <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-opero-muted">
                        {request.decision_comment}
                      </p>
                    ) : null}
                  </div>

                  {canDecide && isPending ? (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision(request.id, "approved")}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <Check size={17} />
                        Погодити
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setRejectingRequestId(request.id)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Відхилити
                      </button>
                    </div>
                  ) : null}
                  {canComplete &&
                    request.status === "approved" &&
                    request.type === "issue" ? (
                    <div className="mt-2 flex justify-end xl:mt-0">
                        <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleCompleteRequest(request.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-opero-blue px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
                        >
                        <PackageCheck size={17} />
                        Виконати
                        </button>
                    </div>
                    ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {isCreateFormOpen ? (
        <div className="fixed inset-0 z-30 flex items-end bg-slate-950/35 p-0 sm:items-center sm:justify-center sm:p-4">
          <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-opero-muted">Операції</p>
                <h3 className="text-xl font-bold text-opero-text">Нова заявка</h3>
              </div>

              <button
                type="button"
                onClick={closeCreateForm}
                className="grid size-9 place-items-center rounded-xl text-opero-muted transition hover:bg-slate-100"
                aria-label="Закрити форму"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleCreateRequest}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-opero-text">
                    Тип заявки
                  </span>
                  <select
                    value={requestType}
                    onChange={(event) => setRequestType(event.target.value as RequestType)}
                    className="w-full rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none focus:border-opero-blue"
                  >
                    <option value="issue">Видача товарів</option>
                    <option value="purchase">Закупівля</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-opero-text">
                    Склад
                  </span>
                  <select
                    value={warehouseId ?? ""}
                    onChange={(event) => setWarehouseId(Number(event.target.value))}
                    className="w-full rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none focus:border-opero-blue"
                  >
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-opero-text">
                  Причина
                </span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  placeholder="Опиши призначення товарів або потребу в закупівлі"
                  className="w-full resize-none rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none placeholder:text-slate-400 focus:border-opero-blue"
                />
              </label>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-opero-text">Позиції</p>
                  <button
                    type="button"
                    onClick={addDraftItem}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-opero-blue"
                  >
                    <Plus size={16} />
                    Додати позицію
                  </button>
                </div>

                <div className="space-y-3">
                  {draftItems.map((item) => (
                    <div
                      key={item.lineId}
                      className="grid grid-cols-[1fr_110px_40px] gap-2"
                    >
                      <select
                        value={item.productId}
                        onChange={(event) =>
                          updateDraftItem(
                            item.lineId,
                            "productId",
                            Number(event.target.value),
                          )
                        }
                        className="min-w-0 rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none focus:border-opero-blue"
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} — {product.sku}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={item.quantity}
                        onChange={(event) =>
                          updateDraftItem(item.lineId, "quantity", event.target.value)
                        }
                        placeholder="К-сть"
                        className="w-full rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none placeholder:text-slate-400 focus:border-opero-blue"
                      />

                      <button
                        type="button"
                        onClick={() => removeDraftItem(item.lineId)}
                        disabled={draftItems.length === 1}
                        className="grid size-10 place-items-center rounded-xl text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Видалити позицію"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {formError ? (
                <p className="text-sm font-medium text-red-600">{formError}</p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="flex-1 rounded-xl border border-opero-border px-4 py-2.5 text-sm font-semibold text-opero-text transition hover:bg-slate-50"
                >
                  Скасувати
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {requestType === "issue" ? (
                    <PackagePlus size={18} />
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                  {isSubmitting ? "Зберігаємо" : "Створити заявку"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {rejectingRequestId ? (
        <div className="fixed inset-0 z-40 flex items-end bg-slate-950/35 p-0 sm:items-center sm:justify-center sm:p-4">
          <section className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <h3 className="text-xl font-bold text-opero-text">Відхилити заявку</h3>
            <p className="mt-1 text-sm text-opero-muted">
              Вкажи причину, щоб автор заявки розумів наступні дії
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-opero-border px-3 py-2.5 text-sm text-opero-text outline-none focus:border-opero-blue"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingRequestId(null);
                  setRejectionReason("");
                }}
                className="flex-1 rounded-xl border border-opero-border px-4 py-2.5 text-sm font-semibold text-opero-text"
              >
                Скасувати
              </button>

              <button
                type="button"
                disabled={!rejectionReason.trim() || isSubmitting}
                onClick={() =>
                  handleDecision(
                    rejectingRequestId,
                    "rejected",
                    rejectionReason.trim(),
                  )
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                Відхилити
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}