import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg py-20 text-center">
          <div className="card">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Có lỗi hiển thị trang này
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {this.state.error.message || 'Lỗi không xác định'}
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
