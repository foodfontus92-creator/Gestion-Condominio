"""CRUD operations for buildings and apartments."""

from uuid import UUID

from sqlalchemy.orm import Session

from app import models
from app.schemas import (
    ApartmentCreate,
    ApartmentUpdate,
    BuildingCreate,
    BuildingUpdate,
)


# ── Buildings ──


def get_buildings(db: Session) -> list[models.Building]:
    return db.query(models.Building).all()


def get_building(db: Session, building_id: UUID) -> models.Building | None:
    return db.query(models.Building).filter(models.Building.id == building_id).first()


def create_building(db: Session, building: BuildingCreate) -> models.Building:
    db_building = models.Building(
        code=building.code,
        status=building.status or "active",
    )
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building


def update_building(db: Session, building_id: UUID, patch: BuildingUpdate) -> models.Building | None:
    db_building = get_building(db, building_id)
    if not db_building:
        return None
    data = patch.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_building, field, value)
    db.commit()
    db.refresh(db_building)
    return db_building


def suppress_building(db: Session, building_id: UUID) -> models.Building | None:
    """Mark a building as suppressed (out of service)."""
    db_building = get_building(db, building_id)
    if not db_building:
        return None
    db_building.status = "suppressed"
    for apartment in db_building.apartments:
        apartment.status = "suppressed"
    db.commit()
    db.refresh(db_building)
    return db_building


# ── Apartments ──


def get_apartments(db: Session) -> list[models.Apartment]:
    return db.query(models.Apartment).all()


def get_apartment(db: Session, apartment_id: UUID) -> models.Apartment | None:
    return db.query(models.Apartment).filter(models.Apartment.id == apartment_id).first()


def create_apartment(db: Session, apartment: ApartmentCreate, building_id: UUID) -> models.Apartment | None:
    building = get_building(db, building_id)
    if not building:
        return None
    db_apartment = models.Apartment(
        building_id=building_id,
        number=apartment.number,
        status=apartment.status or "active",
    )
    db.add(db_apartment)
    db.commit()
    db.refresh(db_apartment)
    return db_apartment


def update_apartment(db: Session, apartment_id: UUID, patch: ApartmentUpdate) -> models.Apartment | None:
    db_apartment = get_apartment(db, apartment_id)
    if not db_apartment:
        return None
    data = patch.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_apartment, field, value)
    db.commit()
    db.refresh(db_apartment)
    return db_apartment


def suppress_apartment(db: Session, apartment_id: UUID) -> models.Apartment | None:
    """Mark an apartment as suppressed (out of service)."""
    db_apartment = get_apartment(db, apartment_id)
    if not db_apartment:
        return None
    db_apartment.status = "suppressed"
    db.commit()
    db.refresh(db_apartment)
    return db_apartment
