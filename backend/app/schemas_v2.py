"""Pydantic schemas para v2.0 del Condominio 3D Dashboard."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Auth ──


class UserRole(str):
    ADMIN = "admin"
    RESIDENTE = "residente"
    PORTERO = "portero"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    role: str = "residente"
    apartment_id: Optional[UUID] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    apartment_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)


# ── Occupants ──


class OccupantBase(BaseModel):
    full_name: str
    document_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    occupant_type: str = "owner"
    is_primary: bool = True


class OccupantCreate(OccupantBase):
    apartment_id: UUID


class OccupantUpdate(BaseModel):
    full_name: Optional[str] = None
    document_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    occupant_type: Optional[str] = None
    is_primary: Optional[bool] = None


class OccupantResponse(OccupantBase):
    id: UUID
    apartment_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Payments ──


class PaymentStatus(str):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class PaymentBase(BaseModel):
    amount: float
    description: str
    due_date: datetime
    payment_method: Optional[str] = None
    reference: Optional[str] = None


class PaymentCreate(PaymentBase):
    apartment_id: UUID


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    paid_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    reference: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: UUID
    apartment_id: UUID
    paid_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Maintenance ──


class MaintenanceStatus(str):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class MaintenancePriority(str):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class MaintenanceRequestBase(BaseModel):
    title: str
    description: str
    priority: str = "medium"


class MaintenanceRequestCreate(MaintenanceRequestBase):
    apartment_id: UUID


class MaintenanceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: UUID
    apartment_id: UUID
    reported_by_id: UUID
    status: str
    reported_at: datetime
    resolved_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ── Common Areas ──


class CommonAreaBase(BaseModel):
    name: str
    description: Optional[str] = None
    capacity: int = 1
    location: Optional[str] = None
    image_url: Optional[str] = None


class CommonAreaCreate(CommonAreaBase):
    pass


class CommonAreaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class CommonAreaResponse(CommonAreaBase):
    id: UUID
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Reservations ──


class ReservationStatus(str):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class ReservationBase(BaseModel):
    common_area_id: UUID
    start_time: datetime
    end_time: datetime
    purpose: Optional[str] = None


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    purpose: Optional[str] = None


class ReservationResponse(ReservationBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Dashboard metrics ──


class DashboardMetrics(BaseModel):
    total_buildings: int
    total_apartments: int
    active_apartments: int
    suppressed_apartments: int
    occupied_apartments: int
    vacant_apartments: int
    pending_payments: int
    overdue_payments: int
    open_maintenance: int
    closed_maintenance: int
    total_common_areas: int
    confirmed_reservations: int
