import React from 'react';
import { useEncounterStore } from '../store/useEncounterStore';

// Per-module error boundary: keeps the sidebar / navigation / global chrome
// alive if a single examination view throws at runtime. On top of the
// top-level AppErrorBoundary (defense-in-depth).
export class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; module: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, module: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, module: error.message };
  }

  handleReset = (gotoTab: (tab: string) => void) => {
    this.setState({ hasError: false, module: '' });
    gotoTab('reason-for-visit');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white p-8 m-6 rounded-xl border border-red-200 shadow-sm max-w-4xl">
          <h2 className="text-lg font-bold text-red-700 mb-2 uppercase tracking-wide">
            Something went wrong loading this module
          </h2>
          <p className="text-xs text-slate-500 mb-4">{this.state.module}</p>
          <ModuleErrorReset onReset={this.handleReset} />
        </div>
      );
    }
    return this.props.children;
  }
}

function ModuleErrorReset({ onReset }: { onReset: (gotoTab: (tab: string) => void) => void }) {
  const setActiveTab = useEncounterStore((s) => s.setActiveTab);
  return (
    <button
      type="button"
      onClick={() => onReset(setActiveTab)}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
    >
      Back to Reason for Visit
    </button>
  );
}
