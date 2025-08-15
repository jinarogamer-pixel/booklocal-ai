"use client";
import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error?: Error }
> {
  state = { error: undefined as Error | undefined };
  
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  
  componentDidCatch(error: Error) {
    console.error("UI crash:", error);
  }
  
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <h2 className="text-xl font-bold">Something went wrong.</h2>
          <pre className="mt-2 text-sm opacity-70">
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
