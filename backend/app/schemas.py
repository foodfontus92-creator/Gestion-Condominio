"""Pydantic schemas for Condominio 3D Dashboard API."""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ApartmentBase(BaseModel):
    building_id: UUID
    number: int
    status: Optional[str] = "active"


class ApartmentCreate(ApartmentBase):
    pass


class ApartmentUpdate(BaseModel):
    building_id: Optional[UUID] = None
    number: Optional[int] = None
    status: Optional[str] = None


class ApartmentResponse(ApartmentBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class BuildingBase(BaseModel):
    code: str
    status: Optional[str] = "active"


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BaseModel):
    code: Optional[str] = None
    status: Optional[str] = None


class BuildingResponse(BuildingBase):
    id: UUID
    apartments: List[ApartmentResponse] = []

    model_config = ConfigDict(from_attributes=True)
