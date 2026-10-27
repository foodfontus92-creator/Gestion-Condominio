interface ApartmentPanelProps {
  apartment: { id: string; number: number; status: string; buildingId: string } | null;
  onClose: () => void;
  onSuppress?: () => void;
}

export default function ApartmentPanel({
  apartment,
  onClose,
  onSuppress,
}: ApartmentPanelProps) {
  if (!apartment) return null;

  return (
    <div className="fixed top-1/2 left-0 h-1/2 w-80 bg-white text-black shadow-2xl transform translate-y-[-50%] z-50 flex flex-col p-6 border-r border-gray-300">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-lg font-bold">Departamento</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Número:</span>
          <span className="font-mono font-bold">{apartment.number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Bloque:</span>
          <span className="font-mono font-bold">{apartment.buildingId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estado:</span>
          <span
            className={`px-2 py-1 rounded text-sm font-bold ${
              apartment.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {apartment.status === "active" ? "Activo" : "Fuera de servicio"}
          </span>
        </div>
        <div className="mt-6 flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            Editar
          </button>
          {apartment.status === "active" && onSuppress ? (
            <button
              onClick={onSuppress}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
              Suprimir
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-400 text-white py-2 rounded cursor-not-allowed"
            >
              Ya suprimido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
