"use client";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

type TasksLayoutProps = {
  children: React.ReactNode;
};

export default function TasksLayout({ children }: TasksLayoutProps) {
  return (
    <AuthGuard>
      {(user) => <AppShell user={user}>{children}</AppShell>}
    </AuthGuard>
  );
}