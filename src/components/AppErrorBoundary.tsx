import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Singlish Guru interface error', { error, componentStack: info.componentStack });
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6">
        <section className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl" role="alert">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">Something went wrong</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Singlish Guru could not display this section. Your saved learning progress has not been deleted.
          </p>
          <p className="mt-2 text-sm text-stone-600">මෙම කොටස පෙන්වීමට නොහැකි විය. නැවත උත්සාහ කරන්න.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.retry}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white hover:bg-amber-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50"
            >
              Reload app
            </button>
          </div>
        </section>
      </main>
    );
  }
}
