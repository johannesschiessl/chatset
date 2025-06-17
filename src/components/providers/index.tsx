"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import ConvexProviderWrapper from "@/components/providers/convex-provider";
import { generateBase36Id } from "@/lib/generate-id";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!window.localStorage.getItem("clientId")) {
      window.localStorage.setItem("clientId", generateBase36Id());
    }
  }, []);

  return (
    <ConvexProviderWrapper>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ConvexProviderWrapper>
  );
}
