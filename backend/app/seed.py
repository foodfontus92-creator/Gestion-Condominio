"""Idempotent seed data for the Condominio 3D Dashboard.

Inserts the initial dataset: 5 buildings (bloques) with 9 apartments
(departamentos) each, all in ``active`` status.

Usage:
    from app.seed import seed

    seed(engine)
"""

from uuid import uuid4

from sqlalchemy import create_engine, text

# (building_code, apartment_numbers)
SEED_BUILDINGS: list[tuple[str, list[int]]] = [
    ("A", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("B", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("C", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("D", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("E", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
]


def seed(engine) -> None:
    """Insert initial buildings + apartments if the tables are empty.

    Idempotent: safe to run multiple times. Only seeds when no buildings
    exist yet (initial seed guard).
    """
    with engine.begin() as conn:
        exists = conn.execute(text("SELECT EXISTS (SELECT 1 FROM buildings)")).scalar()
        if exists:
            return

        for code, numbers in SEED_BUILDINGS:
            building_id = str(uuid4())
            conn.execute(
                text(
                    "INSERT INTO buildings (id, code, status, created_at, updated_at) "
                    "VALUES (:id, :code, 'active', now(), now())"
                ),
                {"id": building_id, "code": code},
            )
            for number in numbers:
                conn.execute(
                    text(
                        "INSERT INTO apartments (id, building_id, number, status, created_at, updated_at) "
                        "VALUES (:id, :building_id, :number, 'active', now(), now())"
                    ),
                    {
                        "id": str(uuid4()),
                        "building_id": building_id,
                        "number": number,
                    },
                )
