import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRoute } from "@/components/RoleGuard";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Profile } from "@/pages/Profile";
import { Forbidden } from "@/pages/Forbidden";
import { Dashboard } from "@/pages/Dashboard";
import { Sampah } from "./pages/Sampah";
import { DokumenMutuList } from "@/pages/dokumen-mutu/DokumenMutuList";
import { DokumenMutuKedaluwarsa } from "@/pages/dokumen-mutu/DokumenMutuKedaluwarsa";
import { PeneraanPage1 } from "@/pages/peneraan/PeneraanPage1";

function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Modul ini belum dibangun — lanjutkan sesuai kebutuhan.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/403" element={<Forbidden />} />

              <Route path="/dokumen-mutu" element={<DokumenMutuList />} />
              <Route path="/dokumen-mutu/kedaluwarsa" element={<DokumenMutuKedaluwarsa />} />
              <Route path="/peneraan" element={<PeneraanPage1 />} />
              <Route path="/pengawasan" element={<ModulePlaceholder title="Pengawasan" />} />
              <Route element={<RoleRoute allow={["admin"]} />}>
                <Route path="/sampah" element={<Sampah />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
