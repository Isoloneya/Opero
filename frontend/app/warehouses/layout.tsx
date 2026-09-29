import { WorkspaceLayout } from "@/components/workspace-layout";

type WarehousesLayoutProps = {
  children: React.ReactNode;
};

export default function WarehousesLayout({ children }: WarehousesLayoutProps) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}