import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Đã xảy ra lỗi không mong muốn.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      let displayDetail = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage) as { error?: string };
        if (parsed?.error) {
          displayDetail = parsed.error;
        }
      } catch {
        // Not JSON, keep raw message
      }

      return (
        <div className="min-h-screen bg-[#160404] text-[#FBF7F0] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#240606] border border-[#D4AF37]/35 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#E6C674] mb-3">
              Thông báo hệ thống
            </p>
            <h1 className="font-display text-2xl font-bold text-[#FBF7F0] mb-3">
              Không thể hoàn tất thao tác vừa rồi
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed mb-6 break-words">
              {displayDetail}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9E1B1B] hover:bg-[#B72222] text-[#FBF7F0] text-sm font-medium border border-[#D4AF37]/40 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
