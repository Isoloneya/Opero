import { WorkspaceLayout } from "@/components/workspace-layout";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}