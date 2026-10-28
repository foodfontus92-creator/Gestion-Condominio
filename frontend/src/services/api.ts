const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export type Building = {
  id: string;
  code: string;
  status: string;
  apartments: Apartment[];
};

export type Apartment = {
  id: string;
  buildingId: string;
  number: number;
  status: string;
  monthlyFee?: number;
  occupants?: Occupant[];
  payments?: Payment[];
};

export type Occupant = {
  id: string;
  apartmentId: string;
  fullName: string;
  documentId?: string;
  phone?: string;
  email?: string;
  occupantType: string;
  isPrimary: boolean;
  createdAt: string;
};

export type Payment = {
  id: string;
  apartmentId: string;
  amount: number;
  description: string;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  paymentMethod?: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceRequest = {
  id: string;
  apartmentId: string;
  reportedById: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  reportedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  notes?: string;
};

export type CommonArea = {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
};

export type Reservation = {
  id: string;
  commonAreaId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  purpose?: string;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "residente" | "portero";
  isActive: boolean;
  apartmentId?: string;
};

export type DashboardMetrics = {
  totalBuildings: number;
  totalApartments: number;
  activeApartments: number;
  suppressedApartments: number;
  occupiedApartments: number;
  vacantApartments: number;
  pendingPayments: number;
  overduePayments: number;
  openMaintenance: number;
  closedMaintenance: number;
  totalCommonAreas: number;
  confirmedReservations: number;
};

type AuthUser = {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
  apartmentId?: string;
};

export type ApiError = {
  message: string;
  status?: number;
  isNetworkError: boolean;
};

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Error ${res.status}`);
    }
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("El servidor no responde (timeout)");
    }
    if (err.message === "Failed to fetch") {
      throw new Error("No se puede conectar al backend. ¿Está el servidor en ejecución?");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Auth
  login: (data: AuthUser) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  register: (data: AuthUser) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  me: () => request("/api/auth/me").then((r) => r.json()),

  // Buildings
  getBuildings: () => request("/api/buildings").then((r) => r.json()),

  // Apartments (by building)
  getApartmentsByBuilding: (buildingId: string) =>
    request(`/api/apartments/building/${buildingId}`).then((r) => r.json()),

  // Apartments suppress
  suppressApartment: (apartmentId: string) =>
    request(`/api/apartments/${apartmentId}/suppress`, {
      method: "PATCH",
    }).then((r) => r.json()),

  // Occupants
  getOccupants: (apartmentId: string) =>
    request(`/api/v2/occupants/apartment/${apartmentId}`).then((r) => r.json()),

  createOccupant: (data: {
    apartmentId: string;
    fullName: string;
    documentId?: string;
    phone?: string;
    email?: string;
    occupantType?: string;
    isPrimary?: boolean;
  }) =>
    request("/api/v2/occupants", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateOccupant: (id: string, data: {
    fullName?: string;
    documentId?: string;
    phone?: string;
    email?: string;
    occupantType?: string;
    isPrimary?: boolean;
  }) =>
    request(`/api/v2/occupants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteOccupant: (id: string) =>
    request(`/api/v2/occupants/${id}`, {
      method: "DELETE",
    }).then((r) => r.json()),

  // Payments
  getPayments: (apartmentId: string) =>
    request(`/api/v2/payments/apartment/${apartmentId}`).then((r) => r.json()),

  createPayment: (data: {
    apartmentId: string;
    amount: number;
    description: string;
    dueDate: string;
  }) =>
    request("/api/v2/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  markAsPaid: (id: string) =>
    request(`/api/v2/payments/${id}/pay`, {
      method: "PATCH",
    }).then((r) => r.json()),

  getPendingPayments: () =>
    request("/api/v2/payments/pending").then((r) => r.json()),

  getOverduePayments: () =>
    request("/api/v2/payments/overdue").then((r) => r.json()),

  // Maintenance
  getMaintenance: (apartmentId: string) =>
    request(`/api/v2/maintenance/apartment/${apartmentId}`).then((r) => r.json()),

  createMaintenance: (data: {
    apartmentId: string;
    reportedById: string;
    title: string;
    description: string;
    priority?: string;
  }) =>
    request("/api/v2/maintenance", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateMaintenance: (id: string, data: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    notes?: string;
  }) =>
    request(`/api/v2/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getOpenMaintenance: () =>
    request("/api/v2/maintenance/open").then((r) => r.json()),

  // Common Areas
  getCommonAreas: (activeOnly = true) =>
    request(`/api/v2/common-areas?activeOnly=${activeOnly}`).then((r) =>
      r.json(),
    ),

  createCommonArea: (data: {
    name: string;
    description?: string;
    capacity?: number;
    location?: string;
    imageUrl?: string;
  }) =>
    request("/api/v2/common-areas", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateCommonArea: (id: string, data: {
    name?: string;
    description?: string;
    capacity?: number;
    location?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) =>
    request(`/api/v2/common-areas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Reservations
  getReservations: () => request("/api/v2/reservations").then((r) => r.json()),

  createReservation: (data: {
    commonAreaId: string;
    userId: string;
    startTime: string;
    endTime: string;
    purpose?: string;
  }) =>
    request("/api/v2/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateReservation: (id: string, status: string) =>
    request(`/api/v2/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).then((r) => r.json()),

  // Dashboard
  getMetrics: () => request("/api/v2/dashboard/metrics").then((r) => r.json()),
};
