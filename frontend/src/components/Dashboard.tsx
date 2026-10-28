import { useState, useEffect } from "react";
import { api, type DashboardMetrics } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BarChart2, DollarSign, User, AlertCircle, Building, Wrench, Calendar, Loader2 } from "lucide-react";

const statCards = [
  { label: "Edificios", icon: Building, value: "0", color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Departamentos", icon: User, value: "0", color: "text-green-400", bg: "bg-green-500/10" },
  { label: "Expensas Pendientes", icon: DollarSign, value: "0", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { label: "Expensas Vencidas", icon: AlertCircle, value: "0", color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Mantenimientos Abiertos", icon: Wrench, value: "0", color: "text-orange-400", bg: "bg-orange-500/10" },
  { label: "Reservas Confirmadas", icon: Calendar, value: "0", color: "text-purple-400", bg: "bg-purple-500/10" },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    api.getMetrics()
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // Estado de carga visual - nunca se ve en blanco
  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
        <p className="mt-4 text-slate-400">Cargando panel de administración...</p>
      </div>
    );
  }

  const cards = [
    { ...statCards[0], value: metrics?.total_buildings?.toString() || "0" },
    { ...statCards[1], value: metrics?.total_apartments?.toString() || "0" },
    { ...statCards[2], value: metrics?.pending_payments?.toString() || "0" },
    { ...statCards[3], value: metrics?.overdue_payments?.toString() || "0" },
    { ...statCards[4], value: metrics?.open_maintenance?.toString() || "0" },
    { ...statCards[5], value: metrics?.confirmed_reservations?.toString() || "0" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Panel de Administración</h2>
        <p className="text-slate-400">
          Bienvenido, {user?.full_name}. Aquí tienes el resumen del condominio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`p-5 rounded-xl border border-slate-700 ${card.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-700/50">
                <card.icon size={24} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-bold text-white mb-4">Estado de Pagos</h3>
          <div className="space-y-3">
            {[
              { label: "Pendientes", value: metrics?.pending_payments || 0, color: "text-yellow-400" },
              { label: "Vencidas", value: metrics?.overdue_payments || 0, color: "text-red-400" },
              { label: "Pagadas", value: metrics?.total_apartments - (metrics?.pending_payments || 0) - (metrics?.overdue_payments || 0), color: "text-green-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-bold text-white mb-4">Mantenimientos</h3>
          <div className="space-y-3">
            {[
              { label: "Abiertos", value: metrics?.open_maintenance || 0, color: "text-red-400" },
              { label: "En progreso", value: 0, color: "text-yellow-400" },
              { label: "Cerrados", value: metrics?.closed_maintenance || 0, color: "text-green-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
        <h3 className="text-lg font-bold text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-left transition-colors group">
            <div className="flex items-center gap-3">
              <Wrench size={24} className="text-blue-400 group-hover:text-blue-300" />
              <span className="font-medium text-white">Reportar mantenimiento</span>
            </div>
          </button>
          <button className="p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-left transition-colors group">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-green-400 group-hover:text-green-300" />
              <span className="font-medium text-white">Reservar área común</span>
            </div>
          </button>
          <button className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-left transition-colors group">
            <div className="flex items-center gap-3">
              <Building size={24} className="text-blue-400 group-hover:text-blue-300" />
              <span className="font-medium text-white">Ver edificio 3D</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
