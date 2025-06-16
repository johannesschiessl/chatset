import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { AppSidebar } from "./app-sidebar";

export default async function AppSidebarWrapper() {
  const preloadedChats = await preloadQuery(api.chats.getChatsGroupedByDate);
  return <AppSidebar preloadedChats={preloadedChats} />;
}
