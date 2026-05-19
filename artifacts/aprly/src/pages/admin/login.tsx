import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { ApiError } from "@workspace/api-client-react/custom-fetch";
import { useAdminLogin } from "@workspace/api-client-react";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { adminContent } from "@/content/admin";
import { saveAdminChallenge } from "@/lib/admin-auth-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const login = useAdminLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login.mutateAsync({
        data: { email: email.trim(), password },
      });
      saveAdminChallenge(result.challengeToken, result.email);
      navigate("/admin/verify");
    } catch (err: unknown) {
      const apiMsg =
        err instanceof ApiError && typeof err.data === "object" && err.data && "error" in err.data
          ? String((err.data as { error?: unknown }).error ?? "")
          : "";
      toast({
        title: adminContent.login.failed,
        description: apiMsg || adminContent.login.failedDescription,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminAuthLayout>
      <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-foreground">
        {adminContent.login.title}
      </h1>
      <form className="mt-8 grid gap-4" onSubmit={(e) => void onSubmit(e)}>
        <div className="grid gap-2">
          <Label htmlFor="admin-email">{adminContent.login.email}</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="admin-password">{adminContent.login.password}</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-2 w-full font-semibold" disabled={login.isPending}>
          {login.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            adminContent.login.submit
          )}
        </Button>
      </form>
    </AdminAuthLayout>
  );
}
