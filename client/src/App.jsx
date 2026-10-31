import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { Spinner } from './components/ui.jsx';
import { useAuth } from './hooks/useAuth.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BodyLog from './pages/BodyLog.jsx';
import Calculators from './pages/Calculators.jsx';
import Research from './pages/Research.jsx';
import Training from './pages/Training.jsx';
import Learn from './pages/Learn.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import Settings from './pages/Settings.jsx';

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-xl font-black text-white shadow-soft">
          PT
        </span>
        <Spinner />
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/body-log" element={<BodyLog />} />
        <Route path="/research" element={<Research />} />
        <Route path="/training" element={<Training />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
