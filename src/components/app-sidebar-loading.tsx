import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function AppSidebarLoading() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 p-2">
            <h1 className="text-lg font-bold">chatset</h1>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Avatar className="size-6">
                <AvatarFallback></AvatarFallback>
              </Avatar>
              <Skeleton className="h-6 w-24" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
