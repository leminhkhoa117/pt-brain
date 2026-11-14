import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Icon, Portal } from './ui.jsx';

const DialogContext = createContext(null);

function normalizeOptions(options) {
  if (typeof options === 'string') return { message: options };
  return options || {};
}

/**
 * Hộp thoại xác nhận/nhập liệu dùng chung, thay cho window.confirm/prompt.
 * Trả về Promise<boolean> cho confirm, Promise<string|null> cho prompt.
 */
export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const inputRef = useRef(null);

  const close = useCallback((result) => {
    setDialog((current) => {
      if (!current) return null;
      current.resolve?.(result);
      return null;
    });
  }, []);

  const confirm = useCallback((options) => {
    const opts = normalizeOptions(options);
    return new Promise((resolve) => {
      setDialog((current) => {
        current?.resolve?.(false);
        return {
          kind: 'confirm',
          title: opts.title || 'Xác nhận',
          message: opts.message || '',
          confirmLabel: opts.confirmLabel || 'Xác nhận',
          cancelLabel: opts.cancelLabel || 'Hủy',
          tone: opts.tone || 'danger',
          resolve,
        };
      });
    });
  }, []);

  const prompt = useCallback((options) => {
    const opts = normalizeOptions(options);
    return new Promise((resolve) => {
      setDialog((current) => {
        current?.resolve?.(null);
        return {
          kind: 'prompt',
          title: opts.title || 'Nhập thông tin',
          message: opts.message || '',
          label: opts.label || '',
          placeholder: opts.placeholder || '',
          maxLength: opts.maxLength || 500,
          multiline: Boolean(opts.multiline),
          confirmLabel: opts.confirmLabel || 'Lưu',
          cancelLabel: opts.cancelLabel || 'Hủy',
          value: opts.defaultValue ?? '',
          resolve,
        };
      });
    });
  }, []);

  const alert = useCallback((options) => {
    const opts = normalizeOptions(options);
    return new Promise((resolve) => {
      setDialog((current) => {
        current?.resolve?.(null);
        return {
          kind: 'alert',
          title: opts.title || 'Thông báo',
          message: opts.message || '',
          confirmLabel: opts.confirmLabel || 'OK',
          tone: opts.tone || 'info',
          resolve,
        };
      });
    });
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(dialog.kind === 'prompt' ? null : false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [dialog, close]);

  const submit = () => {
    if (!dialog) return;
    if (dialog.kind === 'prompt') close(dialog.value);
    else close(dialog.kind === 'confirm' ? true : null);
  };

  const cancel = () => {
    if (!dialog) return;
    close(dialog.kind === 'prompt' ? null : false);
  };

  const value = { confirm, prompt, alert };

  return (
    <DialogContext.Provider value={value}>
      {children}
      {dialog && (
        <Portal>
          <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) cancel();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="app-dialog-title"
              className="w-full max-w-md rounded-lg bg-white p-5 shadow-overlay dark:bg-slate-900"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    dialog.tone === 'danger'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300'
                      : 'bg-pine-50 text-pine-700 dark:bg-pine-950/50 dark:text-pine-300'
                  }`}
                >
                  <Icon
                    name={dialog.tone === 'danger' ? 'alert' : 'info'}
                    className="h-4 w-4"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <h2
                    id="app-dialog-title"
                    className="text-base font-semibold text-slate-900 dark:text-white"
                  >
                    {dialog.title}
                  </h2>
                  {dialog.message && (
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {dialog.message}
                    </p>
                  )}

                  {dialog.kind === 'prompt' && (
                    <div className="mt-4">
                      {dialog.label && <span className="label">{dialog.label}</span>}
                      {dialog.multiline ? (
                        <textarea
                          ref={inputRef}
                          className="input min-h-[90px]"
                          value={dialog.value}
                          placeholder={dialog.placeholder}
                          maxLength={dialog.maxLength}
                          onChange={(event) =>
                            setDialog((current) =>
                              current ? { ...current, value: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        <input
                          ref={inputRef}
                          className="input"
                          value={dialog.value}
                          placeholder={dialog.placeholder}
                          maxLength={dialog.maxLength}
                          onChange={(event) =>
                            setDialog((current) =>
                              current ? { ...current, value: event.target.value } : current,
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              submit();
                            }
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                {dialog.kind !== 'alert' && (
                  <button type="button" className="btn-secondary" onClick={cancel}>
                    {dialog.cancelLabel}
                  </button>
                )}
                <button
                  type="button"
                  className={
                    dialog.tone === 'danger'
                      ? 'btn bg-rose-600 text-white hover:bg-rose-700'
                      : 'btn-primary'
                  }
                  onClick={submit}
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog phải dùng bên trong DialogProvider');
  return context;
}
