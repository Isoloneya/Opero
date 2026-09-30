"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  ClipboardList,
  History,
  PackageSearch,
  RefreshCw,
} from "lucide-react";

import { getAuditLogs, getUsers } from "@/lib/api";
import type { UserListItem } from "@/types/auth";
import type { AuditLogData } from "@/types/audit-log";

const actionLabels: Record<string, string> = {
  stock_movement_created: "Створено рух товару",
  request_created: "Створено заявку",
  request_approved: "Погоджено заявку",
  request_rejected: "Відхилено заявку",
  request_completed: "Виконано заявку",
  task_created: "Створено задачу",
  task_status_updated: "Змінено статус задачі",
};

const entityLabels: Record<string, string> = {
  stock_movement: "Рух товару",
  request: "Заявка",
  task: "Задача",
};

const detailLabels: Record<string, string> = {
  title: "Назва",
  type: "Тип",
  warehouse_id: "Склад",
  product_id: "Товар",
  quantity: "Кількість",
  request_number: "Номер",
  items_count: "Позицій",
  status: "Статус",
  assigned_to: "Виконавець",
  priority: "Пріоритет",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function parseDetails(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    return Object.entries(JSON.parse(value) as Record<string, string | number>);
  } catch {
    return [];
  }
}

function actionIcon(action: string) {
  if (action.includes("task")) {
    return ClipboardCheck;
  }

  if (action.includes("request")) {
    return ClipboardList;
  }

  return PackageSearch;
}

export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  async function loadAuditLogs(isManualRefresh = false) {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    try {
      const [auditLogsPage, usersPage] = await Promise.all([
        getAuditLogs(token),
        getUsers(token),
      ]);

      setAuditLogs(auditLogsPage.items);
      setUsers(usersPage.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося завантажити журнал дій",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-opero-muted">Адміністрування</p>
          <h2 className="text-2xl font-bold tracking-tight text-opero-text">
            Журнал дій
          </h2>
          <p className="mt-1 text-sm text-opero-muted">
            Історія ключових операцій у системі
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadAuditLogs(true)}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-opero-border bg-white px-4 py-2.5 text-sm font-semibold text-opero-text transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          Оновити
        </button>
      </section>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <section className="rounded-2xl border border-opero-border bg-white p-6 text-sm text-opero-muted">
          Завантажуємо журнал дій
        </section>
      ) : null}

      {!isLoading && auditLogs.length === 0 ? (
        <section className="flex flex-col items-center rounded-2xl border border-opero-border bg-white px-6 py-16 text-center">
          <History size={36} className="mb-3 text-opero-muted" />
          <h3 className="font-semibold text-opero-text">Подій поки немає</h3>
          <p className="mt-1 text-sm text-opero-muted">
            Нові операції зі складом, заявками та задачами з’являться тут
          </p>
        </section>
      ) : null}

      {!isLoading && auditLogs.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-opero-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-opero-border bg-slate-50 text-xs uppercase tracking-wide text-opero-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Подія</th>
                  <th className="px-5 py-3 font-semibold">Автор</th>
                  <th className="px-5 py-3 font-semibold">Деталі</th>
                  <th className="px-5 py-3 font-semibold">Час</th>
                </tr>
              </thead>

              <tbody>
                {auditLogs.map((auditLog) => {
                  const Icon = actionIcon(auditLog.action);
                  const author = auditLog.user_id
                    ? userById.get(auditLog.user_id)
                    : null;
                  const details = parseDetails(auditLog.details);

                  return (
                    <tr
                      key={auditLog.id}
                      className="border-b border-opero-border align-top last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-opero-blue">
                            <Icon size={18} />
                          </span>

                          <div>
                            <p className="font-semibold text-opero-text">
                              {actionLabels[auditLog.action] ?? auditLog.action}
                            </p>
                            <p className="mt-0.5 text-xs text-opero-muted">
                              {entityLabels[auditLog.entity_type] ??
                                auditLog.entity_type}{" "}
                              #{auditLog.entity_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-opero-muted">
                        {author?.full_name ??
                          (auditLog.user_id
                            ? `Користувач #${auditLog.user_id}`
                            : "Система")}
                      </td>

                      <td className="max-w-md px-5 py-4">
                        {details.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {details.map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-opero-muted"
                              >
                                {detailLabels[key] ?? key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-opero-muted">—</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-opero-muted">
                        {formatDate(auditLog.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}