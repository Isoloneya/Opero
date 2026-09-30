"use client";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

type RequestsLayoutProps = {
  children: React.ReactNode;
};

export default function RequestsLayout({ children }: RequestsLayoutProps) {
  return (
    <AuthGuard>
      {(user) => <AppShell user={user}>{children}</AppShell>}
    </AuthGuard>
  );
}