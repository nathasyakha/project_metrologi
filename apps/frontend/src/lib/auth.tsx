import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export const roles = ["admin", "petugas_penera", "pemilik_alat", "kepala", "staf", "pengawas", "pengamat_tera"] as const;
export type Role = (typeof roles)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (allowed: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  // true selama sesi awal sedang diverifikasi ke backend (cek token masih valid atau tidak)
  const [loading, setLoading] = useState(true);

  // Saat aplikasi pertama dibuka: kalau ada token tersimpan, verifikasi & refresh data user
  // ke backend. Kalau token sudah kedaluwarsa/invalid, otomatis logout tanpa menunggu
  // request lain gagal duluan.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        const authUser: AuthUser = res.data.data;
        localStorage.setItem("user", JSON.stringify(authUser));
        setUser(authUser);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);

    // ambil profil lengkap (nama, dsb) lewat /auth/me
    const me = await api.get("/auth/me");
    const authUser: AuthUser = me.data.data;

    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);
  }

  async function register(input: RegisterInput) {
    await api.post("/auth/register", input);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  function hasRole(allowed: Role[]) {
    return !!user && allowed.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

export const roleLabel: Record<Role, string> = {
  admin: "Administrator",
  petugas_penera: "Petugas Penera",
  pemilik_alat: "Pemilik Alat",
  kepala: "Kepala",
  staf: "Staf",
  pengawas: "Pengawas",
  pengamat_tera: "Pengamat Tera",
};
