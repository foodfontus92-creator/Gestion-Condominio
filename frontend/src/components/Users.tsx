import { useState, useEffect } from "react";
import { api, type User } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { require_role } from "../services/api";
import { ShieldAlert, User as UserIcon, Building2 } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  if (!hasRole("admin")) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white">Acceso denegado</h2>
          <p className="text-slate-400">Solo administradores pueden ver esta página</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    api.getBuildings().then(() => {}); // placeholder
    // TODO: implement list users endpoint
    setLoading(false);
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400">Cargando usuarios...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <p className="text-slate-400">Funcionalidad de gestión de usuarios en desarrollo.</p>
      </div>
    </div>
  );
}
