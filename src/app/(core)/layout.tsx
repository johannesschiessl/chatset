import { AppSidebarLoading } from "@/components/app-sidebar-loading";
import AppSidebarWrapper from "@/components/app-sidebar-wrapper";
import AppHeader from "@/components/app-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";

export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<AppSidebarLoading />}>
        <AppSidebarWrapper />
      </Suspense>
      <div className="flex h-screen w-full flex-col">
        <div className="bg-background sticky top-0 z-40">
          <AppHeader />
        </div>
        <main className="mx-auto flex max-w-3xl flex-1 flex-col overflow-auto pt-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
