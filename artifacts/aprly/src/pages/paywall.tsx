import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateSubscription } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ShieldCheck, CreditCard, Calendar, Lock } from "lucide-react";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  nameOnCard: z.string().min(2, "Name is required"),
  cardNumber: z.string().min(15, "Invalid card number"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "MM/YY format"),
  cvc: z.string().min(3, "Invalid CVC").max(4),
  zip: z.string().min(5, "Invalid ZIP"),
  country: z.string().min(2, "Country required"),
});

export default function Paywall() {
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const createSub = useCreateSubscription();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: "", nameOnCard: "", cardNumber: "", expiry: "", cvc: "", zip: "", country: "US" },
  });

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    try {
      await createSub.mutateAsync({
        data: { email: data.email, plan: "interest_protection" }
      });
      setSuccess(true);
    } catch (e) {
      toast({ title: "Payment Failed", description: "Could not process subscription.", variant: "destructive" });
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Payment Details</h3>
                <div className="flex gap-2 text-muted-foreground">
                  <ShieldCheck className="h-5 w-5" />
                  <Lock className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...form.register("email")} placeholder="you@example.com" className="bg-background" />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Card Information</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input {...form.register("cardNumber")} placeholder="0000 0000 0000 0000" className="pl-10 bg-background" />
                  </div>
                  {form.formState.errors.cardNumber && <p className="text-xs text-destructive">{form.formState.errors.cardNumber.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry (MM/YY)</Label>
                    <Input {...form.register("expiry")} placeholder="MM/YY" className="bg-background" />
                    {form.formState.errors.expiry && <p className="text-xs text-destructive">{form.formState.errors.expiry.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input {...form.register("cvc")} placeholder="123" className="bg-background" />
                    {form.formState.errors.cvc && <p className="text-xs text-destructive">{form.formState.errors.cvc.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Name on Card</Label>
                  <Input {...form.register("nameOnCard")} placeholder="John Doe" className="bg-background" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select onValueChange={(val) => form.setValue("country", val)} defaultValue="US">
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP</Label>
                    <Input {...form.register("zip")} placeholder="12345" className="bg-background" />
                  </div>
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
