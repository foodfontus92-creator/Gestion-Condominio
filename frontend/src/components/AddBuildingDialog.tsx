interface AddBuildingDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (code: string) => void;
}

export default function AddBuildingDialog({
  open,
  onClose,
  onAdd,
}: AddBuildingDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-lg p-6 w-80 shadow-2xl">
        <h3 className="text-lg font-bold mb-4">Agregar nuevo bloque</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Código del bloque</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Ej: F"
            maxLength="2"
          />
        </div>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!code) {
                setError("El código es obligatorio");
                return;
              }
              onAdd(code);
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
