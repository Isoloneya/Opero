"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/api";
import type { CurrentUser } from "@/types/auth";

type AuthGuardProps = {
  children: (user: CurrentUser) => React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem("opero_access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch {
        localStorage.removeItem("opero_access_token");
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, [router]);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-opero-bg px-4">
        <p className="text-sm font-medium text-opero-muted">Завантажуємо Opero</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children(user)}</>;
}