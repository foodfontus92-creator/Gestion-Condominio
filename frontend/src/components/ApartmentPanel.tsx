import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Apartment, type Payment, type Occupant } from "../services/api";
import {
  X,
  User as UserIcon,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  ChevronRight,
  Plus,
} from "lucide-react";

interface ApartmentPanelProps {
  apartment: Apartment | null;
  onClose: () => void;
}

export default function ApartmentPanel({ apartment, onClose }: ApartmentPanelProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showAddOccupant, setShowAddOccupant] = useState(false);
  const [addOccupantForm, setAddOccupantForm] = useState({
    fullName: "",
    documentId: "",
    phone: "",
    email: "",
    occupantType: "owner",
    isPrimary: true,
  });
  const navigate = useNavigate();

  const markAsPaid = async (paymentId: string) => {
    setLoadingPayments(true);
    try {
      await api.markAsPaid(paymentId);
      const updated = await api.getPayments(apartment!.id);
      setPayments(updated);
    } catch (err) {
      alert("Error al marcar como pagado");
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (!apartment) return;
    setLoadingPayments(true);
    Promise.all([
      api.getPayments(apartment.id).catch(() => []),
      api.getOccupants(apartment.id).catch(() => []),
    ])
      .then(([p, o]) => {
        setPayments(p);
        setOccupants(o);
      })
      .finally(() => setLoadingPayments(false));
  }, [apartment]);

  if (!apartment) return null;

  const buildingDisplay = apartment.buildingId ? apartment.buildingId.slice(0, 8) + "..." : "N/A";

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const overduePayments = payments.filter((p) => p.status === "overdue");

  const handleAddOccupant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createOccupant({
        apartmentId: apartment.id,
        fullName: addOccupantForm.fullName,
        documentId: addOccupantForm.documentId || undefined,
        phone: addOccupantForm.phone || undefined,
        email: addOccupantForm.email || undefined,
        occupantType: addOccupantForm.occupantType,
        isPrimary: addOccupantForm.isPrimary,
      });
      setShowAddOccupant(false);
      setAddOccupantForm({ fullName: "", documentId: "", phone: "", email: "", occupantType: "owner", isPrimary: true });
      // Recargar ocupantes
      const updated = await api.getOccupants(apartment.id);
      setOccupants(updated);
    } catch (err) {
      alert("Error al crear ocupante");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white text-black w-full max-w-lg p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Departamento {apartment.number}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 uppercase">Bloque</p>
              <p className="font-mono font-bold">{apartment.buildingId ? apartment.buildingId.slice(0, 8) + "..." : "N/A"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 uppercase">Estado</p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  apartment.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {apartment.status === "active" ? "Activo" : "Fuera de servicio"}
              </span>
            </div>
          </div>

          {/* Occupants */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">Ocupantes</h3>
              <button
                onClick={() => setShowAddOccupant(true)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              >
                <Plus size={14} /> Agregar ocupante
              </button>
            </div>
            {occupants.length > 0 ? (
              <div className="space-y-2">
                {occupants.map((occ) => (
                  <div key={occ.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">{occ.fullName}</p>
                      <p className="text-xs text-gray-500">{occ.occupantType === "owner" ? "Propietario" : "Inquilino"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{occ.phone || "—"}</p>
                      <p className="text-xs text-gray-500">{occ.email || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin ocupantes asignados</p>
            )}
          </div>

          {/* Payments */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-800">Expensas</h3>
            </div>
            {loadingPayments ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : payments.length === 0 ? (
              <p className="text-sm text-gray-500">Sin expensas registradas</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => {
                  const isOverdue = p.status === "overdue";
                  const isPending = p.status === "pending";
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{p.description}</p>
                        <p className="text-xs text-gray-500">Vence: {new Date(p.dueDate).toLocaleDateString("es-ES")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          p.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : p.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {p.status === "paid" ? "Pagado" : p.status === "overdue" ? "Vencido" : "Pendiente"}
                        </span>
                        <span className="font-mono text-sm font-bold">${p.amount.toFixed(2)}</span>
                        {isPending && !isOverdue && (
                          <button
                            onClick={() => markAsPaid(p.id)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={loadingPayments}
                          >
                            {loadingPayments ? "..." : "Pagar"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => navigate(`/mantenimientos?apartment=${apartment.id}`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium"
            >
              Reportar mantenimiento
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Agregar Ocupante Modal */}
      {showAddOccupant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddOccupant(false)}>
          <div className="bg-white text-black w-full max-w-md p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Agregar Ocupante</h3>
            <form onSubmit={handleAddOccupant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={addOccupantForm.fullName}
                  onChange={(e) => setAddOccupantForm({ ...addOccupantForm, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Documento</label>
                  <input
                    type="text"
                    placeholder="DNI"
                    value={addOccupantForm.documentId}
                    onChange={(e) => setAddOccupantForm({ ...addOccupantForm, documentId: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={addOccupantForm.phone}
                    onChange={(e) => setAddOccupantForm({ ...addOccupantForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={addOccupantForm.email}
                  onChange={(e) => setAddOccupantForm({ ...addOccupantForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={addOccupantForm.isPrimary}
                  onChange={(e) => setAddOccupantForm({ ...addOccupantForm, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-black">Es propietario principal</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Tipo de ocupante</label>
                <select
                  value={addOccupantForm.occupantType}
                  onChange={(e) => setAddOccupantForm({ ...addOccupantForm, occupantType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="owner">Propietario</option>
                  <option value="tenant">Inquilino</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOccupant(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                >
                  Guardar ocupante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
