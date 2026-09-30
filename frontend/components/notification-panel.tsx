"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, CheckCheck, ClipboardList, ListTodo } from "lucide-react";

import {
  getInventoryBalances,
  getProducts,
  getRequests,
  getTasks,
  getWarehouses,
} from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Bell;
  color: string;
};

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function togglePanel() {
    const nextIsOpen = !isOpen;

    setIsOpen(nextIsOpen);

    if (!nextIsOpen) {
      return;
    }

    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    setIsLoading(true);

    try {
      const [requestsPage, tasksPage, productsPage, warehousesPage] =
        await Promise.all([
          getRequests(token),
          getTasks(token),
          getProducts(token),
          getWarehouses(token),
        ]);

      const balances = await Promise.all(
        warehousesPage.items.map((warehouse) =>
          getInventoryBalances(token, warehouse.id),
        ),
      );

      const productById = new Map(
        productsPage.items.map((product) => [product.id, product]),
      );

      const pendingRequests = requestsPage.items.filter(
        (request) => request.status === "pending",
      ).length;

      const overdueTasks = tasksPage.items.filter((task) => {
        if (!task.due_date || task.status === "done") {
          return false;
        }

        return task.due_date < new Date().toISOString().slice(0, 10);
      }).length;

      const lowStockCount = balances
        .flat()
        .filter((balance) => {
          const product = productById.get(balance.product_id);

          return (
            product &&
            Number(balance.quantity) <= Number(product.minimum_stock)
          );
        }).length;

      const nextNotifications: Notification[] = [];

      if (pendingRequests > 0) {
        nextNotifications.push({
          id: "pending-requests",
          title: "Заявки очікують рішення",
          description: `${pendingRequests} потребують погодження`,
          href: "/requests",
          icon: ClipboardList,
          color: "text-opero-blue bg-blue-50",
        });
      }

      if (overdueTasks > 0) {
        nextNotifications.push({
          id: "overdue-tasks",
          title: "Є прострочені задачі",
          description: `${overdueTasks} потребують уваги`,
          href: "/tasks",
          icon: ListTodo,
          color: "text-red-600 bg-red-50",
        });
      }

      if (lowStockCount > 0) {
        nextNotifications.push({
          id: "low-stock",
          title: "Низькі залишки",
          description: `${lowStockCount} позицій потрібно поповнити`,
          href: "/inventory",
          icon: AlertTriangle,
          color: "text-amber-600 bg-amber-50",
        });
      }

      setNotifications(nextNotifications);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={togglePanel}
        className="relative grid size-10 place-items-center rounded-xl border border-opero-border text-opero-muted transition hover:bg-slate-50"
        aria-label="Сповіщення"
        aria-expanded={isOpen}
      >
        <Bell size={19} />
        {notifications.length > 0 ? (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
        ) : null}
      </button>

      {isOpen ? (
        <section className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-opero-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-opero-border px-4 py-3">
            <h2 className="font-bold text-opero-text">Сповіщення</h2>
            <span className="text-xs font-medium text-opero-muted">{notifications.length}</span>
          </div>

          {isLoading ? (
            <p className="px-4 py-6 text-sm text-opero-muted">Перевіряємо події</p>
          ) : null}

          {!isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <CheckCheck size={26} className="mb-2 text-emerald-600" />
              <p className="text-sm font-medium text-opero-text">Усе під контролем</p>
              <p className="mt-1 text-xs text-opero-muted">
                Нових подій, що потребують уваги, немає
              </p>
            </div>
          ) : null}

          {!isLoading && notifications.length > 0 ? (
            <div className="divide-y divide-opero-border">
              {notifications.map((notification) => {
                const Icon = notification.icon;

                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-3 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${notification.color}`}
                    >
                      <Icon size={18} />
                    </span>

                    <span>
                      <span className="block text-sm font-semibold text-opero-text">
                        {notification.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-opero-muted">
                        {notification.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
