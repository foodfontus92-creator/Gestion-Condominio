import * as THREE from "three";
import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

const BUILDING_COLOR_ACTIVE = 0x4ade80; // green
const BUILDING_COLOR_SUPPRESSED = 0xef4444; // red
const APARTMENT_COLOR_ACTIVE = 0x22c55e;
const APARTMENT_COLOR_SUPPRESSED = 0xdc2626;

interface BuildingData {
  id: string;
  code: string;
  status: "active" | "suppressed";
  apartments: { id: string; number: number; status: "active" | "suppressed" }[];
}

export interface BuildingProps {
  building: BuildingData;
  index: number;
  onApartmentClick: (aptId: string, aptNumber: number) => void;
  selectedApartmentId: string | null;
}

function Building({ building, index, onApartmentClick, selectedApartmentId }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const spacing = 8;
  const x = (index - 2) * spacing;

  // ----- Building block -----
  const buildingColor =
    building.status === "suppressed" ? BUILDING_COLOR_SUPPRESSED : BUILDING_COLOR_ACTIVE;

  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      {/* Building volume */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 15, 5]} position={[0, 7.5, 0]} />
        <meshStandardMaterial color={buildingColor} />
      </mesh>
      {/* Label */}
      <Text color="white" fontSize={1} anchor="center" position={[0, 15.5, 0]}>
        Bloque {building.code}
      </Text>

      {/* Apartments (3 per floor x 3 floors = 9) */}
      {building.apartments.map((apt) => {
        const floor = Math.floor((apt.number - 1) % 9 / 3);
        const col = (apt.number - 1) % 3;
        const y = 1 + floor * 3;
        const z = -1 + col * 1;
        const aptColor =
          apt.status === "suppressed"
            ? APARTMENT_COLOR_SUPPRESSED
            : APARTMENT_COLOR_ACTIVE;
        const isSelected = selectedApartmentId === apt.id;

        return (
          <mesh
            key={apt.id}
            castShadow
            receiveShadow
            onClick={() => onApartmentClick(apt.id, apt.number)}
            position={[z, y, 2.6]}
            scale={isSelected ? [1.1, 1.1, 1.1] : [1, 1, 1]}
          >
            <boxGeometry args={[0.75, 2, 0.75]} />
            <meshStandardMaterial color={aptColor} emissive={isSelected ? 0xffffff : 0x000000} />
            <Text
              color="white"
              fontSize={0.5}
              anchor="center"
              position={[0, 0, 0.4]}
            >
              {apt.number}
            </Text>
          </mesh>
        );
      })}
    </group>
  );
}

export default function CondominiumScene({
  buildings,
  selectedApartmentId,
  onApartmentClick,
}: {
  buildings: BuildingData[];
  selectedApartmentId: string | null;
  onApartmentClick: (id: string, number: number) => void;
}) {
  return (
    <Canvas shadows camera={{ position: [20, 20, 20], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <OrbitControls makeDefault enableDamping />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={0x334155} />
      </mesh>

      {buildings.map((b, i) => (
        <Building
          key={b.id}
          building={b}
          index={i}
          onApartmentClick={onApartmentClick}
          selectedApartmentId={selectedApartmentId}
        />
      ))}
    </Canvas>
  );
}
