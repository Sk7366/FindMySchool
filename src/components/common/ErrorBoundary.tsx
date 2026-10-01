import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, ArrowLeft, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log privately without exposing to end-user UI
    console.error('FindMySchool caught an unhandled rendering error:', error, errorInfo);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleBackToDiscovery = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/results';
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 font-sans text-stone-900">
          <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-md text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Something interrupted this view.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                Your search is safe. Try refreshing or returning to discovery.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={this.handleTryAgain}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#0D9488] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>

              <button
                type="button"
                onClick={this.handleBackToDiscovery}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#F5F1E8] hover:bg-stone-200 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to discovery</span>
              </button>
            </div>

            <div className="pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-3 h-3" />
                <span>Return to home page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
