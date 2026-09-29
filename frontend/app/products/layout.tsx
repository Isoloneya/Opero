import { WorkspaceLayout } from "@/components/workspace-layout";

type ProductsLayoutProps = {
  children: React.ReactNode;
};

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}