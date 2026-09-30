"use client";

import { MobileAccountMenu } from "@/components/mobile-account-menu";
import { NotificationPanel } from "@/components/notification-panel";
import type { CurrentUser } from "@/types/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  History,
  LayoutDashboard,
  ListTodo,
  LogOut,
  PackageSearch,
  Plus,
  Users,
  Warehouse,
} from "lucide-react";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const primaryNavigation: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Дашборд",
    icon: LayoutDashboard,
  },
  {
    href: "/inventory",
    label: "Склад",
    icon: Warehouse,
  },
  {
    href: "/requests",
    label: "Заявки",
    icon: ClipboardList,
  },
  {
    href: "/tasks",
    label: "Задачі",
    icon: ListTodo,
  },
];

const adminNavigation: NavigationItem[] = [
  {
    href: "/products",
    label: "Товари",
    icon: PackageSearch,
  },
  {
    href: "/users",
    label: "Користувачі",
    icon: Users,
  },
  {
    href: "/audit-log",
    label: "Журнал дій",
    icon: History,
  },
];

const pageMetadata = {
  "/dashboard": {
    section: "Огляд системи",
    title: "Дашборд",
  },
  "/inventory": {
    section: "Операції",
    title: "Склад",
  },
  "/warehouses": {
    section: "Адміністрування",
    title: "Склади",
  },
  "/requests": {
    section: "Операції",
    title: "Заявки",
  },
  "/tasks": {
    section: "Операції",
    title: "Задачі",
  },
  "/products": {
    section: "Адміністрування",
    title: "Товари",
  },
  "/users": {
    section: "Адміністрування",
    title: "Користувачі",
  },
  "/audit-log": {
    section: "Адміністрування",
    title: "Журнал дій",
  },
};

type AppShellProps = {
  children: React.ReactNode;
  user: CurrentUser;
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentPage =
    pageMetadata[pathname as keyof typeof pageMetadata] ?? pageMetadata["/dashboard"];

  function navigationClassName(href: string) {
    const isActive = pathname === href;

    return isActive
      ? "flex items-center gap-3 rounded-xl bg-opero-navy-soft px-3 py-2.5 text-sm font-semibold text-white"
      : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white";
  }

  function handleLogout() {
    localStorage.removeItem("opero_access_token");
    router.replace("/login");
  }

  const initials = user.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabels = {
    admin: "Адміністратор",
    manager: "Менеджер",
    warehouse_keeper: "Комірник",
    employee: "Працівник",
  };

  const roleLabel = roleLabels[user.role] ?? user.role;

  return (
    <div className="min-h-screen bg-opero-bg">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-opero-navy px-3 py-5 lg:flex">
        <Link
          href="/dashboard"
          className="mb-9 flex items-center gap-3 px-3 text-2xl font-bold tracking-tight text-white"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-opero-blue text-base">
            O
          </span>
          Opero
        </Link>

        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Робочий простір
        </p>

        <nav className="space-y-1">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={navigationClassName(item.href)}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <p className="mb-2 mt-8 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Адміністрування
        </p>

        <nav className="space-y-1">
          {adminNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={navigationClassName(item.href)}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/15 px-3 pt-5">
          <div className="flex items-center gap-3 text-sm text-white">
            <span className="grid size-9 place-items-center rounded-full bg-slate-300 font-bold text-opero-navy">
              {initials}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{user.full_name}</p>
              <p className="text-xs text-slate-400">{roleLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={17} />
            Вийти
          </button>
        </div>
      </aside>

      <div className="pb-20 lg:ml-60 lg:pb-0">
        <header className="flex items-center justify-between border-b border-opero-border bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium text-opero-muted">
              {currentPage.section}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-opero-text sm:text-2xl">
              {currentPage.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationPanel />

            <Link
              href="/requests?create=1"
              className="inline-flex items-center gap-2 rounded-xl bg-opero-blue px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Нова заявка</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-opero-border bg-white lg:hidden">
        {primaryNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "flex flex-col items-center gap-1 py-3 text-xs font-semibold text-opero-blue"
                  : "flex flex-col items-center gap-1 py-3 text-xs font-medium text-opero-muted"
              }
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
        <MobileAccountMenu user={user} />
      </nav>
    </div>
  );
}