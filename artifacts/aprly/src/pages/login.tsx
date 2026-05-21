import { useEffect, useState } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { getGetMeQueryKey, useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard?tab=home");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (!isLoading && isAuthenticated) {
    return <Redirect to="/dashboard?tab=home" />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ data: { email, password } });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      navigate("/dashboard?tab=home");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError && typeof err.data === "object" && err.data && "error" in err.data
          ? String((err.data as { error?: unknown }).error ?? "")
          : err instanceof Error
            ? err.message
            : "";
      toast({
        title: "Sign-in failed",
        description: msg || "Check your email and password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="app-page-narrow py-16">
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Back to home
        </Link>{" "}
        and tap &quot;Activate APRly&quot;.
      </p>
      <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
}
