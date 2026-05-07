import { Building, CreditCard, Lock } from "lucide-react";

export function TrustBar() {
  return (
    <section className="border-y border-border/40 bg-card/30 py-12">
      <div className="container mx-auto px-4 flex flex-wrap justify-center items-center gap-x-16 gap-y-6 text-foreground/70">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <Building className="h-6 w-6" /> PLAID
        </div>
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <CreditCard className="h-6 w-6" /> STRIPE
        </div>
        <div className="flex items-center gap-3 font-semibold text-base tracking-[0.25em] uppercase">
          <Lock className="h-5 w-5" /> 256-bit Encryption
        </div>
      </div>
    </section>
  );
}
