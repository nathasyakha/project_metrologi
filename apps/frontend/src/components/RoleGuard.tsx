import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type Role } from "@/lib/auth";

/**
 * Sembunyikan elemen (tombol, menu, dsb) kalau role user tidak termasuk `allow`.
 * Pemakaian: <RoleGuard allow={["admin", "petugas_penera"]}><Button /></RoleGuard>
 *
 * PENTING: ini murni UX. Backend tetap harus menegakkan aturan yang sama —
 * jangan pernah anggap ini sebagai satu-satunya lapisan keamanan.
 */
export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { hasRole } = useAuth();
  if (!hasRole(allow)) return null;
  return <>{children}</>;
}

/**
 * Proteksi seluruh route berdasarkan role. Kalau tidak punya akses, redirect ke /403.
 * Pemakaian di router: <Route element={<RoleRoute allow={["admin"]} />}>...</Route>
 */
export function RoleRoute({ allow }: { allow: Role[] }) {
  const { hasRole } = useAuth();
  if (!hasRole(allow)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
