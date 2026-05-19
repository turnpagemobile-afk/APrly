import { useEffect, useState } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getGetAdminMeQueryKey,
  useAdminResendOtp,
  useAdminVerifyOtp,
} from "@workspace/api-client-react";
import { AdminAuthLayout } from "@/components/admin/AdminAuthLayout";
import { adminContent } from "@/content/admin";
import {
  clearAdminChallenge,
  readAdminChallenge,
  saveAdminChallenge,
} from "@/lib/admin-auth-flow";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";

const RESEND_SECONDS = 59;

export default function AdminVerifyPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const challenge = readAdminChallenge();
  const verify = useAdminVerifyOtp();
  const resend = useAdminResendOtp();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  if (!challenge) {
    return <Redirect to="/admin/login" />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    try {
      await verify.mutateAsync({
        data: { challengeToken: challenge.token, code },
      });
      clearAdminChallenge();
      await queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
      navigate("/admin/dashboard");
    } catch {
      toast({
        title: adminContent.verify.invalid,
        description: adminContent.verify.invalidDescription,
        variant: "destructive",
      });
    }
  };

  const onResend = async () => {
    if (secondsLeft > 0) return;
    try {
      const result = await resend.mutateAsync({
        data: { challengeToken: challenge.token },
      });
      saveAdminChallenge(result.challengeToken, result.email);
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      toast({
        title: adminContent.verify.invalid,
        description: adminContent.verify.invalidDescription,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminAuthLayout>
      <div className="mb-4 flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/admin/login" aria-label={adminContent.verify.backAria}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {challenge.email}
        </span>
      </div>
      <h1 className="text-xl font-bold tracking-tight text-foreground">{adminContent.verify.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {adminContent.verify.description(challenge.email)}
      </p>
      <form className="mt-8 space-y-6" onSubmit={(e) => void onSubmit(e)}>
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup className="w-full justify-between">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={code.length !== 6 || verify.isPending}
        >
          {verify.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            adminContent.verify.submit
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            className="font-semibold text-primary disabled:opacity-50"
            disabled={secondsLeft > 0 || resend.isPending}
            onClick={() => void onResend()}
          >
            {secondsLeft > 0
              ? adminContent.verify.resendWait(secondsLeft)
              : adminContent.verify.resend}
          </button>
        </p>
      </form>
    </AdminAuthLayout>
  );
}
