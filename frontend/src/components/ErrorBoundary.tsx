import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-tactical-card border border-tactical-border rounded-xl p-8">
                    <div className="p-4 rounded-full bg-red-500/10 mb-4">
                        <AlertTriangle className="text-red-500" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                    <p className="text-gray-400 mb-6 text-center max-w-md">
                        {this.props.fallbackMessage || 'This section encountered an error. Try refreshing.'}
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                    {this.state.error && (
                        <pre className="mt-4 text-xs text-gray-500 max-w-md overflow-auto bg-slate-900 p-3 rounded-lg">
                            {this.state.error.message}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
