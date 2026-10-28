import { useState, useEffect } from "react";
import { api, type MaintenanceRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Wrench, Plus, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "medium" as const, apartmentId: "" });
  const { user } = useAuth();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getOpenMaintenance();
      setRequests(data);
    } catch (err) {
      console.error("Error loading maintenance:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenForm(false);
    try {
      await api.createMaintenance({
        ...formData,
        apartmentId: formData.apartmentId,
        reportedById: user?.id || "",
      });
      await loadRequests();
      setFormData({ title: "", description: "", priority: "medium", apartmentId: "" });
    } catch (err) {
      alert("Error al crear reporte de mantenimiento");
    }
  };

  const statusLabels: Record<string, string> = {
    open: "Abierto",
    in_progress: "En progreso",
    closed: "Cerrado",
  };

  const statusColors: Record<string, string> = {
    open: "bg-red-100 text-red-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    closed: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Mantenimientos e Incidencias</h2>
        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          <Plus size={18} /> Nuevo reporte
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando mantenimientos...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-500 mb-4">
            <CheckCircle2 size={48} className="mx-auto opacity-50" />
          </div>
          <p className="text-sm">No hay mantenimientos abiertos</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white/5 rounded-xl border border-white/10">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-gray-300">Título</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-300">Departamento</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-300">Prioridad</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-300">Estado</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-300">Reportado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-gray-600">{r.apartmentId.slice(0, 6)}...</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${r.priority === "urgent" ? "bg-red-100 text-red-700" : r.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(r.reportedAt).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpenForm(false)}>
          <div className="bg-white text-black w-full max-w-md p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nuevo Reporte de Mantenimiento</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID del Departamento</label>
                <input
                  type="text"
                  required
                  value={formData.apartmentId}
                  onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="UUID del departamento"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpenForm(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                  Crear reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
