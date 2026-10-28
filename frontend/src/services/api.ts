const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export type Building = {
  id: string;
  code: string;
  status: string;
  apartments: Apartment[];
};

export type Apartment = {
  id: string;
  building_id: string;
  number: number;
  status: string;
  monthly_fee?: number;
  occupants?: Occupant[];
  payments?: Payment[];
  maintenance_requests?: MaintenanceRequest[];
};

export type Occupant = {
  id: string;
  apartment_id: string;
  full_name: string;
  document_id?: string;
  phone?: string;
  email?: string;
  occupant_type: string;
  is_primary: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  apartment_id: string;
  amount: number;
  description: string;
  due_date: string;
  paid_date?: string;
  status: "pending" | "paid" | "overdue";
  payment_method?: string;
  reference?: string;
  created_at: string;
  updated_at: string;
};

export type MaintenanceRequest = {
  id: string;
  apartment_id: string;
  reported_by_id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  reported_at: string;
  resolved_at?: string;
  assigned_to?: string;
  notes?: string;
};

export type CommonArea = {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
};

export type Reservation = {
  id: string;
  common_area_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  purpose?: string;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "residente" | "portero";
  is_active: boolean;
  apartment_id?: string;
};

export type DashboardMetrics = {
  total_buildings: number;
  total_apartments: number;
  active_apartments: number;
  suppressed_apartments: number;
  occupied_apartments: number;
  vacant_apartments: number;
  pending_payments: number;
  overdue_payments: number;
  open_maintenance: number;
  closed_maintenance: number;
  total_common_areas: number;
  confirmed_reservations: number;
};

type AuthUser = {
  email: string;
  password: string;
  full_name?: string;
  role?: string;
  apartment_id?: string;
};

export type ApiError = {
  message: string;
  status?: number;
  isNetworkError: boolean;
};

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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

// Helper para envolver llamadas a la API con manejo de errores
async function apiCall<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err.message || "Error desconocido",
        isNetworkError: err.message.includes("conectar") || err.message.includes("timeout"),
      },
    };
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

  // Apartments
  getApartments: () => request("/api/apartments").then((r) => r.json()),

  // Occupants
  getOccupants: (apartmentId: string) =>
    request(`/api/v2/occupants/apartment/${apartmentId}`).then((r) => r.json()),

  // Payments
  getPayments: (apartmentId: string) =>
    request(`/api/v2/payments/apartment/${apartmentId}`).then((r) => r.json()),

  getPendingPayments: () =>
    request("/api/v2/payments/pending").then((r) => r.json()),

  getOverduePayments: () =>
    request("/api/v2/payments/overdue").then((r) => r.json()),

  // Maintenance
  getMaintenance: (apartmentId: string) =>
    request(`/api/v2/maintenance/apartment/${apartmentId}`).then((r) =>
      r.json(),
    ),

  getOpenMaintenance: () =>
    request("/api/v2/maintenance/open").then((r) => r.json()),

  // Common Areas
  getCommonAreas: (activeOnly = true) =>
    request(`/api/v2/common-areas?activeOnly=${activeOnly}`).then((r) =>
      r.json(),
    ),

  // Reservations
  getReservations: () => request("/api/v2/reservations").then((r) => r.json()),

  // Dashboard
  getMetrics: () => request("/api/v2/dashboard/metrics").then((r) => r.json()),

  // Helper
  apiCall,
};
