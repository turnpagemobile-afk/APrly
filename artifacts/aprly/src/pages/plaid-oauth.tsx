import { useEffect, useRef, useState } from "react";
import type { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { CabinetPageLoader } from "@/components/dashboard/CabinetPageLoader";
import {
  destroyPlaidHandler,
  ensurePlaidScript,
  resumePlaidLink,
  type PlaidLinkHandler,
} from "@/components/landing/plaidLink";
import { goToLanding } from "@/lib/app-navigation";
import {
  completePlaidOAuthImport,
  plaidOAuthMessages,
  redirectAfterPlaidOAuthExit,
} from "@/lib/plaid-flow-resume";
import {
  isPlaidOAuthReturnUrl,
  loadPlaidOAuthSession,
} from "@/lib/plaid-oauth-session";
import { useToast } from "@/hooks/use-toast";

type PlaidOAuthPageState =
  | { kind: "loading" }
  | { kind: "error"; message: string };

export default function PlaidOAuthPage() {
  const { toast } = useToast();
  const handlerRef = useRef<PlaidLinkHandler | null>(null);
  const startedRef = useRef(false);
  const [state, setState] = useState<PlaidOAuthPageState>({ kind: "loading" });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const search = window.location.search;
    if (!isPlaidOAuthReturnUrl(search)) {
      setState({ kind: "error", message: plaidOAuthMessages.missingState });
      return;
    }

    const session = loadPlaidOAuthSession();
    if (!session) {
      setState({ kind: "error", message: plaidOAuthMessages.sessionExpired });
      return;
    }

    void (async () => {
      try {
        await ensurePlaidScript();
        destroyPlaidHandler(handlerRef.current);
        handlerRef.current = null;

        const handler = resumePlaidLink({
          token: session.linkToken,
          receivedRedirectUri: window.location.href,
          onSuccess: (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
            void (async () => {
              try {
                const result = await completePlaidOAuthImport(
                  session,
                  publicToken,
                  metadata,
                );
                if (result.cardCount === 0) {
                  toast({
                    title: plaidOAuthMessages.noCards,
                  });
                }
              } catch (e) {
                toast({
                  variant: "destructive",
                  title: plaidOAuthMessages.exchangeFailed,
                  description: e instanceof Error ? e.message : "Unknown error",
                });
                redirectAfterPlaidOAuthExit(session);
              } finally {
                destroyPlaidHandler(handlerRef.current);
                handlerRef.current = null;
              }
            })();
          },
          onExit: () => {
            redirectAfterPlaidOAuthExit(session);
            destroyPlaidHandler(handlerRef.current);
            handlerRef.current = null;
          },
          onEvent: (eventName: string) => {
            if (eventName === "ERROR") {
              toast({
                variant: "destructive",
                title: plaidOAuthMessages.exchangeFailed,
              });
            }
          },
        });

        handlerRef.current = handler;
      } catch (e) {
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : plaidOAuthMessages.exchangeFailed,
        });
      }
    })();

    return () => {
      destroyPlaidHandler(handlerRef.current);
      handlerRef.current = null;
    };
  }, [toast]);

  if (state.kind === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="app-text-p1-regular text-average max-w-md">{state.message}</p>
        <button
          type="button"
          className="text-action underline"
          onClick={() => goToLanding("/")}
        >
          Back to APrly
        </button>
      </div>
    );
  }

  return <CabinetPageLoader label={plaidOAuthMessages.connecting} />;
}
