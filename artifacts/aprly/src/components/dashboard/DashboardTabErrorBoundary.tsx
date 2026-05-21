import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class DashboardTabErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Dashboard tab render failed", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-page-cabinet flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-destructive font-semibold">Something went wrong</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This section could not be displayed. Reload the app to try again.
          </p>
          <Button
            type="button"
            size="sm"
            className="font-semibold"
            onClick={() => window.location.reload()}
          >
            Reload app
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
