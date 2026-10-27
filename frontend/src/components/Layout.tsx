import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  Home,
  LogOut,
  ShieldAlert,
  BarChart3,
  Calendar,
  Menu,
  X,
} from "lucide-react";

const IconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Building2,
  Users,
  CreditCard,
  Wrench,
  Home,
  LogOut,
  ShieldAlert,
  BarChart3,
  Calendar,
};

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "BarChart3", roles: ["admin"] as const },
  { path: "/edificio", label: "Edificio 3D", icon: "Building2", roles: ["admin", "portero", "residente"] as const },
  { path: "/mantenimientos", label: "Mantenimientos", icon: "Wrench", roles: ["admin", "portero", "residente"] as const },
  { path: "/areas-comunes", label: "Áreas Comunes", icon: "Calendar", roles: ["admin", "portero", "residente"] as const },
  { path: "/usuarios", label: "Usuarios", icon: "ShieldAlert", roles: ["admin"] as const },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const filteredNav = navItems.filter((item) => hasAnyRole(item.roles));
  const IconComponent = (iconName: string) => IconMap[iconName] || Building2;

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 size={24} className="text-blue-500" />
            <span>Condominio 3D</span>
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => {
            const Comp = IconComponent(item.icon);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-slate-700 hover:text-blue-300"
              >
                <Comp size={20} className="text-slate-400" />
                {item.label}
              </button>
            );
          })}
          <div className="mt-8 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-3 px-2">{user?.role}</p>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={20} /> Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-white">
              {filteredNav.find((n) => n.path === window.location.pathname)?.label || "Condominio"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden md:block">
              {user?.full_name} ({user?.role})
            </span>
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
