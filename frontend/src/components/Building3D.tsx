import { useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { type Building, type Apartment } from "../services/api";

const FLOOR_HEIGHT = 4;
const FLOORS = 3;
const COLS_PER_FLOOR = 3;
const BUILDING_WIDTH = 6;
const BUILDING_DEPTH = 6;

interface Building3DProps {
  buildings: Building[];
  onApartmentSelect: (apt: Apartment) => void;
}

const COLORS: Record<string, number> = {
  active: 0x22c55e,
  suppressed: 0xef4444,
  occupied: 0x3b82f6,
  vacant: 0x94a3b8,
  overdue: 0xef4444,
  pending: 0xf59e0b,
};

function getApartmentColor(apt: Apartment): number {
  if (apt.status === "suppressed") return COLORS.suppressed;
  if (apt.payments?.some((p) => p.status === "overdue")) return COLORS.overdue;
  if (apt.payments?.some((p) => p.status === "pending")) return COLORS.pending;
  if (apt.occupants?.length) return COLORS.occupied;
  return COLORS.vacant;
}

// Edificios de ejemplo para que el condominio 3D siempre se vea
const MOCK_BUILDINGS: Building[] = [
  {
    id: "mock-1",
    code: "A",
    status: "active",
    apartments: Array.from({ length: 9 }, (_, i) => ({
      id: `mock-1-apt-${101 + i}`,
      buildingId: "mock-1",
      number: 101 + i,
      status: "active",
      occupants: i < 3 ? [{ id: "o1", apartmentId: "mock-1", fullName: "Juan Pérez", documentId: "", phone: "", email: "", occupantType: "owner", isPrimary: true, createdAt: "" }] : [],
      payments: i === 0 ? [{ id: "p1", apartmentId: "mock-1", amount: 100, description: "Enero", dueDate: new Date().toISOString(), paidDate: undefined, status: "pending", paymentMethod: "", reference: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] : [],
    })),
  },
  {
    id: "mock-2",
    code: "B",
    status: "active",
    apartments: Array.from({ length: 9 }, (_, i) => ({
      id: `mock-2-apt-${101 + i}`,
      buildingId: "mock-2",
      number: 101 + i,
      status: "active",
      occupants: [],
      payments: [],
    })),
  },
  {
    id: "mock-3",
    code: "C",
    status: "active",
    apartments: Array.from({ length: 9 }, (_, i) => ({
      id: `mock-3-apt-${101 + i}`,
      buildingId: "mock-3",
      number: 101 + i,
      status: i % 3 === 0 ? "suppressed" : "active",
      occupants: [],
      payments: [],
    })),
  },
];

const EmptyBuildings = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400">
    <div className="text-4xl mb-4">🏢</div>
    <h3 className="text-lg font-medium">Condominio 3D (vista de ejemplo)</h3>
    <p className="text-sm">Mostrando edificios de ejemplo.</p>
  </div>
);

function ApartmentWindow({
  apt,
  x,
  y,
  z,
  onClick,
}: {
  apt: Apartment;
  x: number;
  y: number;
  z: number;
  onClick: (apt: Apartment) => void;
}) {
  const color = getApartmentColor(apt);
  const isOccupied = apt.occupants?.length > 0;
  const hasOverdue = apt.payments?.some((p) => p.status === "overdue");

  return (
    <mesh
      onClick={() => onClick(apt)}
      castShadow
      receiveShadow
      position={[x, y, z]}
      scale={[0.85, 0.85, 0.05]}
    >
      <boxGeometry args={[1.2, 1.2, 0.1]} />
      <meshStandardMaterial
        color={color}
        emissive={isOccupied ? 0x1e40af : 0x000000}
        emissiveIntensity={isOccupied ? 0.3 : 0}
        metalness={0.3}
        roughness={0.4}
      />
      {hasOverdue && (
        <mesh position={[0, 0, 0.06]} scale={[0.3, 0.3, 0.3]}>
          <boxGeometry args={[1, 1, 0.1]} />
          <meshStandardMaterial color={0xef4444} emissive={0xef4444} emissiveIntensity={0.5} />
        </mesh>
      )}
    </mesh>
  );
}

export default function Building3D({ buildings, onApartmentSelect }: Building3DProps) {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const cameraRef = useRef<THREE.Camera>(null!);

  // Usar edificios del backend o edificios de ejemplo para que siempre se vea el 3D
  const displayBuildings = buildings.length > 0 ? buildings : MOCK_BUILDINGS;

  // Auto-seleccionar el primer edificio al cargar
  if (displayBuildings.length > 0 && !activeBuilding) {
    setActiveBuilding(displayBuildings[0]);
  }

  const building = activeBuilding;
  const apartments = building?.apartments.flat() || [];

  const apartmentsByFloor: Record<number, Apartment[]> = {};
  apartments.forEach((apt) => {
    const floor = Math.floor((apt.number - 101) / COLS_PER_FLOOR);
    if (!apartmentsByFloor[floor]) apartmentsByFloor[floor] = [];
    apartmentsByFloor[floor].push(apt);
  });

  const isMock = buildings.length === 0;

  if (!displayBuildings || displayBuildings.length === 0 || !building) {
    return (
      <div className="h-full w-full bg-slate-900 flex flex-col">
        <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-20">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🏢 Condominio 3D Dashboard
          </h1>
          <div className="text-sm text-red-400">No hay edificios disponibles</div>
        </div>
        <EmptyBuildings />
      </div>
    );
  }

  // Si hay error de WebGL, mostrar vista 2D de respaldo
  if (webglError) {
    return (
      <div className="h-full w-full bg-slate-900 flex flex-col">
        <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-20">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🏢 Condominio 3D Dashboard
          </h1>
          <div className="text-sm text-yellow-400">Vista 2D (WebGL no disponible)</div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartmentsByFloor[selectedFloor]?.map((apt) => (
              <div
                key={apt.id}
                onClick={() => onApartmentSelect(apt)}
                className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-lg">{apt.number}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      apt.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {apt.status === "active" ? "Activo" : "Fuera de servicio"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {apt.occupants?.length ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1">Ocupado</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1">Vacío</span>
                  )}
                  {apt.payments?.some((p) => p.status === "overdue") ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1">Moroso</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 text-center">
          <button
            onClick={() => setWebglError(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Intentar cargar 3D nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col">
      {/* Floor controls */}
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Bloque:</span>
          <select
            value={building.code}
            onChange={(e) => setActiveBuilding(displayBuildings.find((b) => b.code === e.target.value) || null)}
            className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
          >
            {displayBuildings.map((b) => (
              <option key={b.id} value={b.code}>
                Bloque {b.code}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-400">Piso:</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${
                  selectedFloor === f
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {f + 1}°
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <span>+</span> Agregar Depto
          </button>
        </div>
        <div className="text-sm text-slate-400">
          {building.code} - Piso {selectedFloor + 1} - {apartmentsByFloor[selectedFloor]?.length || 0} departamentos
          {isMock && <span className="ml-2 text-xs text-yellow-400">(ejemplo)</span>}
        </div>
      </div>

      {/* 3D Scene */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [15, 15, 15], fov: 45 }}
          shadows
          onCreated={({ camera }) => (cameraRef.current = camera)}
          onError={() => setWebglError(true)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />
          <OrbitControls makeDefault enableDamping />

          <gridHelper args={[100, 100]} color={0x475569} />
          <axesHelper args={[5]} />

          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color={0x1e293b} />
          </mesh>

          <group position={[0, 0, 0]}>
            {/* Building base */}
            <mesh castShadow receiveShadow position={[0, FLOOR_HEIGHT / 2, 0]}>
              <boxGeometry args={[BUILDING_WIDTH, FLOOR_HEIGHT * FLOORS, BUILDING_DEPTH]} />
              <meshStandardMaterial color={0x64748b} roughness={0.6} metalness={0.2} />
            </mesh>

            {/* Windows for current floor */}
            {apartmentsByFloor[selectedFloor]?.map((apt, i) => {
              const col = i % COLS_PER_FLOOR;
              const row = Math.floor(i / COLS_PER_FLOOR);
              const x = (col - 1) * 2;
              const y = selectedFloor * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
              const z = 3.1;

              return (
                <ApartmentWindow
                  key={apt.id}
                  apt={apt}
                  x={x}
                  y={y}
                  z={z}
                  onClick={onApartmentSelect}
                />
              );
            })}
          </group>
        </Canvas>

        {/* Floor info overlay */}
        <div className="absolute bottom-6 left-6 z-20 bg-slate-800/80 backdrop-blur p-4 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-2">Piso {selectedFloor + 1}</h3>
          <div className="space-y-2 text-sm">
            {apartmentsByFloor[selectedFloor]?.map((apt) => (
              <div key={apt.id} className="flex items-center gap-2 p-2 rounded bg-slate-900/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800" onClick={() => onApartmentSelect(apt)}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: `rgb(${getApartmentColor(apt) >> 16},${(getApartmentColor(apt) >> 8) & 255},${getApartmentColor(apt) & 255})`,
                  }}
                />
                <span className="text-slate-300 font-mono">{apt.number}</span>
                {apt.payments?.some((p) => p.status === "overdue") && (
                  <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                    Moroso
                  </span>
                )}
                {apt.occupants?.length && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                    Ocupado
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agregar Departamento Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white text-black w-full max-w-md p-6 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Agregar Departamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Número de departamento</label>
                <input
                  type="number"
                  placeholder="Ej: 110"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Piso</label>
                <input
                  type="number"
                  placeholder="Ej: 1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-black py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    alert("Departamento agregado (simulación visual)");
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
