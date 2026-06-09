"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-severity-severe/10 flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-severity-severe" />
          </div>
          <h1 className="font-display text-3xl text-text-primary mb-4">
            Something went wrong
          </h1>
          <p className="text-text-tertiary mb-8 max-w-md">
            We encountered an unexpected error. This has been logged and we&apos;ll look into it.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 h-11 px-6 rounded-card bg-brand text-text-inverse text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm"
          >
            <RefreshCcw size={16} />
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
