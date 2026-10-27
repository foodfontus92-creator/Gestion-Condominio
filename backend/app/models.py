"""SQLAlchemy models for Condominio 3D Dashboard."""

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Uuid,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Declarative base for SQLAlchemy models."""


class Building(Base):
    """A residential building (bloque) with a set of apartments."""

    __tablename__ = "buildings"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default="now()")

    apartments: Mapped[list["Apartment"]] = relationship(back_populates="building")

    __table_args__ = (
        UniqueConstraint("code", name="uq_buildings_code"),
        CheckConstraint("status IN ('active', 'suppressed')", name="ck_buildings_status"),
    )


class Apartment(Base):
    """An apartment unit inside a building."""

    __tablename__ = "apartments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    building_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("buildings.id"), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default="now()")

    building: Mapped[Building] = relationship(back_populates="apartments")

    __table_args__ = (
        UniqueConstraint("building_id", "number", name="uq_apartments_building_number"),
        CheckConstraint("status IN ('active', 'suppressed')", name="ck_apartments_status"),
    )
