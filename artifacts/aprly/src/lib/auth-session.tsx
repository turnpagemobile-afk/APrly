import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetMeQueryKey,
  useGetMe,
  useLogout,
} from "@workspace/api-client-react";
import { setOnSessionExpired } from "@workspace/api-client-react";
import { toast } from "@/hooks/use-toast";

type AuthUser = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  hasActiveSubscription: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthPending: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const hadSessionRef = useRef(false);
  const meQuery = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
  });
  const logoutMutation = useLogout();

  useEffect(() => {
    if (meQuery.data) {
      hadSessionRef.current = true;
    }
  }, [meQuery.data]);

  useEffect(() => {
    setOnSessionExpired(() => {
      if (!hadSessionRef.current) return;
      hadSessionRef.current = false;
      queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
      navigate("/login");
      toast({
        title: "Session expired",
        description: "Please sign in again.",
        variant: "destructive",
      });
    });
    return () => setOnSessionExpired(null);
  }, [navigate, queryClient]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      hadSessionRef.current = false;
      queryClient.clear();
      navigate("/");
    }
  }, [logoutMutation, queryClient, navigate]);

  const user = meQuery.data
    ? {
        email: meQuery.data.email,
        firstName: meQuery.data.firstName ?? null,
        lastName: meQuery.data.lastName ?? null,
        role: meQuery.data.role,
        hasActiveSubscription: meQuery.data.hasActiveSubscription,
      }
    : null;

  // Only block routes on the initial session load. Background refetches (e.g. from
  // dashboard subscription refresh) must not unmount protected pages — that caused
  // an invalidate → isFetching → loader → remount loop.
  const isAuthPending = meQuery.isLoading && !meQuery.data;

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(meQuery.data),
    isLoading: meQuery.isLoading,
    isAuthPending,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
