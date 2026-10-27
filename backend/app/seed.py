"""Idempotent seed data for the Condominio 3D Dashboard.

Inserts the initial dataset: 5 buildings (bloques) with 9 apartments
(departamentos) each, all in ``active`` status.
"""

from uuid import uuid4

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal, engine
from app.models import Building, Apartment

SEED_BUILDINGS: list[tuple[str, list[int]]] = [
    ("A", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("B", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("C", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("D", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("E", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
]


def seed(db: Session | None = None) -> None:
    """Insert initial buildings + apartments if the tables are empty.

    Idempotent: safe to run multiple times. Only seeds when no buildings
    exist yet (initial seed guard).
    """
    own_session = db is None
    if own_session:
        db = SessionLocal()

    try:
        exists = db.query(Building).first()
        if exists:
            return

        for code, numbers in SEED_BUILDINGS:
            building = Building(id=uuid4(), code=code, status="active")
            db.add(building)
            db.flush()
            for number in numbers:
                apartment = Apartment(
                    id=uuid4(),
                    building_id=building.id,
                    number=number,
                    status="active",
                )
                db.add(apartment)

        db.commit()
    finally:
        if own_session:
            db.close()


def seed_from_engine() -> None:
    """Compatibilidad: ejecuta seed usando el engine global."""
    seed(SessionLocal())
