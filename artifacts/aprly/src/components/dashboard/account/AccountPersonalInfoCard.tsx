import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, usePatchMe } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-session";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { toast } from "@/hooks/use-toast";
import { AuthTextInput } from "@/components/shared/auth-form/AuthTextInput";
import { AccountSubmitButton, AccountSuccessView } from "@/components/dashboard/account/AccountShared";
import { useBitField } from "@/lib/use-bit-field";

export function AccountPersonalInfoCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const patchMe = usePatchMe();
  const copy = dashboardProfileContent.personalInfo;
  const fieldRequired = dashboardProfileContent.fieldRequired;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const setFirstNameBit = useCallback((v: string) => setFirstName(v), []);
  const setLastNameBit = useCallback((v: string) => setLastName(v), []);
  useBitField("account-first-name", setFirstNameBit);
  useBitField("account-last-name", setLastNameBit);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
  }, [user]);

  const firstNameError = submitAttempted && !firstName.trim();
  const lastNameError = submitAttempted && !lastName.trim();

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!firstName.trim() || !lastName.trim()) return;

    try {
      await patchMe.mutateAsync({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setShowSuccess(true);
    } catch {
      toast({
        ...dashboardProfileContent.toast.profileError,
        variant: "destructive",
      });
    }
  };

  if (showSuccess) {
    return (
      <section className="dash-account-card">
        <h2 className="dash-account-section-title">{copy.title}</h2>
        <AccountSuccessView
          message={copy.successMessage}
          onOk={() => {
            setShowSuccess(false);
            setSubmitAttempted(false);
          }}
        />
      </section>
    );
  }

  return (
    <section className="dash-account-card">
      <h2 className="dash-account-section-title">{copy.title}</h2>
      <form className="space-y-4" onSubmit={(e) => void onSave(e)}>
        <AuthTextInput
          id="account-first-name"
          label={copy.firstName}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          maxLength={120}
          error={firstNameError ? fieldRequired : null}
        />

        <AuthTextInput
          id="account-last-name"
          label={copy.lastName}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          maxLength={120}
          error={lastNameError ? fieldRequired : null}
        />

        <AccountSubmitButton label={copy.save} pending={patchMe.isPending} />
      </form>
    </section>
  );
}
