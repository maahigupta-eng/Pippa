import { Component, type ReactNode } from "react";

/** Catches display errors so the page shows a message instead of going blank. */
export default class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="notice error">
        <strong>Pippa couldn't display this page.</strong> Your analysis is saved: open it from <a href="#/saved">Saved</a>, or reload the page.
        If it keeps happening, send a screenshot of this message.
        <details>
          <summary>Technical details</summary>
          <code>{this.state.error.message}</code>
        </details>
      </div>
    );
  }
}
