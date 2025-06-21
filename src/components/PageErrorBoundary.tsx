import { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`Error in ${this.props.pageName || 'page'}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Error loading {this.props.pageName || 'this page'}
                </h3>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                  Something went wrong while loading this section. Please try refreshing the page.
                </p>
                {import.meta.env.DEV && this.state.error && (
                  <pre className="mt-4 text-xs text-red-600 dark:text-red-400 overflow-auto">
                    {this.state.error.message}
                  </pre>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}