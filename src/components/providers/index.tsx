import { ThemeProvider } from "@/components/providers/theme-provider";
import ConvexProviderWrapper from "@/components/providers/convex-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWrapper>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ConvexProviderWrapper>
  );
}
