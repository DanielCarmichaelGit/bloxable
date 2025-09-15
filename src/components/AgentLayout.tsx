import { ReactNode } from "react";
import Layout from "./Layout";

interface AgentLayoutProps {
  children: ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  return <Layout hideFooter={true}>{children}</Layout>;
}
