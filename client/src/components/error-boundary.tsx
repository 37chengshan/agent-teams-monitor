'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 bg-background-secondary rounded-lg border border-slate-700">
            <AlertTriangle className="w-12 h-12 text-accent-warning mb-4" />
            <h2 className="text-lg font-medium text-slate-50 mb-2">出现错误</h2>
            <p className="text-sm text-slate-400 mb-4 text-center max-w-md">
              {this.state.error?.message || '发生了未知错误，请重试。'}
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg cursor-pointer hover:bg-blue-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
