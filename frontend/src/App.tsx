import { useState, useEffect, useCallback } from "react";
import CondominiumScene from "./scene/CondominiumScene";
import ApartmentPanel from "./components/ApartmentPanel";
import AddBuildingDialog from "./components/AddBuildingDialog";
import BuildingControls from "./components/BuildingControls";
import { api, type Building, type Apartment } from "./services/api";

interface BuildingData {
  id: string;
  code: string;
  status: "active" | "suppressed";
  apartments: ApartmentData[];
}

interface ApartmentData {
  id: string;
  number: number;
  status: "active" | "suppressed";
  buildingId: string;
}

export default function App() {
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [selected, setSelected] = useState<ApartmentData | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [buildingsResp, apartmentsResp] = await Promise.all([
        api.getBuildings(),
        api.getApartments(),
      ]);

      // Merge apartments into buildings
      const merged: BuildingData[] = buildingsResp.map((b) => ({
        id: b.id,
        code: b.code,
        status: b.status,
        apartments: b.apartments.map((a) => ({
          id: a.id,
          number: a.number,
          status: a.status,
          buildingId: b.id,
        })),
      }));

      // Also add any apartments not yet in buildings (edge case)
      const aptMap = new Map(merged.flatMap((b) => b.apartments.map((a) => [a.id, a])));
      apartmentsResp.forEach((a) => {
        if (!aptMap.has(a.id)) {
          const b = merged.find((x) => x.id === a.building_id);
          if (b) b.apartments.push({ id: a.id, number: a.number, status: a.status, buildingId: a.building_id });
        }
      });

      setBuildings(merged);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
      // Fallback to mock data so the UI is still visible
      setBuildings([
        { id: "bldg-A", code: "A", status: "active", apartments: Array.from({ length: 9 }, (_, i) => ({ id: `A-${101 + i}`, number: 101 + i, status: "active", buildingId: "bldg-A" })) },
        { id: "bldg-B", code: "B", status: "active", apartments: Array.from({ length: 9 }, (_, i) => ({ id: `B-${101 + i}`, number: 101 + i, status: "active", buildingId: "bldg-B" })) },
        { id: "bldg-C", code: "C", status: "active", apartments: Array.from({ length: 9 }, (_, i) => ({ id: `C-${101 + i}`, number: 101 + i, status: "active", buildingId: "bldg-C" })) },
        { id: "bldg-D", code: "D", status: "active", apartments: Array.from({ length: 9 }, (_, i) => ({ id: `D-${101 + i}`, number: 101 + i, status: "active", buildingId: "bldg-D" })) },
        { id: "bldg-E", code: "E", status: "active", apartments: Array.from({ length: 9 }, (_, i) => ({ id: `E-${101 + i}`, number: 101 + i, status: "active", buildingId: "bldg-E" })) },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const findApartment = useCallback(
    (id: string, number: number) =>
      buildings.flatMap((b) => b.apartments.find((a) => a.id === id && a.number === number))[0] ??
      null,
    [buildings]
  );

  const handleAddBuilding = useCallback(async (code: string) => {
    try {
      const created = await api.createBuilding(code);
      setBuildings((prev) => [
        ...prev,
        {
          id: created.id,
          code: created.code,
          status: created.status,
          apartments: [],
        },
      });
      setAddOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creando bloque");
    }
  }, []);

  const handleSuppressBuilding = useCallback(async (buildingId: string) => {
    try {
      await api.suppressBuilding(buildingId);
      setBuildings((prev) =>
        prev.map((b) => (b.id === buildingId ? { ...b, status: "suppressed" } : b))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error suprimiendo bloque");
    }
  }, []);

  const handleSuppressApartment = useCallback(async (aptId: string) => {
    try {
      await api.suppressApartment(aptId);
      setBuildings((prev) =>
        prev.map((b) => ({
          ...b,
          apartments: b.apartments.map((a) =>
            a.id === aptId ? { ...a, status: "suppressed" } : a
          ),
        }))
      );
      setSelected(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error suprimiendo departamento");
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Cargando condominio...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col">
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold">Condominio 3D Dashboard</h1>
        <div className="flex items-center gap-4">
          {error && (
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
              ⚠️ {error} (modo demo)
            </span>
          )}
          <span className="text-sm text-slate-400">
            {buildings.length} bloques × 9 departamentos
          </span>
        </div>
      </header>
      <main className="flex-1 relative">
        <CondominiumScene
          buildings={buildings}
          selectedApartmentId={selected?.id ?? null}
          onApartmentClick={(id, number) => setSelected(findApartment(id, number))}
        />
        <BuildingControls
          buildings={buildings}
          onAdd={() => setAddOpen(true)}
          onSuppress={handleSuppressBuilding}
        />
      </main>
      {selected && (
        <ApartmentPanel
          apartment={selected}
          onClose={() => setSelected(null)}
          onSuppress={() => handleSuppressApartment(selected.id)}
        />
      )}
      <AddBuildingDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddBuilding}
      />
    </div>
  );
}
