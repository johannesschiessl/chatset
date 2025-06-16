import { AppSidebarLoading } from "@/components/app-sidebar-loading";
import AppSidebarWrapper from "@/components/app-sidebar-wrapper";
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
      <main className="mx-auto flex h-screen max-w-2xl flex-col pt-4">
        {children}
      </main>
    </SidebarProvider>
  );
}
