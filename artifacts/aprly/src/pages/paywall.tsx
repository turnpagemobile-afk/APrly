import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateSubscription } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function Paywall() {
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const createSub = useCreateSubscription();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    try {
      await createSub.mutateAsync({
        data: { email: data.email, plan: "interest_protection" }
      });
      setSuccess(true);
    } catch (e) {
      toast({ title: "Activation Failed", description: "Could not activate subscription.", variant: "destructive" });
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md">
        <Card className="bg-card border-primary/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 rounded-xl" />
          <CardContent className="pt-12 pb-10 relative z-10">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
            <h2 className="text-2xl font-bold tracking-tight mb-2">Protection Active</h2>
            <p className="text-muted-foreground mb-8">
              Your Interest Protection Plan is now active. We're monitoring your accounts.
            </p>
            <Button className="w-full" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left: Summary */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Interest Protection Plan</h1>
            <p className="text-xl text-muted-foreground">Stop paying banks for your own money.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-bold tracking-tighter">$39</span>
              <span className="text-muted-foreground mb-1">/month</span>
            </div>
            
            <ul className="space-y-4">
              {[
                "24/7 automated rate negotiation",
                "Hardship portal management",
                "Real-time waste alerts",
                "Priority human support",
                "Cancel anytime"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Checkout */}
        <div>
          <Card className="bg-card border-border/50 shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-lg font-semibold mb-6">Activate Your Plan</h3>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...form.register("email")} placeholder="you@example.com" className="bg-background" />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>

                <Button type="submit" className="w-full h-12 text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] mt-4" disabled={createSub.isPending}>
                  {createSub.isPending ? "Processing..." : "Start Plan — $39/mo"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
