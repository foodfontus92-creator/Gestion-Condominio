"""Operaciones CRUD para entidades v2.0 del Condominio 3D Dashboard."""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app import models, models_v2
from app.schemas_v2 import (
    CommonAreaCreate,
    CommonAreaUpdate,
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    OccupantCreate,
    OccupantUpdate,
    PaymentCreate,
    PaymentUpdate,
    ReservationCreate,
    ReservationUpdate,
    UserCreate,
)


# ── Users ──


def get_user_by_email(db: Session, email: str) -> Optional[models_v2.User]:
    return db.query(models_v2.User).filter(models_v2.User.email == email).first()


def create_user(db: Session, user_in: UserCreate, hashed_password: str) -> models_v2.User:
    db_user = models_v2.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role,
        apartment_id=user_in.apartment_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ── Occupants ──


def get_occupants_by_apartment(db: Session, apartment_id: UUID) -> List[models_v2.Occupant]:
    return db.query(models_v2.Occupant).filter(models_v2.Occupant.apartment_id == apartment_id).all()


def create_occupant(db: Session, occupant_in: OccupantCreate) -> models_v2.Occupant:
    db_occupant = models_v2.Occupant(**occupant_in.model_dump())
    db.add(db_occupant)
    db.commit()
    db.refresh(db_occupant)
    return db_occupant


def update_occupant(db: Session, occupant_id: UUID, patch: OccupantUpdate) -> Optional[models_v2.Occupant]:
    db_occupant = db.query(models_v2.Occupant).filter(models_v2.Occupant.id == occupant_id).first()
    if not db_occupant:
        return None
    for field, value in patch.model_dump(exclude_unset=True).items():
        setattr(db_occupant, field, value)
    db.commit()
    db.refresh(db_occupant)
    return db_occupant


def delete_occupant(db: Session, occupant_id: UUID) -> bool:
    db_occupant = db.query(models_v2.Occupant).filter(models_v2.Occupant.id == occupant_id).first()
    if not db_occupant:
        return False
    db.delete(db_occupant)
    db.commit()
    return True


# ── Payments ──


def get_payments_by_apartment(db: Session, apartment_id: UUID) -> List[models_v2.Payment]:
    return db.query(models_v2.Payment).filter(models_v2.Payment.apartment_id == apartment_id).all()


def get_pending_payments(db: Session) -> List[models_v2.Payment]:
    return db.query(models_v2.Payment).filter(models_v2.Payment.status == "pending").all()


def get_overdue_payments(db: Session) -> List[models_v2.Payment]:
    now = datetime.now(timezone.utc)
    return (
        db.query(models_v2.Payment)
        .filter(models_v2.Payment.status == "pending", models_v2.Payment.due_date < now)
        .all()
    )


def create_payment(db: Session, payment_in: PaymentCreate) -> models_v2.Payment:
    db_payment = models_v2.Payment(**payment_in.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def update_payment(db: Session, payment_id: UUID, patch: PaymentUpdate) -> Optional[models_v2.Payment]:
    db_payment = db.query(models_v2.Payment).filter(models_v2.Payment.id == payment_id).first()
    if not db_payment:
        return None
    data = patch.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_payment, field, value)
    if "status" in data and data["status"] == "paid":
        db_payment.paid_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_payment)
    return db_payment


# ── Maintenance ──


def get_maintenance_by_apartment(db: Session, apartment_id: UUID) -> List[models_v2.MaintenanceRequest]:
    return (
        db.query(models_v2.MaintenanceRequest)
        .filter(models_v2.MaintenanceRequest.apartment_id == apartment_id)
        .all()
    )


def get_open_maintenance(db: Session) -> List[models_v2.MaintenanceRequest]:
    return db.query(models_v2.MaintenanceRequest).filter(models_v2.MaintenanceRequest.status == "open").all()


def create_maintenance(db: Session, maintenance_in: MaintenanceRequestCreate, reported_by_id: UUID) -> models_v2.MaintenanceRequest:
    data = maintenance_in.model_dump()
    data["reported_by_id"] = reported_by_id
    db_maintenance = models_v2.MaintenanceRequest(**data)
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance


def update_maintenance(db: Session, maintenance_id: UUID, patch: MaintenanceRequestUpdate) -> Optional[models_v2.MaintenanceRequest]:
    db_maintenance = (
        db.query(models_v2.MaintenanceRequest)
        .filter(models_v2.MaintenanceRequest.id == maintenance_id)
        .first()
    )
    if not db_maintenance:
        return None
    data = patch.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_maintenance, field, value)
    if "status" in data and data["status"] == "closed":
        db_maintenance.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance


# ── Common Areas ──


def get_common_areas(db: Session, active_only: bool = False) -> List[models_v2.CommonArea]:
    query = db.query(models_v2.CommonArea)
    if active_only:
        query = query.filter(models_v2.CommonArea.is_active == True)  # noqa: E712
    return query.all()


def create_common_area(db: Session, area_in: CommonAreaCreate) -> models_v2.CommonArea:
    db_area = models_v2.CommonArea(**area_in.model_dump())
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area


def update_common_area(db: Session, area_id: UUID, patch: CommonAreaUpdate) -> Optional[models_v2.CommonArea]:
    db_area = db.query(models_v2.CommonArea).filter(models_v2.CommonArea.id == area_id).first()
    if not db_area:
        return None
    for field, value in patch.model_dump(exclude_unset=True).items():
        setattr(db_area, field, value)
    db.commit()
    db.refresh(db_area)
    return db_area


# ── Reservations ──


def get_reservations_by_area(db: Session, common_area_id: UUID) -> List[models_v2.Reservation]:
    return (
        db.query(models_v2.Reservation)
        .filter(models_v2.Reservation.common_area_id == common_area_id)
        .all()
    )


def get_reservations_by_user(db: Session, user_id: UUID) -> List[models_v2.Reservation]:
    return db.query(models_v2.Reservation).filter(models_v2.Reservation.user_id == user_id).all()


def check_overlap(
    db: Session,
    common_area_id: UUID,
    start_time: datetime,
    end_time: datetime,
    exclude_id: Optional[UUID] = None,
) -> bool:
    query = db.query(models_v2.Reservation).filter(
        models_v2.Reservation.common_area_id == common_area_id,
        models_v2.Reservation.status.in_(["pending", "confirmed"]),
        models_v2.Reservation.start_time < end_time,
        models_v2.Reservation.end_time > start_time,
    )
    if exclude_id:
        query = query.filter(models_v2.Reservation.id != exclude_id)
    return query.first() is not None


def create_reservation(db: Session, reservation_in: ReservationCreate, user_id: UUID) -> models_v2.Reservation:
    if check_overlap(db, reservation_in.common_area_id, reservation_in.start_time, reservation_in.end_time):
        raise ValueError("El área ya está reservada en ese horario")
    data = reservation_in.model_dump()
    data["user_id"] = user_id
    db_reservation = models_v2.Reservation(**data)
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def update_reservation(db: Session, reservation_id: UUID, patch: ReservationUpdate) -> Optional[models_v2.Reservation]:
    db_reservation = (
        db.query(models_v2.Reservation)
        .filter(models_v2.Reservation.id == reservation_id)
        .first()
    )
    if not db_reservation:
        return None
    data = patch.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_reservation, field, value)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation
