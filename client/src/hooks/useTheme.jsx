import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { buildStudioVars } from '../theme/apply.js';
import { DEFAULT_CUSTOMIZATION, normalizeCustomization } from '../theme/presets.js';
import ThemeFxLayer from '../theme/ThemeFxLayer.jsx';

const ThemeContext = createContext(null);
const THEME_KEY = 'pt-theme';
const STUDIO_KEY = 'ptbrain.studio.v1';
const STUDIO_VARS_KEY = 'ptbrain.studio.vars.v1';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStudio() {
  try {
    const raw = localStorage.getItem(STUDIO_KEY);
    if (raw) return normalizeCustomization(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return normalizeCustomization(DEFAULT_CUSTOMIZATION);
}

function writeStudio(value) {
  try {
    localStorage.setItem(STUDIO_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/**
 * Lưu sẵn biến CSS cho cả 2 chế độ để theme-init.js áp dụng trước khi React
 * mount — tránh nháy màu khi tải lại trang với theme tùy chỉnh.
 */
function persistBootVars(customization) {
  try {
    localStorage.setItem(
      STUDIO_VARS_KEY,
      JSON.stringify({
        version: 1,
        themeId: customization.themeId,
        light: buildStudioVars(customization, 'light'),
        dark: buildStudioVars(customization, 'dark'),
      }),
    );
  } catch {
    /* ignore */
  }
}

function applyRoot(customization, mode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const vars = buildStudioVars(customization, mode);
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
  root.dataset.tsTheme = customization.themeId;
  root.dataset.tsMode = mode;
  root.dataset.tsButton = customization.components.button;
  root.dataset.tsCard = customization.components.card;
  root.dataset.tsMetric = customization.components.metric;

  const shell = vars['--ts-shell'];
  const meta = document.querySelector('meta[name="theme-color"]');
  if (shell && meta) meta.setAttribute('content', `rgb(${shell})`);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [customization, setCustomization] = useState(readStudio);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    applyRoot(customization, theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, customization]);

  // Chuẩn bị biến CSS cho lần tải kế tiếp (theme-init.js chạy trước bundle).
  useEffect(() => {
    persistBootVars(customization);
  }, [customization]);

  // Đồng bộ khi mở nhiều tab: một tab áp dụng theme thì tab còn lại theo ngay.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STUDIO_KEY && event.newValue) {
        try {
          setCustomization(normalizeCustomization(JSON.parse(event.newValue)));
        } catch {
          /* ignore */
        }
      }
      if (event.key === THEME_KEY && (event.newValue === 'dark' || event.newValue === 'light')) {
        setTheme(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const applyCustomization = useCallback((next) => {
    const normalized = normalizeCustomization(next);
    setCustomization(normalized);
    writeStudio(normalized);
    return normalized;
  }, []);

  const resetCustomization = useCallback(() => {
    const normalized = normalizeCustomization(DEFAULT_CUSTOMIZATION);
    setCustomization(normalized);
    writeStudio(normalized);
    return normalized;
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggle: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      setTheme,
      customization,
      applyCustomization,
      resetCustomization,
    }),
    [theme, customization, applyCustomization, resetCustomization],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="ts-root">
        <ThemeFxLayer customization={customization} />
        <div className="ts-content">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải dùng bên trong ThemeProvider');
  return ctx;
}
