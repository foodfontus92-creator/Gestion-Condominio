import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart2,
  DollarSign,
  User,
  AlertCircle,
  Building,
  Wrench,
  Calendar,
  Plus,
  PlusCircle,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { isAuthenticated, user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Mantenimiento de ascensor", building: "Bloque A", date: "2026-10-28", type: "maintenance" },
    { id: 2, title: "Reunión de propietarios", building: "Todos", date: "2026-10-30", type: "meeting" },
  ]);

  if (!isAuthenticated) return null;

  const cards = [
    { label: "Edificios", value: "5", color: "text-blue-400", bg: "bg-blue-500/10", icon: Building },
    { label: "Departamentos", value: "45", color: "text-green-400", bg: "bg-green-500/10", icon: User },
    { label: "Expensas Pendientes", value: "3", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: DollarSign },
    { label: "Expensas Vencidas", value: "2", color: "text-red-400", bg: "bg-red-500/10", icon: AlertCircle },
    { label: "Mantenimientos Abiertos", value: "1", color: "text-orange-400", bg: "bg-orange-500/10", icon: Wrench },
    { label: "Reservas Confirmadas", value: "2", color: "text-purple-400", bg: "bg-purple-500/10", icon: Calendar },
  ];

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const notificationBadgeColor = (type: string) => {
    return type === "maintenance" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700";
  };

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
            onClick={() => navigate("/edificio")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} />
            Ver Edificio 3D
          </button>
          {hasRole("admin") && (
            <button
              onClick={() => setShowNotificationModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Bell size={18} />
              Enviar Notificación
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border border-slate-700 ${card.bg} cursor-pointer hover:bg-slate-800/30 transition-colors`}
            onClick={() => {
              const map: Record<string, string> = {
                Edificios: "/edificio",
                Departamentos: "/edificio",
                "Expensas Pendientes": "/mantenimientos",
                "Expensas Vencidas": "/mantenimientos",
                "Mantenimientos Abiertos": "/mantenimientos",
                "Reservas Confirmadas": "/areas-comunes",
              };
              navigateTo(map[card.label] || "/dashboard");
            }}
          >
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
              { label: "Pendientes", value: "3", color: "text-yellow-400" },
              { label: "Vencidas", value: "2", color: "text-red-400" },
              { label: "Pagadas", value: "40", color: "text-green-400" },
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
              { label: "Abiertos", value: "1", color: "text-red-400" },
              { label: "En progreso", value: "0", color: "text-yellow-400" },
              { label: "Cerrados", value: "4", color: "text-green-400" },
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
            onClick={() => navigate("/mantenimientos")}
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

      {hasRole("admin") && (
        <div className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-purple-400" />
              <h3 className="text-lg font-bold text-white">Notificaciones a Bloques</h3>
            </div>
            <button
              onClick={() => setShowNotificationModal(true)}
              className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded"
            >
              + Nueva
            </button>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="text-xs text-slate-400">{n.building} · {n.date}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${notificationBadgeColor(n.type)}`}>
                  {n.type === "maintenance" ? "Mantenimiento" : "Reunión"}
                </span>
              </div>
            ))}
          </div>
          {notifications.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay notificaciones pendientes.</p>
          )}
        </div>
      )}

      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNotificationModal(false)}>
          <div className="bg-white text-black w-full max-w-md p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Enviar Notificación a Bloques</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input type="text" placeholder="Ej: Reunión de propietarios" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bloques</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option>Todos los bloques</option>
                  <option>Bloque A</option>
                  <option>Bloque B</option>
                  <option>Bloque C</option>
                  <option>Bloque D</option>
                  <option>Bloque E</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNotificationModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-2 rounded-lg font-medium">
                  Cancelar
                </button>
                <button onClick={() => { setShowNotificationModal(false); alert("Notificación enviada (simulación visual)") }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium">
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
