"""FastAPI routes for Condominio 3D Dashboard."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models
from app.database import SessionLocal
from app.schemas import (
    ApartmentCreate,
    ApartmentResponse,
    ApartmentUpdate,
    BuildingCreate,
    BuildingResponse,
    BuildingUpdate,
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Buildings ──


@router.get("/buildings", response_model=List[BuildingResponse])
def list_buildings(db: Session = Depends(get_db)):
    return crud.get_buildings(db)


@router.post("/buildings", response_model=BuildingResponse, status_code=201)
def add_building(payload: BuildingCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Building).filter(models.Building.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=409, detail="Building code already exists")
    return crud.create_building(db, payload)


@router.patch("/buildings/{building_id}", response_model=BuildingResponse)
def edit_building(building_id: UUID, patch: BuildingUpdate, db: Session = Depends(get_db)):
    updated = crud.update_building(db, building_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Building not found")
    return updated


@router.patch("/buildings/{building_id}/suppress", response_model=BuildingResponse)
def suppress_building(building_id: UUID, db: Session = Depends(get_db)):
    updated = crud.suppress_building(db, building_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Building not found")
    return updated


# ── Apartments ──


@router.get("/apartments", response_model=List[ApartmentResponse])
def list_apartments(db: Session = Depends(get_db)):
    return crud.get_apartments(db)


@router.post("/apartments", response_model=ApartmentResponse, status_code=201)
def add_apartment(payload: ApartmentCreate, db: Session = Depends(get_db)):
    created = crud.create_apartment(db, payload, building_id=payload.building_id)  # type: ignore[arg-type]
    if not created:
        raise HTTPException(status_code=404, detail="Building not found")
    return created


@router.patch("/apartments/{apartment_id}", response_model=ApartmentResponse)
def edit_apartment(apartment_id: UUID, patch: ApartmentUpdate, db: Session = Depends(get_db)):
    updated = crud.update_apartment(db, apartment_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Apartment not found")
    return updated


@router.patch("/apartments/{apartment_id}/suppress", response_model=ApartmentResponse)
def suppress_apartment(apartment_id: UUID, db: Session = Depends(get_db)):
    updated = crud.suppress_apartment(db, apartment_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Apartment not found")
    return updated
