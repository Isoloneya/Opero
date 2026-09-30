"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Circle,
  ClipboardCheck,
  Clock3,
  Plus,
  UserRound,
  X,
} from "lucide-react";

import {
  createTask,
  getCurrentUser,
  getTasks,
  getUsers,
  updateTaskStatus,
} from "@/lib/api";
import type { CurrentUser, UserListItem } from "@/types/auth";
import type {
  TaskData,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

const columns: Array<{
  status: TaskStatus;
  title: string;
  icon: typeof Circle;
}> = [
  {
    status: "todo",
    title: "До виконання",
    icon: Circle,
  },
  {
    status: "in_progress",
    title: "У роботі",
    icon: Clock3,
  },
  {
    status: "done",
    title: "Виконано",
    icon: Check,
  },
];

const priorityLabels = {
  low: "Низький",
  normal: "Звичайний",
  high: "Високий",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const canCreate =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  function openCreateForm() {
    setTitle("");
    setDescription("");
    setPriority("normal");
    setDueDate("");
    setAssignedTo(users[0]?.id ?? null);
    setFormError("");
    setIsCreateFormOpen(true);
  }

  function closeCreateForm() {
    setIsCreateFormOpen(false);
    setFormError("");
  }

  async function loadData() {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const [tasksPage, usersPage, user] = await Promise.all([
        getTasks(token),
        getUsers(token),
        getCurrentUser(token),
      ]);

      setTasks(tasksPage.items);
      setUsers(usersPage.items.filter((item) => item.is_active));
      setCurrentUser(user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося завантажити задачі",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("opero_access_token");

    if (!token || !title.trim() || !assignedTo) {
      setFormError("Вкажи назву та виконавця задачі");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const createdTask = await createTask(token, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
        assigned_to: assignedTo,
      });

      setTasks((items) => [createdTask, ...items]);
      closeCreateForm();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Не вдалося створити задачу",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(taskId: number, status: TaskStatus) {
    const token = localStorage.getItem("opero_access_token");

    if (!token) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const updatedTask = await updateTaskStatus(token, taskId, { status });

      setTasks((items) =>
        items.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося оновити задачу",
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
          <h2 className="text-2xl font-bold tracking-tight text-opero-text">Задачі</h2>
          <p className="mt-1 text-sm text-opero-muted">
            Контроль виконання операцій команди
          </p>
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={openCreateForm}
            disabled={isLoading || users.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-opero-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Нова задача
          </button>
        ) : null}
      </section>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <section className="rounded-2xl border border-opero-border bg-white p-6 text-sm text-opero-muted">
          Завантажуємо задачі
        </section>
      ) : null}

      {!isLoading ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnTasks = tasks.filter((task) => task.status === column.status);

            return (
              <div
                key={column.status}
                className="rounded-2xl border border-opero-border bg-slate-100/70 p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-opero-text">
                    <Icon
                      size={18}
                      className={
                        column.status === "done"
                          ? "text-emerald-600"
                          : column.status === "in_progress"
                            ? "text-opero-blue"
                            : "text-opero-muted"
                      }
                    />
                    {column.title}
                  </div>

                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-opero-muted">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => {
                    const assignee = userById.get(task.assigned_to);

                    return (
                      <article
                        key={task.id}
                        className="rounded-xl border border-opero-border bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold leading-5 text-opero-text">
                            {task.title}
                          </h3>

                          <span
                            className={
                              task.priority === "high"
                                ? "shrink-0 rounded-full bg-red-100 px-2 py-1 text-[11px] font-bold text-red-700"
                                : task.priority === "low"
                                  ? "shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600"
                                  : "shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700"
                            }
                          >
                            {priorityLabels[task.priority]}
                          </span>
                        </div>

                        {task.description ? (
                          <p className="mt-2 text-sm leading-5 text-opero-muted">
                            {task.description}
                          </p>
                        ) : null}

                        <div className="mt-4 space-y-2 text-xs text-opero-muted">
                          <div className="flex items-center gap-2">
                            <UserRound size={15} />
                            {assignee?.full_name ?? `Користувач #${task.assigned_to}`}
                          </div>

                          {task.due_date ? (
                            <div className="flex items-center gap-2">
                              <CalendarDays size={15} />
                              До {formatDate(task.due_date)}
                            </div>
                          ) : null}
                        </div>

                        {task.status === "todo" ? (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              handleStatusChange(task.id, "in_progress")
                            }
                            className="mt-4 w-full rounded-lg border border-opero-blue px-3 py-2 text-sm font-semibold text-opero-blue transition hover:bg-blue-50 disabled:opacity-60"
                          >
                            Розпочати
                          </button>
                        ) : null}

                        {task.status === "in_progress" ? (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleStatusChange(task.id, "done")}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            <Check size={16} />
                            Завершити
                          </button>
                        ) : null}
                      </article>
                    );
                  })}

                  {columnTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-opero-border px-4 py-8 text-center text-sm text-opero-muted">
                      Немає задач
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      {!isLoading ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-opero-border bg-white p-5">
            <ClipboardCheck size={21} className="mb-3 text-opero-blue" />
            <p className="text-sm text-opero-muted">Усього задач</p>
            <p className="mt-1 text-3xl font-bold text-opero-text">{tasks.length}</p>
          </div>

          <div className="rounded-2xl border border-opero-border bg-white p-5">
            <Clock3 size={21} className="mb-3 text-amber-500" />
            <p className="text-sm text-opero-muted">У роботі</p>
            <p className="mt-1 text-3xl font-bold text-opero-text">
              {tasks.filter((task) => task.status === "in_progress").length}
            </p>
          </div>

          <div className="rounded-2xl border border-opero-border bg-white p-5">
            <Check size={21} className="mb-3 text-emerald-600" />
            <p className="text-sm text-opero-muted">Виконано</p>
            <p className="mt-1 text-3xl font-bold text-opero-text">
              {tasks.filter((task) => task.status === "done").length}
            </p>
          </div>
        </section>
      ) : null}

      {isCreateFormOpen ? (
        <div className="fixed inset-0 z-30 flex items-end bg-slate-950/35 p-0 sm:items-center sm:justify-center sm:p-4">
          <section className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-opero-muted">Операції</p>
                <h3 className="text-xl font-bold text-opero-text">Нова задача</h3>
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

            <form className="space-y-4" onSubmit={handleCreateTask}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-opero-text">
                  Назва
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Наприклад, перевірити залишки кабелів"
                  className="w-full rounded-xl border border-opero-border px-3 py-2.5 text-sm text-opero-text outline-none placeholder:text-slate-400 focus:border-opero-blue"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-opero-text">
                  Опис
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Додаткові деталі для виконавця"
                  className="w-full resize-none rounded-xl border border-opero-border px-3 py-2.5 text-sm text-opero-text outline-none placeholder:text-slate-400 focus:border-opero-blue"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-opero-text">
                    Виконавець
                  </span>
                  <select
                    value={assignedTo ?? ""}
                    onChange={(event) => setAssignedTo(Number(event.target.value))}
                    className="w-full rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none focus:border-opero-blue"
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-opero-text">
                    Пріоритет
                  </span>
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as TaskPriority)
                    }
                    className="w-full rounded-xl border border-opero-border bg-white px-3 py-2.5 text-sm text-opero-text outline-none focus:border-opero-blue"
                  >
                    <option value="low">Низький</option>
                    <option value="normal">Звичайний</option>
                    <option value="high">Високий</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-opero-text">
                  Дедлайн
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-xl border border-opero-border px-3 py-2.5 text-sm text-opero-text outline-none focus:border-opero-blue"
                />
              </label>

              {formError ? (
                <p className="text-sm font-medium text-red-600">{formError}</p>
              ) : null}

              <div className="flex gap-3 pt-2">
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
                  <Plus size={18} />
                  {isSubmitting ? "Зберігаємо" : "Створити"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}