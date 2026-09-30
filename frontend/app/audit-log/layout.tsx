"use client";

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

type AuditLogLayoutProps = {
  children: React.ReactNode;
};

export default function AuditLogLayout({ children }: AuditLogLayoutProps) {
  return (
    <AuthGuard>
      {(user) => <AppShell user={user}>{children}</AppShell>}
    </AuthGuard>
  );
}