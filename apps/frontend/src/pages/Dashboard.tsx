import { useAuth, roleLabel } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Selamat datang, {user?.name ?? user?.email}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Masuk sebagai {user ? roleLabel[user.role] : ""}. Pilih modul di sidebar untuk mulai bekerja.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Dokumen Mutu</p>
            <p className="mt-1 text-xs text-slate-400">Kelola SOP, IK, Formulir & Cerapan</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Peneraan</p>
            <p className="mt-1 text-xs text-slate-400">Permohonan tera & cerapan digital</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Pengawasan</p>
            <p className="mt-1 text-xs text-slate-400">Cerapan pengawasan lapangan</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
