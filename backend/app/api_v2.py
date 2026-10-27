"""Rutas API v2.0 para Condominio 3D Dashboard."""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, crud_v2, models, models_v2
from app.api import get_db  # reuse existing get_db
from app.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    require_role,
    require_roles,
)
from app.database import SessionLocal
from app.schemas_v2 import (
    CommonAreaCreate,
    CommonAreaResponse,
    CommonAreaUpdate,
    DashboardMetrics,
    MaintenanceRequestCreate,
    MaintenanceRequestResponse,
    MaintenanceRequestUpdate,
    OccupantCreate,
    OccupantResponse,
    OccupantUpdate,
    PaymentCreate,
    PaymentResponse,
    PaymentUpdate,
    ReservationCreate,
    ReservationResponse,
    ReservationUpdate,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/api/v2")


# ── Auth ──


@router.post("/auth/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/register", response_model=UserResponse, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if crud_v2.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    from app.auth import get_password_hash
    return crud_v2.create_user(db, user_in, get_password_hash(user_in.password))


@router.get("/auth/me", response_model=UserResponse)
def me(current_user: models_v2.User = Depends(get_current_user)):
    return current_user


# ── Users (admin only) ──


@router.get("/users", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models_v2.User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return db.query(models_v2.User).offset(skip).limit(limit).all()


# ── Occupants ──


@router.get("/apartments/{apartment_id}/occupants", response_model=List[OccupantResponse])
def list_occupants(apartment_id: UUID, db: Session = Depends(get_db)):
    return crud_v2.get_occupants_by_apartment(db, apartment_id)


@router.post("/occupants", response_model=OccupantResponse, status_code=201)
def add_occupant(
    occupant_in: OccupantCreate,
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    return crud_v2.create_occupant(db, occupant_in)


@router.patch("/occupants/{occupant_id}", response_model=OccupantResponse)
def edit_occupant(
    occupant_id: UUID,
    patch: OccupantUpdate,
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    updated = crud_v2.update_occupant(db, occupant_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Ocupante no encontrado")
    return updated


@router.delete("/occupants/{occupant_id}", status_code=204)
def remove_occupant(
    occupant_id: UUID,
    current_user: models_v2.User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    if not crud_v2.delete_occupant(db, occupant_id):
        raise HTTPException(status_code=404, detail="Ocupante no encontrado")


# ── Payments ──


@router.get("/apartments/{apartment_id}/payments", response_model=List[PaymentResponse])
def list_payments(apartment_id: UUID, db: Session = Depends(get_db)):
    return crud_v2.get_payments_by_apartment(db, apartment_id)


@router.post("/payments", response_model=PaymentResponse, status_code=201)
def add_payment(
    payment_in: PaymentCreate,
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    return crud_v2.create_payment(db, payment_in)


@router.patch("/payments/{payment_id}", response_model=PaymentResponse)
def edit_payment(
    payment_id: UUID,
    patch: PaymentUpdate,
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    updated = crud_v2.update_payment(db, payment_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return updated


@router.get("/payments/pending", response_model=List[PaymentResponse])
def list_pending_payments(
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    return crud_v2.get_pending_payments(db)


@router.get("/payments/overdue", response_model=List[PaymentResponse])
def list_overdue_payments(
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    return crud_v2.get_overdue_payments(db)


# ── Maintenance ──


@router.get("/apartments/{apartment_id}/maintenance", response_model=List[MaintenanceRequestResponse])
def list_maintenance(apartment_id: UUID, db: Session = Depends(get_db)):
    return crud_v2.get_maintenance_by_apartment(db, apartment_id)


@router.post("/maintenance", response_model=MaintenanceRequestResponse, status_code=201)
def add_maintenance(
    maintenance_in: MaintenanceRequestCreate,
    current_user: models_v2.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud_v2.create_maintenance(db, maintenance_in, current_user.id)


@router.patch("/maintenance/{maintenance_id}", response_model=MaintenanceRequestResponse)
def edit_maintenance(
    maintenance_id: UUID,
    patch: MaintenanceRequestUpdate,
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    updated = crud_v2.update_maintenance(db, maintenance_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    return updated


@router.get("/maintenance/open", response_model=List[MaintenanceRequestResponse])
def list_open_maintenance(
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    return crud_v2.get_open_maintenance(db)


# ── Common Areas ──


@router.get("/common-areas", response_model=List[CommonAreaResponse])
def list_common_areas(active_only: bool = False, db: Session = Depends(get_db)):
    return crud_v2.get_common_areas(db, active_only)


@router.post("/common-areas", response_model=CommonAreaResponse, status_code=201)
def add_common_area(
    area_in: CommonAreaCreate,
    current_user: models_v2.User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return crud_v2.create_common_area(db, area_in)


@router.patch("/common-areas/{area_id}", response_model=CommonAreaResponse)
def edit_common_area(
    area_id: UUID,
    patch: CommonAreaUpdate,
    current_user: models_v2.User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    updated = crud_v2.update_common_area(db, area_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Área común no encontrada")
    return updated


# ── Reservations ──


@router.get("/reservations", response_model=List[ReservationResponse])
def list_reservations(
    common_area_id: Optional[UUID] = None,
    current_user: models_v2.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if common_area_id:
        return crud_v2.get_reservations_by_area(db, common_area_id)
    if current_user.role == "admin":
        return db.query(models_v2.Reservation).all()
    return crud_v2.get_reservations_by_user(db, current_user.id)


@router.post("/reservations", response_model=ReservationResponse, status_code=201)
def add_reservation(
    reservation_in: ReservationCreate,
    current_user: models_v2.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return crud_v2.create_reservation(db, reservation_in, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.patch("/reservations/{reservation_id}", response_model=ReservationResponse)
def edit_reservation(
    reservation_id: UUID,
    patch: ReservationUpdate,
    current_user: models_v2.User = Depends(require_roles(["admin", "portero"])),
    db: Session = Depends(get_db),
):
    updated = crud_v2.update_reservation(db, reservation_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return updated


# ── Dashboard metrics ──


@router.get("/dashboard/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(
    current_user: models_v2.User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    total_buildings = db.query(models.Building).count()
    total_apartments = db.query(models.Apartment).count()
    active_apartments = db.query(models.Apartment).filter(models.Apartment.status == "active").count()
    suppressed_apartments = total_apartments - active_apartments
    occupied = (
        db.query(models_v2.Occupant)
        .filter(models_v2.Occupant.is_primary == True)  # noqa: E712
        .distinct(models_v2.Occupant.apartment_id)
        .count()
    )
    vacant = max(0, active_apartments - occupied)
    pending_payments = len(crud_v2.get_pending_payments(db))
    overdue_payments = len(crud_v2.get_overdue_payments(db))
    open_maintenance = len(crud_v2.get_open_maintenance(db))
    closed_maintenance = (
        db.query(models_v2.MaintenanceRequest)
        .filter(models_v2.MaintenanceRequest.status == "closed")
        .count()
    )
    total_common_areas = db.query(models_v2.CommonArea).count()
    confirmed_reservations = (
        db.query(models_v2.Reservation)
        .filter(models_v2.Reservation.status == "confirmed")
        .count()
    )

    return DashboardMetrics(
        total_buildings=total_buildings,
        total_apartments=total_apartments,
        active_apartments=active_apartments,
        suppressed_apartments=suppressed_apartments,
        occupied_apartments=occupied,
        vacant_apartments=vacant,
        pending_payments=pending_payments,
        overdue_payments=overdue_payments,
        open_maintenance=open_maintenance,
        closed_maintenance=closed_maintenance,
        total_common_areas=total_common_areas,
        confirmed_reservations=confirmed_reservations,
    )
