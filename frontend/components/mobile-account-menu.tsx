"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import type { CurrentUser } from "@/types/auth";

type MobileAccountMenuProps = {
  user: CurrentUser;
};

const roleLabels = {
  admin: "Адміністратор",
  manager: "Менеджер",
  warehouse_keeper: "Комірник",
  employee: "Працівник",
};

export function MobileAccountMenu({ user }: MobileAccountMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const initials = user.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleLogout() {
    localStorage.removeItem("opero_access_token");
    router.replace("/login");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center gap-1 py-2 text-xs font-medium text-opero-muted"
        aria-label="Акаунт"
      >
        <span className="grid size-6 place-items-center rounded-full bg-opero-navy text-[10px] font-bold text-white">
          {initials}
        </span>
        Акаунт
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-30 flex items-end bg-slate-950/35 lg:hidden">
          <section className="w-full rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-opero-border pb-4">
              <span className="grid size-11 place-items-center rounded-full bg-opero-navy text-sm font-bold text-white">
                {initials}
              </span>

              <div className="min-w-0">
                <p className="truncate font-semibold text-opero-text">
                  {user.full_name}
                </p>
                <p className="text-sm text-opero-muted">
                  {roleLabels[user.role]}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
            >
              <LogOut size={18} />
              Вийти з акаунта
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-opero-muted"
            >
              Скасувати
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}