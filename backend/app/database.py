"""Database engine and session for Condominio 3D Dashboard."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base  # noqa: F401

DATABASE_URL = "postgresql+psycopg://lemoria:lemoria@localhost:5432/condominio"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
