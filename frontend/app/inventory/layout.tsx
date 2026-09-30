"use client";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

type InventoryLayoutProps = {
  children: React.ReactNode;
};

export default function InventoryLayout({ children }: InventoryLayoutProps) {
  return (
    <AuthGuard>
      {(user) => <AppShell user={user}>{children}</AppShell>}
    </AuthGuard>
  );
}