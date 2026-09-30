"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckSquare,
  ClipboardList,
  PackageSearch,
} from "lucide-react";

import {
  getCurrentUser,
  getInventoryBalances,
  getProducts,
  getRequests,
  getTasks,
  getUsers,
  getWarehouses,
} from "@/lib/api";
import type { CurrentUser, UserListItem, Warehouse } from "@/types/auth";
import type { InventoryBalance, ProductListItem } from "@/types/inventory";
import type { RequestData } from "@/types/request";
import type { TaskData } from "@/types/task";

const requestStatusLabels = {
  pending: "Очікує погодження",
  approved: "Погоджено",
  rejected: "Відхилено",
  completed: "Виконано",
};

const requestTypeLabels = {
  issue: "Видача",
  purchase: "Закупівля",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function dueDateLabel(value: string | null) {
  if (!value) {
    return "Без дедлайну";
  }

  const today = new Date().toISOString().slice(0, 10);

  if (value === today) {
    return "Сьогодні";
  }

  return formatDate(value);
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "done") {
      return false;
    }

    return task.due_date < new Date().toISOString().slice(0, 10);
  });

  const lowBalances = balances.filter((balance) => {
    const product = productById.get(balance.product_id);

    if (!product) {
      return false;
    }

    return Number(balance.quantity) <= Number(product.minimum_stock);
  });

  const myTasks = tasks
    .filter(
      (task) =>
        task.assigned_to === currentUser?.id &&
        task.status !== "done",
    )
    .slice(0, 3);

  async function loadDashboard() {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const [requestsPage, tasksPage, usersPage, productsPage, warehousesPage, user] =
        await Promise.all([
          getRequests(token),
          getTasks(token),
          getUsers(token),
          getProducts(token),
          getWarehouses(token),
          getCurrentUser(token),
        ]);

      const warehouseBalances = await Promise.all(
        warehousesPage.items.map((warehouse) =>
          getInventoryBalances(token, warehouse.id),
        ),
      );

      setRequests(requestsPage.items);
      setTasks(tasksPage.items);
      setUsers(usersPage.items);
      setProducts(productsPage.items);
      setWarehouses(warehousesPage.items);
      setBalances(warehouseBalances.flat());
      setCurrentUser(user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити дані дашборду",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const statistics = [
    {
      label: "Очікують погодження",
      value: pendingRequests.length,
      description: "Заявки, що потребують рішення",
      color: "text-opero-blue",
    },
    {
      label: "Прострочені задачі",
      value: overdueTasks.length,
      description: "Потребують уваги команди",
      color: "text-red-600",
    },
    {
      label: "Низький залишок",
      value: lowBalances.length,
      description: "Позиції для поповнення",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <section className="rounded-2xl border border-opero-border bg-white p-6 text-sm text-opero-muted">
          Завантажуємо дашборд
        </section>
      ) : null}

      {!isLoading ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            {statistics.map((statistic) => (
              <article
                key={statistic.label}
                className="rounded-2xl border border-opero-border bg-white p-5"
              >
                <p className="text-sm font-medium text-opero-muted">
                  {statistic.label}
                </p>
                <p
                  className={`mt-2 text-3xl font-bold tracking-tight ${statistic.color}`}
                >
                  {statistic.value}
                </p>
                <p className="mt-2 text-sm text-opero-muted">
                  {statistic.description}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            <article className="overflow-hidden rounded-2xl border border-opero-border bg-white">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="font-bold text-opero-text">Останні заявки</h2>
                <Link
                  href="/requests"
                  className="text-sm font-semibold text-opero-blue"
                >
                  Усі заявки
                </Link>
              </div>

              {requests.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <ClipboardList size={28} className="mb-3 text-opero-muted" />
                  <p className="text-sm text-opero-muted">Заявок поки немає</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-y border-opero-border bg-slate-50 text-xs uppercase tracking-wide text-opero-muted">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Номер</th>
                        <th className="px-5 py-3 font-semibold">Автор</th>
                        <th className="px-5 py-3 font-semibold">Тип</th>
                        <th className="px-5 py-3 font-semibold">Статус</th>
                      </tr>
                    </thead>

                    <tbody>
                      {requests.slice(0, 3).map((request) => {
                        const author = userById.get(request.requested_by);

                        return (
                          <tr
                            key={request.id}
                            className="border-b border-opero-border last:border-0"
                          >
                            <td className="px-5 py-4 font-mono text-xs font-bold text-opero-text">
                              {request.request_number}
                            </td>
                            <td className="px-5 py-4 text-opero-muted">
                              {author?.full_name ?? `Користувач #${request.requested_by}`}
                            </td>
                            <td className="px-5 py-4 text-opero-muted">
                              {requestTypeLabels[request.type]}
                            </td>
                            <td className="px-5 py-4">
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
                                {requestStatusLabels[request.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-opero-border bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-opero-text">Мої задачі</h2>
                <Link
                  href="/tasks"
                  className="text-sm font-semibold text-opero-blue"
                >
                  Усі
                </Link>
              </div>

              {myTasks.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CheckSquare size={28} className="mb-3 text-emerald-600" />
                  <p className="text-sm text-opero-muted">Активних задач немає</p>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-opero-border">
                  {myTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 py-4">
                      <span
                        className={
                          task.status === "in_progress"
                            ? "grid size-5 place-items-center rounded-md border-2 border-opero-blue bg-blue-50 text-opero-blue"
                            : "size-5 rounded-md border-2 border-slate-300"
                        }
                      >
                        {task.status === "in_progress" ? "•" : null}
                      </span>
                      <p className="min-w-0 flex-1 text-sm font-medium text-opero-text">
                        {task.title}
                      </p>
                      <span className="shrink-0 text-xs text-opero-muted">
                        {dueDateLabel(task.due_date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {lowBalances[0] ? (
                <Link
                  href="/inventory"
                  className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm transition hover:bg-amber-100"
                >
                  <span className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle size={17} />
                    {productById.get(lowBalances[0].product_id)?.name ??
                      "Товар із низьким залишком"}
                  </span>
                  <strong className="text-amber-700">
                    {lowBalances.length}
                  </strong>
                </Link>
              ) : (
                <Link
                  href="/inventory"
                  className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm transition hover:bg-emerald-100"
                >
                  <span className="flex items-center gap-2 text-emerald-800">
                    <PackageSearch size={17} />
                    Усі залишки в нормі
                  </span>
                </Link>
              )}
            </article>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-opero-border bg-white p-5">
              <p className="text-sm text-opero-muted">Активних складів</p>
              <p className="mt-1 text-3xl font-bold text-opero-text">
                {warehouses.filter((warehouse) => warehouse.is_active).length}
              </p>
            </article>

            <article className="rounded-2xl border border-opero-border bg-white p-5">
              <p className="text-sm text-opero-muted">Товарних позицій</p>
              <p className="mt-1 text-3xl font-bold text-opero-text">
                {products.filter((product) => product.is_active).length}
              </p>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}