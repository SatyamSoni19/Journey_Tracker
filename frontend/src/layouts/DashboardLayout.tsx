import type { ReactNode } from "react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen dashboard-bg">
      <DashboardNavbar />
      <main>{children}</main>
    </div>
  );
}
