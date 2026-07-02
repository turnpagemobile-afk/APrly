import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import {
  useCreatePlaidLinkToken,
  useExchangePlaidPublicToken,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import type { CardEntry } from "@/components/landing/types";
import {
  createPlaidLink,
  destroyPlaidHandler,
  ensurePlaidScript,
  openPlaidLinkDeferred,
  type PlaidLinkHandler,
} from "@/components/landing/plaidLink";

export type PlaidImportedCard = {
  brand: string;
  balance: number;
  rate: number;
  accountId?: string;
};

export type UsePlaidCardImportOptions = {
  onImported?: (cards: PlaidImportedCard[]) => void;
  onExit?: () => void;
};

export function usePlaidCardImport(
  setAccounts?: Dispatch<SetStateAction<CardEntry[]>>,
  options?: UsePlaidCardImportOptions,
) {
  const { toast } = useToast();
  const onImported = options?.onImported;
  const onExit = options?.onExit;
  const linkHandlerRef = useRef<PlaidLinkHandler | null>(null);
  const plaidClickLockRef = useRef(false);
  const [plaidOpening, setPlaidOpening] = useState(false);

  const createLinkToken = useCreatePlaidLinkToken();
  const exchangeToken = useExchangePlaidPublicToken();

  useEffect(() => {
    return () => {
      plaidClickLockRef.current = false;
      destroyPlaidHandler(linkHandlerRef.current);
      linkHandlerRef.current = null;
    };
  }, []);

  const appendImported = useCallback(
    (rows: PlaidImportedCard[]) => {
      if (!setAccounts) return;
      setAccounts((prev) => {
        const seen = new Set(
          prev.map((a) => a.accountId).filter((id): id is string => !!id),
        );
        const fresh = rows.filter((r) => !r.accountId || !seen.has(r.accountId));
        const mapped: CardEntry[] = fresh.map((r) => ({
          brand: r.brand,
          balance: String(r.balance),
          rate: String(r.rate),
          accountId: r.accountId,
        }));
        return [...prev, ...mapped];
      });
    },
    [setAccounts],
  );

  const runExchange = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      try {
        const result = await exchangeToken.mutateAsync({
          data: {
            publicToken,
            institutionName: metadata.institution?.name,
          },
        });
        appendImported(result.importedCards);
        onImported?.(result.importedCards);
        if (!result.importedCards.length) {
          toast({
            title: "No card debt imported",
            description:
              "Plaid returned no credit-card balances with APR. Try another sandbox institution or add cards manually.",
          });
        }
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Could not load bank cards",
          description: e instanceof Error ? e.message : "Unknown error",
        });
      } finally {
        destroyPlaidHandler(linkHandlerRef.current);
        linkHandlerRef.current = null;
      }
    },
    [appendImported, exchangeToken, onImported, toast],
  );

  const startPlaid = async () => {
    if (plaidClickLockRef.current) return;
    plaidClickLockRef.current = true;
    setPlaidOpening(true);
    try {
      await ensurePlaidScript();
      destroyPlaidHandler(linkHandlerRef.current);
      linkHandlerRef.current = null;

      const { linkToken } = await createLinkToken.mutateAsync();
      const token = typeof linkToken === "string" ? linkToken.trim() : "";
      if (!token) throw new Error("Empty link_token from API");

      const handler = createPlaidLink({
        token,
        onSuccess: (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
          plaidClickLockRef.current = false;
          setPlaidOpening(false);
          void runExchange(publicToken, metadata);
        },
        onExit: () => {
          plaidClickLockRef.current = false;
          setPlaidOpening(false);
          destroyPlaidHandler(linkHandlerRef.current);
          linkHandlerRef.current = null;
          onExit?.();
        },
        onEvent: (eventName: string) => {
          if (eventName === "ERROR") {
            plaidClickLockRef.current = false;
            setPlaidOpening(false);
          }
        },
      });

      linkHandlerRef.current = handler;
      openPlaidLinkDeferred(handler);
    } catch (e) {
      plaidClickLockRef.current = false;
      setPlaidOpening(false);
      destroyPlaidHandler(linkHandlerRef.current);
      linkHandlerRef.current = null;
      toast({
        variant: "destructive",
        title: "Plaid unavailable",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  const plaidBusy =
    plaidOpening || createLinkToken.isPending || exchangeToken.isPending;

  return { startPlaid, plaidBusy };
}
