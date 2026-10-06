import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Eye, EyeOff } from "lucide-react";
import { useAuth, roles, roleLabel } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" as string });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    if (!form.role) {
      setError("Role wajib dipilih");
      return;
    }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role as any });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(getErrorMessage(err, "Registrasi gagal"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Scale className="h-10 w-10 text-brass-400" strokeWidth={1.5} />
          <h1 className="mt-3 text-xl font-semibold text-white">Buat Akun</h1>
          <p className="mt-1 text-sm text-slate-400">Metrologi Legal — Sistem Administrasi Terintegrasi</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl bg-white p-6 shadow-xl">
          <div className="mb-4">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nama lengkap" />
          </div>

          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="nama@instansi.go.id"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              required
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            >
              <option value="">Pilih role</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mb-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <FieldError message={error ?? undefined} />
          {success && <p className="mt-1 text-sm text-emerald-600">Registrasi berhasil, mengalihkan ke login...</p>}

          <Button type="submit" className="mt-4 w-full" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-navy-900 hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
