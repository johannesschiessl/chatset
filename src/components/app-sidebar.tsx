"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const chatsGroupedByDate = useQuery(api.chats.getChatsGroupedByDate);
  const pathname = usePathname();

  if (chatsGroupedByDate === undefined) {
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
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

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
                          "bg-sidebar-accent text-sidebar-accent-foreground",
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
    </Sidebar>
  );
}
