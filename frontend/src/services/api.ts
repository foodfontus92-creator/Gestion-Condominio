const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export type Building = {
  id: string;
  code: string;
  status: "active" | "suppressed";
  apartments: Apartment[];
};

export type Apartment = {
  id: string;
  building_id: string;
  number: number;
  status: "active" | "suppressed";
};

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }
  return res;
}

export const api = {
  getBuildings: (): Promise<Building[]> =>
    request("/buildings").then((r) => r.json()),

  createBuilding: (code: string) =>
    request("/buildings", { method: "POST", body: JSON.stringify({ code }) }).then(
      (r) => r.json()
    ),

  suppressBuilding: (id: string) =>
    request(`/buildings/${id}/suppress`, { method: "PATCH" }).then((r) =>
      r.json()
    ),

  getApartments: (): Promise<Apartment[]> =>
    request("/apartments").then((r) => r.json()),

  createApartment: (buildingId: string, number: number) =>
    request("/apartments", {
      method: "POST",
      body: JSON.stringify({ building_id: buildingId, number }),
    }).then((r) => r.json()),

  suppressApartment: (id: string) =>
    request(`/apartments/${id}/suppress`, { method: "PATCH" }).then((r) =>
      r.json()
    ),
};
