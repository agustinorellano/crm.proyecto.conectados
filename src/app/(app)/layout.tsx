import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { QuickCreate } from "@/components/layout/quick-create";
import { CommandPalette } from "@/components/layout/command-palette";
import { UIProvider } from "@/components/layout/ui-context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <UIProvider>
      <div className="min-h-screen bg-ink-50">
        <Sidebar />
        <MobileSidebar />
        <div className="lg:pl-64">
          <Topbar />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
        <QuickCreate />
        <CommandPalette />
      </div>
    </UIProvider>
  );
}
