import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Forbidden() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="h-12 w-12 text-amber-500" strokeWidth={1.5} />
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Akses Ditolak</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Akun kamu tidak memiliki izin untuk membuka halaman ini. Silakan hubungi administrator.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="secondary">Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
