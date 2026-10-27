"""Modelos extendidos para Condominio 3D Dashboard v2.0."""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.models import Base  # reusa la base existente


class UserRole(str, PyEnum):
    ADMIN = "admin"
    RESIDENTE = "residente"
    PORTERO = "portero"


class User(Base):
    """Usuario del sistema con autenticación y roles."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, default=UserRole.RESIDENTE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    apartment_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("apartments.id"), nullable=True)
    apartment: Mapped["Apartment | None"] = relationship(back_populates="users")

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="user")
    maintenance_requests: Mapped[list["MaintenanceRequest"]] = relationship(back_populates="reported_by")


class Occupant(Base):
    """Ocupante de un departamento (propietario o inquilino)."""

    __tablename__ = "occupants"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_id: Mapped[str] = mapped_column(String(50), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    occupant_type: Mapped[str] = mapped_column(String(20), nullable=False, default="owner")  # owner, tenant
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    apartment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("apartments.id"), nullable=False)
    apartment: Mapped["Apartment"] = relationship(back_populates="occupants")


class PaymentStatus(str, PyEnum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class Payment(Base):
    """Pago de expensas o cuotas por departamento."""

    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    paid_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    apartment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("apartments.id"), nullable=False)
    apartment: Mapped["Apartment"] = relationship(back_populates="payments")


class MaintenanceStatus(str, PyEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class MaintenancePriority(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class MaintenanceRequest(Base):
    """Solicitud de mantenimiento o incidencia reportada."""

    __tablename__ = "maintenance_requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[MaintenanceStatus] = mapped_column(Enum(MaintenanceStatus), default=MaintenanceStatus.OPEN)
    priority: Mapped[MaintenancePriority] = mapped_column(Enum(MaintenancePriority), default=MaintenancePriority.MEDIUM)
    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)  # nombre del portero/encargado
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    apartment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("apartments.id"), nullable=False)
    apartment: Mapped["Apartment"] = relationship(back_populates="maintenance_requests")

    reported_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    reported_by: Mapped["User"] = relationship(back_populates="maintenance_requests")


class CommonArea(Base):
    """Área común del condominio (quincho, gimnasio, etc.)."""

    __tablename__ = "common_areas"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="common_area")


class ReservationStatus(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Reservation(Base):
    """Reserva de un área común."""

    __tablename__ = "reservations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(Enum(ReservationStatus), default=ReservationStatus.PENDING)
    purpose: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    common_area_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("common_areas.id"), nullable=False)
    common_area: Mapped["CommonArea"] = relationship(back_populates="reservations")

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="reservations")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_reservation_end_after_start"),
    )


# Relaciones inversas en modelos existentes
# Apartment: users, occupants, payments, maintenance_requests
# Building: ya existe
