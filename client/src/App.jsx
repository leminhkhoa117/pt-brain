import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { Spinner } from './components/ui.jsx';
import { useAuth } from './hooks/useAuth.jsx';

// Tách route theo trang: dashboard không phải tải Three.js/Recharts của
// trang Cơ bắp 3D hay các trang nặng khác ngay từ lần đầu.
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const BodyLog = lazy(() => import('./pages/BodyLog.jsx'));
const Calculators = lazy(() => import('./pages/Calculators.jsx'));
const Research = lazy(() => import('./pages/Research.jsx'));
const Training = lazy(() => import('./pages/Training.jsx'));
const Learn = lazy(() => import('./pages/Learn.jsx'));
const NutritionPage = lazy(() => import('./pages/NutritionPage.jsx'));
const BodyAssessmentPage = lazy(() => import('./pages/BodyAssessmentPage.jsx'));
const MusclePage = lazy(() => import('./pages/MusclePage.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

function PageFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper dark:bg-[#0e1211]">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-md bg-pine-700 font-display text-lg font-semibold text-white dark:bg-pine-500 dark:text-pine-950">
          PT
        </span>
        <Spinner />
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<Splash />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<Splash />}>
            <Register />
          </Suspense>
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/body-log" element={<BodyLog />} />
        <Route path="/body-assessment" element={<BodyAssessmentPage />} />
        <Route path="/muscles" element={<MusclePage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/research" element={<Research />} />
        <Route path="/training" element={<Training />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
