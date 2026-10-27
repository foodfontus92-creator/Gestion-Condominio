interface BuildingControlsProps {
  buildings: { id: string; code: string }[];
  onAdd: () => void;
  onSuppress: (buildingId: string) => void;
}

export default function BuildingControls({
  buildings,
  onAdd,
  onSuppress,
}: BuildingControlsProps) {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2">
      <button
        onClick={onAdd}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2"
      >
        ➕ Agregar bloque
      </button>
      <select
        onChange={(e) => {
          const id = e.target.value;
          if (id) onSuppress(id);
        }}
        className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600"
      >
        <option value="">Suprimir bloque...</option>
        {buildings.map((b) => (
          <option key={b.id} value={b.id}>
            Bloque {b.code}
          </option>
        ))}
      </select>
    </div>
  );
}
