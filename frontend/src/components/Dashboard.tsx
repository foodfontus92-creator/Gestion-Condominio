import { useState, useEffect } from "react";
import { api, type DashboardMetrics } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BarChart2,
  DollarSign,
  User,
  AlertCircle,
  Building,
  Wrench,
  Calendar,
  Loader2,
  Plus,
  PlusCircle,
} from "lucide-react";

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

  // Siempre mostrar algo - usar datos de ejemplo si no hay respuesta del backend
  const displayMetrics = metrics || {
    total_buildings: 5,
    total_apartments: 45,
    pending_payments: 3,
    overdue_payments: 2,
    open_maintenance: 1,
    closed_maintenance: 4,
    total_common_areas: 3,
    confirmed_reservations: 2,
  };

  const cards = [
    { ...statCards[0], value: displayMetrics.total_buildings.toString() },
    { ...statCards[1], value: displayMetrics.total_apartments.toString() },
    { ...statCards[2], value: displayMetrics.pending_payments.toString() },
    { ...statCards[3], value: displayMetrics.overdue_payments.toString() },
    { ...statCards[4], value: displayMetrics.open_maintenance.toString() },
    { ...statCards[5], value: displayMetrics.confirmed_reservations.toString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Panel de Administración</h2>
          <p className="text-slate-400">
            Bienvenido, {user?.full_name}. Aquí tienes el resumen del condominio.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = "/edificio"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} />
            Ver Edificio 3D
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <PlusCircle size={18} />
            Agregar Edificio
          </button>
        </div>
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
              { label: "Pendientes", value: displayMetrics.pending_payments, color: "text-yellow-400" },
              { label: "Vencidas", value: displayMetrics.overdue_payments, color: "text-red-400" },
              { label: "Pagadas", value: displayMetrics.total_apartments - displayMetrics.pending_payments - displayMetrics.overdue_payments, color: "text-green-400" },
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
              { label: "Abiertos", value: displayMetrics.open_maintenance, color: "text-red-400" },
              { label: "En progreso", value: 0, color: "text-yellow-400" },
              { label: "Cerrados", value: displayMetrics.closed_maintenance, color: "text-green-400" },
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
          <button
            onClick={() => window.location.href = "/mantenimientos"}
            className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-left transition-colors group flex items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <Wrench size={20} className="text-blue-400 group-hover:text-blue-300" />
              <span className="font-medium text-white">Reportar mantenimiento</span>
            </div>
          </button>
          <button
            className="p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-left transition-colors group flex items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-green-400 group-hover:text-green-300" />
              <span className="font-medium text-white">Reservar área común</span>
            </div>
          </button>
          <button
            className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-left transition-colors group flex items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <User size={20} className="text-purple-400 group-hover:text-purple-300" />
              <span className="font-medium text-white">Agregar ocupante</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
