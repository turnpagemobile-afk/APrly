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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { adminContent } from "@/content/admin";
import { toast } from "@/hooks/use-toast";
import {
  clearAdminChallenge,
  readAdminChallenge,
  saveAdminChallenge,
} from "@/lib/admin-auth-flow";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 59;

export default function AdminVerifyPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const challenge = readAdminChallenge();
  const verify = useAdminVerifyOtp();
  const resend = useAdminResendOtp();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  if (!challenge) {
    return <Redirect to="/admin/login" />;
  }

  const codeIncomplete = submitAttempted && code.length !== 6;
  const codeInvalid = verifyError && code.length === 6;
  const hasOtpError = codeIncomplete || codeInvalid;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setVerifyError(false);
    if (code.length !== 6) return;

    try {
      await verify.mutateAsync({
        data: { challengeToken: challenge.token, code },
      });
      clearAdminChallenge();
      await queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
      navigate("/admin/dashboard");
    } catch {
      setVerifyError(true);
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
        title: "Resend failed",
        description: adminContent.verify.errors.resendFailed,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminAuthLayout>
      <div className="admin-auth-verify-header">
        <Link
          href="/admin/login"
          className="admin-auth-back-link text-title"
          aria-label={adminContent.verify.backAria}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <span className="admin-auth-email-badge app-text-p1-regular text-title">{challenge.email}</span>
      </div>

      <h1 className="app-header-h6 text-title mt-6">{adminContent.verify.title}</h1>
      <p className="app-text-p1-regular text-average mt-2">{adminContent.verify.description}</p>

      <form className="mt-6 space-y-5" onSubmit={(e) => void onSubmit(e)}>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => {
            setCode(value);
            setVerifyError(false);
          }}
        >
          <InputOTPGroup className="admin-auth-otp-group">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn("admin-auth-otp-slot", hasOtpError && "admin-auth-otp-slot--error")}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {codeIncomplete ? (
          <div role="alert" className="admin-auth-verify-error">
            {adminContent.verify.errors.codeRequired}
          </div>
        ) : null}

        {codeInvalid ? (
          <div role="alert" className="admin-auth-verify-error">
            {adminContent.verify.errors.invalid}
          </div>
        ) : null}

        <button
          type="submit"
          className="admin-auth-submit-btn app-button-button-l-m text-neutral-000"
          disabled={verify.isPending}
        >
          {verify.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            adminContent.verify.submit
          )}
        </button>

        <p className="app-text-p1-regular text-average text-center">
          {adminContent.verify.resendPrompt}{" "}
          <button
            type="button"
            className="admin-auth-resend-link uppercase"
            disabled={secondsLeft > 0 || resend.isPending}
            onClick={() => void onResend()}
          >
            {adminContent.verify.resend}
          </button>
          {secondsLeft > 0 ? (
            <span className="app-text-p1-regular text-average">
              {" "}
              {adminContent.verify.resendWait(secondsLeft)}
            </span>
          ) : null}
        </p>
      </form>
    </AdminAuthLayout>
  );
}
