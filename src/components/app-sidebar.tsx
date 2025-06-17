"use client";

import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Id } from "../../convex/_generated/dataModel";

function ChatItem({
  chat,
  isActive,
  sessionToken,
}: {
  chat: { _id: Id<"chats">; title: string };
  isActive: boolean;
  sessionToken: string | undefined;
}) {
  // This will prefetch messages for this specific chat for caching
  // Only call useQuery when we have a valid session token to avoid unnecessary calls
  useQuery(
    api.messages.getMessages,
    sessionToken
      ? {
          chatId: chat._id,
          sessionToken: sessionToken,
        }
      : "skip",
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          isActive && "text-sidebar-accent-foreground bg-sidebar-accent",
        )}
        asChild
      >
        <Link href={`/chat/${chat._id}`}>
          <span className="truncate">{chat.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  preloadedChats,
}: {
  preloadedChats: Preloaded<typeof api.chats.getChatsGroupedByDate>;
}) {
  const session = authClient.useSession();

  const chatsGroupedByDate = usePreloadedQuery(preloadedChats);
  const pathname = usePathname();

  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-2">
            <h1 className="text-lg font-bold">jxs Chat</h1>
            <Badge variant="outline">Beta</Badge>
          </div>
          <SidebarTrigger />
        </div>
        <Link href="/">
          <Button className="w-full">New chat</Button>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {chatsGroupedByDate.map((group) => (
          <SidebarGroup key={group.date}>
            <SidebarGroupLabel>{group.date}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.chats.map((chat) => (
                  <ChatItem
                    key={chat._id}
                    chat={chat}
                    isActive={pathname === `/chat/${chat._id}`}
                    sessionToken={session.data?.session.token}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push("/settings")}>
              <Avatar className="size-6">
                <AvatarImage src={session.data?.user?.image ?? ""} />
                <AvatarFallback>
                  {session.data?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              {session.data?.user?.name ?? "Loading..."}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
