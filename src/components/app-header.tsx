import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { Settings2Icon } from "lucide-react";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="flex min-h-[60px] items-center justify-between px-4 py-3">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings2Icon className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
