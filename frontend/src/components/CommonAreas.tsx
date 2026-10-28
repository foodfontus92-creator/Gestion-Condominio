import { useState, useEffect } from "react";
import { api, type CommonArea, type Reservation } from "../services/api";
import { Calendar, Plus, Building2, CheckCircle2, Clock } from "lucide-react";

export default function CommonAreas() {
  const [areas, setAreas] = useState<CommonArea[]>([
    { id: "1", name: "Quincho", description: "Área de parrilla con mesas y sillas", capacity: 20, location: "Planta baja", imageUrl: "", isActive: true, createdAt: "" },
    { id: "2", name: "Gimnasio", description: "Equipos de cardio y pesas", capacity: 10, location: "Planta baja", imageUrl: "", isActive: true, createdAt: "" },
    { id: "3", name: "Salón de Eventos", description: "Salón cerrado con cocina", capacity: 50, location: "Segundo piso", imageUrl: "", isActive: true, createdAt: "" },
  ]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  const [formData, setFormData] = useState({ commonAreaId: "", startTime: "", endTime: "", purpose: "" });
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [areasData, reservationsData] = await Promise.all([
        api.getCommonAreas(true),
        api.getReservations(),
      ]);
      setAreas(areasData);
      setReservations(reservationsData);
      setApiError(null);
    } catch (err) {
      setApiError("No se pudo conectar al servidor. Mostrando datos de ejemplo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenForm(false);
    try {
      await api.createReservation({
        commonAreaId: formData.commonAreaId,
        userId: "", // Se obtendría del usuario autenticado
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
      });
      await loadData();
      setFormData({ commonAreaId: "", startTime: "", endTime: "", purpose: "" });
      setSelectedArea(null);
      alert("Reserva creada exitosamente");
    } catch (err) {
      alert("Error al crear reserva. Verifique los datos.");
    }
  };

  const areaReservations = (areaId: string) =>
    reservations.filter((r) => r.commonAreaId === areaId && r.status !== "cancelled");

  const isAvailable = (areaId: string, start: string, end: string) => {
    const areaRes = areaReservations(areaId);
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return !areaRes.some((r) => {
      const rStart = new Date(r.startTime).getTime();
      const rEnd = new Date(r.endTime).getTime();
      return startTime < rEnd && endTime > rStart;
    });
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Cargando áreas comunes...</div>;

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50/50">
          <p className="text-sm text-yellow-800">{apiError}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Áreas Comunes y Reservas</h2>
        <button
          onClick={() => setOpenForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          <Plus size={18} /> Nueva área
        </button>
      </div>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpenForm(false)}>
          <div className="bg-white text-black w-full max-w-md p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Registrar Área Común</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Nombre</label>
                <input className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Capacidad</label>
                <input type="number" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Ubicación</label>
                <input className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpenForm(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => {
          const res = areaReservations(area.id);
          return (
            <div key={area.id} className="bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={24} className="text-blue-500" />
                  <h3 className="font-bold text-white">{area.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${area.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {area.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{area.description || "Sin descripción"}</p>
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Capacidad:</span>
                  <span className="font-mono">{area.capacity} personas</span>
                </div>
                <div className="flex justify-between">
                  <span>Ubicación:</span>
                  <span>{area.location || "—"}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Reservas próximas</h4>
                {res.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin reservas</p>
                ) : (
                  <div className="space-y-2">
                    {res.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                        <div className="flex-1">
                          <p className="text-sm text-gray-200">{r.purpose || "Reserva"}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(r.startTime).toLocaleDateString("es-ES")} {new Date(r.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${r.status === "confirmed" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedArea?.id === area.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3">Reservar ahora</h4>
                  <form onSubmit={handleReserve} className="space-y-3">
                    <input
                      type="hidden"
                      value={area.id}
                      onChange={(e) => setFormData({ ...formData, commonAreaId: e.target.value })}
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Fecha y hora inicio</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Fecha y hora fin</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Propósito</label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!isAvailable(area.id, formData.startTime, formData.endTime)}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        !isAvailable(area.id, formData.startTime, formData.endTime)
                          ? "bg-gray-500 text-gray-300"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      Reservar
                    </button>
                    {!isAvailable(area.id, formData.startTime, formData.endTime) && (
                      <p className="text-xs text-red-500 mt-1">Horario no disponible</p>
                    )}
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
