"use client";

import { SignOutButton } from "@/components/signout-button";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Save, InfoIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const session = authClient.useSession();

  const apiKeysPreview = useQuery(
    api.keys.getApiKeysPreview,
    session.isPending || !session.data?.session?.token
      ? "skip"
      : {
          sessionToken: session.data.session.token,
        },
  );

  const [apiKeys, setApiKeys] = useState<
    {
      provider: string;
      key: string;
      isExisting: boolean;
    }[]
  >([
    { provider: "openai", key: "", isExisting: false },
    { provider: "groq", key: "", isExisting: false },
    { provider: "anthropic", key: "", isExisting: false },
    { provider: "google", key: "", isExisting: false },
    { provider: "openrouter", key: "", isExisting: false },
  ]);

  // Update apiKeys when apiKeysPreview changes
  useEffect(() => {
    if (apiKeysPreview) {
      const updatedKeys = [
        { provider: "openai", key: "", isExisting: false },
        { provider: "groq", key: "", isExisting: false },
        { provider: "anthropic", key: "", isExisting: false },
        { provider: "google", key: "", isExisting: false },
        { provider: "openrouter", key: "", isExisting: false },
      ].map((defaultKey) => {
        const existingKey = apiKeysPreview.find(
          (k) => k.provider === defaultKey.provider,
        );
        if (existingKey) {
          return {
            provider: existingKey.provider,
            key: existingKey.key, // This is already the preview from the backend
            isExisting: true,
          };
        }
        return defaultKey;
      });
      setApiKeys(updatedKeys);
    }
  }, [apiKeysPreview]);

  const saveApiKeyMutation = useMutation(api.keys.saveApiKey);
  const removeApiKeyMutation = useMutation(api.keys.removeApiKey);

  async function saveApiKey(provider: string) {
    if (!session.data?.session?.token) return;

    const keyData = apiKeys.find((key) => key.provider === provider);
    if (!keyData || keyData.key.trim() === "" || keyData.isExisting) return;

    await saveApiKeyMutation({
      provider,
      key: keyData.key,
      sessionToken: session.data.session.token,
    });

    // Update local state to mark this key as existing
    setApiKeys(
      apiKeys.map((key) =>
        key.provider === provider ? { ...key, isExisting: true } : key,
      ),
    );
  }

  async function deleteApiKey(provider: string) {
    if (!session.data?.session?.token) return;

    // Call the backend mutation to remove the API key from the database
    await removeApiKeyMutation({
      provider,
      sessionToken: session.data.session.token,
    });

    // Update local state to reflect the deletion
    setApiKeys(
      apiKeys.map((key) =>
        key.provider === provider
          ? { provider, key: "", isExisting: false }
          : key,
      ),
    );
  }

  const router = useRouter();

  useEffect(() => {
    router.prefetch("/"); // I'm not even sure if this is needed...
  }, [router]);

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
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">API Keys</h2>
            <p className="text-muted-foreground">
              Add your API keys to use the following APIs. API keys are stored
              encrypted on the server.
            </p>
            <Alert>
              <InfoIcon className="h-4 w-4" />

              <AlertTitle>Tested APIs</AlertTitle>
              <AlertDescription>
                I tested the OpenRouter, OpenAI, and Groq APIs. Sadly, I
                don&apos;t have any credits for Google and Anthropic, so I
                couldn&apos;t test them. In theory, they should work because of
                the AI SDK.
              </AlertDescription>
            </Alert>
          </div>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-api-key">OpenAI</Label>
              <div className="flex gap-2">
                <Input
                  id="openai-api-key"
                  type="text"
                  placeholder={
                    apiKeys.find((key) => key.provider === "openai")?.isExisting
                      ? ""
                      : "API Key"
                  }
                  disabled={
                    apiKeys.find((key) => key.provider === "openai")?.isExisting
                  }
                  value={
                    apiKeys.find((key) => key.provider === "openai")?.key ?? ""
                  }
                  onChange={(e) => {
                    const existingIndex = apiKeys.findIndex(
                      (key) => key.provider === "openai",
                    );
                    if (existingIndex >= 0) {
                      const newKeys = [...apiKeys];
                      newKeys[existingIndex] = {
                        ...newKeys[existingIndex],
                        key: e.target.value,
                      };
                      setApiKeys(newKeys);
                    } else {
                      setApiKeys([
                        ...apiKeys,
                        {
                          provider: "openai",
                          key: e.target.value,
                          isExisting: false,
                        },
                      ]);
                    }
                  }}
                />
                {apiKeys.find((key) => key.provider === "openai")
                  ?.isExisting ? (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteApiKey("openai")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => saveApiKey("openai")}
                    disabled={
                      !apiKeys
                        .find((key) => key.provider === "openai")
                        ?.key?.trim()
                    }
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="groq-api-key">Groq</Label>
              <div className="flex gap-2">
                <Input
                  id="groq-api-key"
                  type="text"
                  placeholder={
                    apiKeys.find((key) => key.provider === "groq")?.isExisting
                      ? ""
                      : "API Key"
                  }
                  disabled={
                    apiKeys.find((key) => key.provider === "groq")?.isExisting
                  }
                  value={
                    apiKeys.find((key) => key.provider === "groq")?.key ?? ""
                  }
                  onChange={(e) => {
                    const existingIndex = apiKeys.findIndex(
                      (key) => key.provider === "groq",
                    );
                    if (existingIndex >= 0) {
                      const newKeys = [...apiKeys];
                      newKeys[existingIndex] = {
                        ...newKeys[existingIndex],
                        key: e.target.value,
                      };
                      setApiKeys(newKeys);
                    } else {
                      setApiKeys([
                        ...apiKeys,
                        {
                          provider: "groq",
                          key: e.target.value,
                          isExisting: false,
                        },
                      ]);
                    }
                  }}
                />
                {apiKeys.find((key) => key.provider === "groq")?.isExisting ? (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteApiKey("groq")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => saveApiKey("groq")}
                    disabled={
                      !apiKeys
                        .find((key) => key.provider === "groq")
                        ?.key?.trim()
                    }
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="anthropic-api-key">Anthropic</Label>
              <div className="flex gap-2">
                <Input
                  id="anthropic-api-key"
                  type="text"
                  placeholder={
                    apiKeys.find((key) => key.provider === "anthropic")
                      ?.isExisting
                      ? ""
                      : "API Key"
                  }
                  disabled={
                    apiKeys.find((key) => key.provider === "anthropic")
                      ?.isExisting
                  }
                  value={
                    apiKeys.find((key) => key.provider === "anthropic")?.key ??
                    ""
                  }
                  onChange={(e) => {
                    const existingIndex = apiKeys.findIndex(
                      (key) => key.provider === "anthropic",
                    );
                    if (existingIndex >= 0) {
                      const newKeys = [...apiKeys];
                      newKeys[existingIndex] = {
                        ...newKeys[existingIndex],
                        key: e.target.value,
                      };
                      setApiKeys(newKeys);
                    } else {
                      setApiKeys([
                        ...apiKeys,
                        {
                          provider: "anthropic",
                          key: e.target.value,
                          isExisting: false,
                        },
                      ]);
                    }
                  }}
                />
                {apiKeys.find((key) => key.provider === "anthropic")
                  ?.isExisting ? (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteApiKey("anthropic")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => saveApiKey("anthropic")}
                    disabled={
                      !apiKeys
                        .find((key) => key.provider === "anthropic")
                        ?.key?.trim()
                    }
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="google-api-key">Google</Label>
              <div className="flex gap-2">
                <Input
                  id="google-api-key"
                  type="text"
                  placeholder={
                    apiKeys.find((key) => key.provider === "google")?.isExisting
                      ? ""
                      : "API Key"
                  }
                  disabled={
                    apiKeys.find((key) => key.provider === "google")?.isExisting
                  }
                  value={
                    apiKeys.find((key) => key.provider === "google")?.key ?? ""
                  }
                  onChange={(e) => {
                    const existingIndex = apiKeys.findIndex(
                      (key) => key.provider === "google",
                    );
                    if (existingIndex >= 0) {
                      const newKeys = [...apiKeys];
                      newKeys[existingIndex] = {
                        ...newKeys[existingIndex],
                        key: e.target.value,
                      };
                      setApiKeys(newKeys);
                    } else {
                      setApiKeys([
                        ...apiKeys,
                        {
                          provider: "google",
                          key: e.target.value,
                          isExisting: false,
                        },
                      ]);
                    }
                  }}
                />
                {apiKeys.find((key) => key.provider === "google")
                  ?.isExisting ? (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteApiKey("google")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => saveApiKey("google")}
                    disabled={
                      !apiKeys
                        .find((key) => key.provider === "google")
                        ?.key?.trim()
                    }
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openrouter-api-key">OpenRouter</Label>
              <div className="flex gap-2">
                <Input
                  id="openrouter-api-key"
                  type="text"
                  placeholder={
                    apiKeys.find((key) => key.provider === "openrouter")
                      ?.isExisting
                      ? ""
                      : "API Key"
                  }
                  disabled={
                    apiKeys.find((key) => key.provider === "openrouter")
                      ?.isExisting
                  }
                  value={
                    apiKeys.find((key) => key.provider === "openrouter")?.key ??
                    ""
                  }
                  onChange={(e) => {
                    const existingIndex = apiKeys.findIndex(
                      (key) => key.provider === "openrouter",
                    );
                    if (existingIndex >= 0) {
                      const newKeys = [...apiKeys];
                      newKeys[existingIndex] = {
                        ...newKeys[existingIndex],
                        key: e.target.value,
                      };
                      setApiKeys(newKeys);
                    } else {
                      setApiKeys([
                        ...apiKeys,
                        {
                          provider: "openrouter",
                          key: e.target.value,
                          isExisting: false,
                        },
                      ]);
                    }
                  }}
                />
                {apiKeys.find((key) => key.provider === "openrouter")
                  ?.isExisting ? (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteApiKey("openrouter")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => saveApiKey("openrouter")}
                    disabled={
                      !apiKeys
                        .find((key) => key.provider === "openrouter")
                        ?.key?.trim()
                    }
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
