"use client";

import { useSidebar } from "./ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { PlusIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";

export default function AppHeader() {
  const { state } = useSidebar();

  return (
    <header className="flex min-h-[60px] items-center justify-between px-4 py-3">
      {state === "collapsed" ? (
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Link href="/">
            <Button variant="ghost" size="icon">
              <PlusIcon />
              <span className="sr-only">New Chat</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div></div>
      )}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings2Icon />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
