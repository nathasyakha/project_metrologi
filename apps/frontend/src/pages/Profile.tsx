import { useAuth, roleLabel } from "@/lib/auth";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900">Profil Saya</h1>
      <p className="mt-1 text-sm text-slate-500">Informasi akun kamu di sistem ini.</p>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-950 text-xl font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Role</dt>
              <dd>
                <Badge tone="blue">{roleLabel[user.role]}</Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">ID Pengguna</dt>
              <dd className="font-mono text-xs text-slate-600">{user.id}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
