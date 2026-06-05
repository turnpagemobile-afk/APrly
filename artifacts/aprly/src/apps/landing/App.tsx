import { Switch, Route } from "wouter";
import { Layout } from "@/components/layout";
import { SignupCheckoutProvider } from "@/lib/signup-checkout-context";
import { ForgotPasswordProvider } from "@/lib/forgot-password-context";
import { SignupCheckoutHost } from "@/components/auth/signup-checkout-host";
import { ForgotPasswordHost } from "@/components/auth/forgot-password-host";
import { AppProviders } from "@/apps/shared/AppProviders";
import { LandingThemeEffect } from "@/components/landing/LandingThemeEffect";
import { ScrollLockRouteGuard } from "@/apps/shared/ScrollLockRouteGuard";
import Home from "@/pages/home";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Login from "@/pages/login";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

export default function LandingApp() {
  return (
    <AppProviders withUserAuth>
      <SignupCheckoutProvider>
        <ForgotPasswordProvider>
          <LandingThemeEffect />
          <ScrollLockRouteGuard />
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/reset-password" component={ResetPassword} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
          <SignupCheckoutHost />
          <ForgotPasswordHost />
        </ForgotPasswordProvider>
      </SignupCheckoutProvider>
    </AppProviders>
  );
}
