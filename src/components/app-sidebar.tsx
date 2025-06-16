"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
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
                  <SidebarMenuItem key={chat._id}>
                    <SidebarMenuButton
                      className={cn(
                        pathname === `/chat/${chat._id}` &&
                          "text-sidebar-accent-foreground bg-sidebar-accent",
                      )}
                      asChild
                    >
                      <Link href={`/chat/${chat._id}`}>
                        <span className="truncate">{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
