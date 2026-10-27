"""Idempotent seed data for the Condominio 3D Dashboard v2.0."""

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import bcrypt

from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app import models
from app.models_v2 import (
    User,
    UserRole,
    Occupant,
    Payment,
    PaymentStatus,
    MaintenanceRequest,
    MaintenanceStatus,
    MaintenancePriority,
    CommonArea,
    Reservation,
    ReservationStatus,
)

SEED_BUILDINGS: list[tuple[str, list[int]]] = [
    ("A", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("B", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("C", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("D", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
    ("E", [101, 102, 103, 104, 105, 106, 107, 108, 109]),
]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed(db: Session | None = None) -> None:
    """Insert initial data if tables are empty. Idempotent."""
    own_session = db is None
    if own_session:
        db = SessionLocal()

    try:
        # ── Buildings & Apartments ──
        if db.query(models.Building).first():
            return  # Already seeded

        building_ids = {}
        for code, numbers in SEED_BUILDINGS:
            building = models.Building(id=uuid4(), code=code, status="active")
            db.add(building)
            db.flush()
            building_ids[code] = building.id
            for number in numbers:
                apartment = models.Apartment(
                    id=uuid4(),
                    building_id=building.id,
                    number=number,
                    status="active",
                    monthly_fee=150.00,
                )
                db.add(apartment)
                db.flush()

        # ── Users ──
        admin = User(
            id=uuid4(),
            email="admin@condominio.com",
            hashed_password=hash_password("admin123"),
            full_name="Administrador Condominio",
            role=UserRole.ADMIN,
        )
        portero = User(
            id=uuid4(),
            email="portero@condominio.com",
            hashed_password=hash_password("portero123"),
            full_name="Juan Portero",
            role=UserRole.PORTERO,
        )
        residente = User(
            id=uuid4(),
            email="residente@condominio.com",
            hashed_password=hash_password("residente123"),
            full_name="María Residente",
            role=UserRole.RESIDENTE,
        )
        db.add_all([admin, portero, residente])
        db.flush()

        # ── Common Areas ──
        quincho = CommonArea(
            id=uuid4(),
            name="Quincho",
            description="Área de parrilla con mesas y sillas",
            capacity=20,
            location="Planta baja, ala este",
            image_url="/images/quincho.jpg",
        )
        gimnasio = CommonArea(
            id=uuid4(),
            name="Gimnasio",
            description="Equipos de cardio y pesas",
            capacity=10,
            location="Planta baja, ala oeste",
            image_url="/images/gimnasio.jpg",
        )
        salon = CommonArea(
            id=uuid4(),
            name="Salón de Eventos",
            description="Salón cerrado con cocina",
            capacity=50,
            location="Segundo piso",
            image_url="/images/salon.jpg",
        )
        db.add_all([quincho, gimnasio, salon])
        db.flush()

        db.commit()

        # ── Occupants for first 3 apartments of building A ──
        building_a_id = building_ids["A"]
        apt_101 = (
            db.query(models.Apartment)
            .filter(models.Apartment.building_id == building_a_id, models.Apartment.number == 101)
            .first()
        )
        apt_102 = (
            db.query(models.Apartment)
            .filter(models.Apartment.building_id == building_a_id, models.Apartment.number == 102)
            .first()
        )
        apt_103 = (
            db.query(models.Apartment)
            .filter(models.Apartment.building_id == building_a_id, models.Apartment.number == 103)
            .first()
        )

        occupants = [
            Occupant(
                id=uuid4(),
                full_name="Carlos Pérez",
                document_id="12345678",
                phone="+54 9 11 1234-5678",
                email="carlos@example.com",
                occupant_type="owner",
                is_primary=True,
                apartment_id=apt_101.id,
            ),
            Occupant(
                id=uuid4(),
                full_name="Lucía Gómez",
                document_id="87654321",
                phone="+54 9 11 2345-6789",
                email="lucia@example.com",
                occupant_type="tenant",
                is_primary=True,
                apartment_id=apt_102.id,
            ),
            Occupant(
                id=uuid4(),
                full_name="Roberto Sánchez",
                document_id="11223344",
                phone="+54 9 11 3456-7890",
                email="roberto@example.com",
                occupant_type="owner",
                is_primary=True,
                apartment_id=apt_103.id,
            ),
        ]
        db.add_all(occupants)

        # Link resident user to apartment 101
        residente.apartment_id = apt_101.id

        # ── Payments ──
        now = datetime.now(timezone.utc)
        payments = []
        for apt in [apt_101, apt_102, apt_103]:
            payments.append(
                Payment(
                    id=uuid4(),
                    apartment_id=apt.id,
                    amount=150.00,
                    description="Expensa enero",
                    due_date=now - timedelta(days=30),
                    paid_date=now - timedelta(days=25),
                    status=PaymentStatus.PAID,
                    payment_method="transferencia",
                )
            )
            payments.append(
                Payment(
                    id=uuid4(),
                    apartment_id=apt.id,
                    amount=150.00,
                    description="Expensa febrero",
                    due_date=now - timedelta(days=5),
                    status=PaymentStatus.PENDING,
                )
            )
            payments.append(
                Payment(
                    id=uuid4(),
                    apartment_id=apt.id,
                    amount=150.00,
                    description="Expensa marzo",
                    due_date=now - timedelta(days=40),
                    status=PaymentStatus.PENDING,
                )
            )
        db.add_all(payments)

        # ── Maintenance requests ──
        maintenance = [
            MaintenanceRequest(
                id=uuid4(),
                title="Fuga de agua en cocina",
                description="Goteo constante bajo el fregadero",
                status=MaintenanceStatus.OPEN,
                priority=MaintenancePriority.HIGH,
                apartment_id=apt_101.id,
                reported_by_id=residente.id,
            ),
            MaintenanceRequest(
                id=uuid4(),
                title="Ascensor lento",
                description="El ascensor tarda mucho en abrir puertas",
                status=MaintenanceStatus.IN_PROGRESS,
                priority=MaintenancePriority.MEDIUM,
                assigned_to="Juan Portero",
                apartment_id=apt_102.id,
                reported_by_id=residente.id,
            ),
            MaintenanceRequest(
                id=uuid4(),
                title="Luz escalera piso 2",
                description="Foco fundido en escalera del segundo piso",
                status=MaintenanceStatus.CLOSED,
                priority=MaintenancePriority.LOW,
                resolved_at=now - timedelta(days=2),
                apartment_id=apt_103.id,
                reported_by_id=residente.id,
            ),
        ]
        db.add_all(maintenance)

        # ── Reservations ──
        reservations = [
            Reservation(
                id=uuid4(),
                common_area_id=quincho.id,
                user_id=residente.id,
                start_time=now + timedelta(days=3, hours=10),
                end_time=now + timedelta(days=3, hours=14),
                status=ReservationStatus.CONFIRMED,
                purpose="Cumpleaños familiar",
            ),
            Reservation(
                id=uuid4(),
                common_area_id=gimnasio.id,
                user_id=residente.id,
                start_time=now + timedelta(days=1, hours=8),
                end_time=now + timedelta(days=1, hours=9),
                status=ReservationStatus.PENDING,
                purpose="Entrenamiento matutino",
            ),
        ]
        db.add_all(reservations)

        db.commit()
    finally:
        if own_session:
            db.close()


def seed_from_engine() -> None:
    """Compatibilidad: ejecuta seed usando el engine global."""
    seed(SessionLocal())
