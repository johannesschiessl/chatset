import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { AppSidebar } from "./app-sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AppSidebarWrapper() {
  const authData = await auth.api.getSession({
    headers: await headers(),
  });
  const preloadedChats = await preloadQuery(api.chats.getChatsGroupedByDate, {
    sessionToken: authData?.session.token ?? "",
  });
  return <AppSidebar preloadedChats={preloadedChats} />;
}
