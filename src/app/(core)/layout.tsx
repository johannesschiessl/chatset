import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="mx-auto flex h-screen max-w-2xl flex-col pt-4">
        {children}
      </main>
    </SidebarProvider>
  );
}
