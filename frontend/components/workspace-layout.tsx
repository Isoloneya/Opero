"use client";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
};

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <AuthGuard>
      {(user) => <AppShell user={user}>{children}</AppShell>}
    </AuthGuard>
  );
}