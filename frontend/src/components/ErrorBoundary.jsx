import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service here
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl text-center">
                        <div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                                Something went wrong
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                We're sorry, but an unexpected error occurred.
                            </p>
                        </div>
                        <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
                            <div className="rounded-md shadow">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg transition-colors"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                        {process.env.NODE_ENV !== 'production' && (
                            <div className="mt-6 text-left border-t border-gray-200 dark:border-gray-700 pt-4 overflow-auto max-h-48 text-xs text-red-500">
                                <p className="font-semibold">{this.state.error && this.state.error.toString()}</p>
                                <pre className="mt-2">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
