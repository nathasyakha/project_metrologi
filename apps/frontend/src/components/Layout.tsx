import { NavLink, Outlet, Link } from "react-router-dom";
import { Scale, LayoutDashboard, BookOpen, ClipboardCheck, ShieldCheck, Trash2, LogOut } from "lucide-react";
import { useAuth, roleLabel } from "@/lib/auth";
import { cn } from "@/lib/utils";

const baseNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dokumen-mutu", label: "Dokumen Mutu", icon: BookOpen },
  { to: "/peneraan", label: "Peneraan", icon: ClipboardCheck },
  { to: "/pengawasan", label: "Pengawasan", icon: ShieldCheck },
];

export function Layout() {
  const { user, logout } = useAuth();

  const nav = user?.role === "admin"
    ? [...baseNav, { to: "/sampah", label: "Sampah", icon: Trash2 }]
    : baseNav;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col bg-navy-950 text-slate-200">
        <div className="flex items-center gap-3 px-6 py-6">
          <Scale className="h-7 w-7 text-brass-400" strokeWidth={1.75} />
          <div>
            <p className="font-semibold leading-tight text-white">Metrologi Legal</p>
            <p className="text-xs text-slate-400">Sistem Administrasi Terintegrasi</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-navy-800 text-white" : "text-slate-300 hover:bg-navy-900 hover:text-white"
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-navy-800 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-navy-900 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-8">
          <Link to="/profile" className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.name ?? user?.email}</p>
              <p className="text-xs text-slate-500">{user ? roleLabel[user.role] : ""}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-navy-900">
              {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
          </Link>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
