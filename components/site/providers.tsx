"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import {
  AnimatedToastStack,
  type ToastInput,
  useAnimatedToastStack,
} from "@/components/motion/animated-toast-stack";

type ToastApi = {
  showToast: (input: ToastInput) => string;
  updateToast: (id: string, patch: Partial<ToastInput>) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <Providers>");
  return ctx;
}

function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast, updateToast, dismissToast } = useAnimatedToastStack({
    defaultDuration: 3600,
    limit: 4,
  });
  const api = useMemo<ToastApi>(
    () => ({ showToast, updateToast, dismissToast }),
    [showToast, updateToast, dismissToast],
  );
  return (
    <ToastContext.Provider value={api}>
      {children}
      <AnimatedToastStack toasts={toasts} onDismiss={dismissToast} position="bottom-right" fixed portal />
    </ToastContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem enableColorScheme={false}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
