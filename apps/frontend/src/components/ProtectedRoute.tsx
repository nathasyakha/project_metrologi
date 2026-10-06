import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";

function FullscreenSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-navy-900" />
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Sedang verifikasi token ke /auth/me — jangan redirect dulu, supaya user yang
  // sesinya masih valid tidak sempat "dilempar" ke halaman login.
  if (loading) return <FullscreenSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
