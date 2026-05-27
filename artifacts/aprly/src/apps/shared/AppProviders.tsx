import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-session";

const queryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
  withUserAuth?: boolean;
};

export function AppProviders({
  children,
  withUserAuth = false,
}: AppProvidersProps) {
  const body = withUserAuth ? <AuthProvider>{children}</AuthProvider> : children;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>{body}</WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
