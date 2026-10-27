import { useState, useCallback } from "react";
import CondominiumScene from "./scene/CondominiumScene";
import ApartmentPanel from "./components/ApartmentPanel";
import AddBuildingDialog from "./components/AddBuildingDialog";
import BuildingControls from "./components/BuildingControls";

interface ApartmentData {
  id: string;
  number: number;
  status: "active" | "suppressed";
  buildingId: string;
}

interface BuildingData {
  id: string;
  code: string;
  status: "active" | "suppressed";
  apartments: ApartmentData[];
}

const makeApartments = (count = 9): ApartmentData[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `apt-${crypto.randomUUID()}`,
    number: 101 + i,
    status: "active",
    buildingId: "",
  }));

const MOCK_BUILDINGS: BuildingData[] = ["A", "B", "C", "D", "E"].map((code, i) => ({
  id: `bldg-${code}`,
  code,
  status: "active",
  apartments: makeApartments().map((a) => ({ ...a, buildingId: `bldg-${code}` })),
}));

export default function App() {
  const [buildings, setBuildings] = useState<BuildingData[]>(MOCK_BUILDINGS);
  const [selected, setSelected] = useState<ApartmentData | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const findApartment = useCallback(
    (id: string, number: number) =>
      buildings.flatMap((b) => b.apartments.find((a) => a.id === id && a.number === number))[0] ??
      null,
    [buildings]
  );

  const handleAddBuilding = useCallback((code: string) => {
    if (buildings.some((b) => b.code === code)) return;
    setBuildings((prev) => [
      ...prev,
      {
        id: `bldg-${code}`,
        code,
        status: "active",
        apartments: makeApartments().map((a) => ({ ...a, buildingId: `bldg-${code}` })),
      },
    ]);
  }, [buildings]);

  const handleSuppressBuilding = useCallback((buildingId: string) => {
    setBuildings((prev) =>
      prev.map((b) =>
        b.id === buildingId ? { ...b, status: "suppressed" } : b
      )
    );
  }, []);

  const handleSuppressApartment = useCallback((aptId: string) => {
    setBuildings((prev) =>
      prev.map((b) => ({
        ...b,
        apartments: b.apartments.map((a) =>
          a.id === aptId ? { ...a, status: "suppressed" } : a
        ),
      }))
    );
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col">
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold">Condominio 3D Dashboard</h1>
        <div className="text-sm text-slate-400">
          {buildings.length} bloques × 9 departamentos
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
          onSuppress={() => {
            handleSuppressApartment(selected.id);
            setSelected(null);
          }}
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
