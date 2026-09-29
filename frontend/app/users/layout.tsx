import { WorkspaceLayout } from "@/components/workspace-layout";

type UsersLayoutProps = {
  children: React.ReactNode;
};

export default function UsersLayout({ children }: UsersLayoutProps) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}