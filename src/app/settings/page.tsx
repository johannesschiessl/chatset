"use client";

import { SignOutButton } from "@/components/signout-button";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const session = authClient.useSession();

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft />
            Return to Chat
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            target="_blank"
            href="https://github.com/johannesschiessl/jxs-chat"
          >
            <Button size="icon" variant="ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                ></path>
              </svg>
            </Button>
          </Link>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8 px-6 pb-6">
        <div className="flex w-80 flex-col items-center">
          <Avatar className="mb-4 h-48 w-48">
            <AvatarImage src={session.data?.user?.image ?? ""} />
            <AvatarFallback className="text-2xl">
              {session.data?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <h2 className="mb-2 text-xl font-semibold">
            {session.data?.user?.name?.split(" ")[0] ?? "Loading..."}
          </h2>
          <p className="text-muted-foreground cursor-pointer text-sm blur-xs transition-all hover:blur-none">
            {session.data?.user?.email ?? "Loading..."}
          </p>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Settings</h3>
                <p className="text-muted-foreground">
                  Manage your account preferences and settings here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="customization" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customization</h3>
                <p className="text-muted-foreground">
                  Customize your chat experience with themes, display options,
                  and more.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="api-keys" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                <p className="text-muted-foreground">
                  Manage your API keys and integrations here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">About</h3>
                <p className="text-muted-foreground">
                  Learn more about jxs Chat, version information, and support
                  resources.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
