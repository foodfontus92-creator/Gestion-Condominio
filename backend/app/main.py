"""FastAPI application for Condominio 3D Dashboard."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.api import router
from app.database import engine, SessionLocal
from app import seed

app = FastAPI(title="Condominio 3D Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
def startup():
    models.Base.metadata.create_all(bind=engine)
    seed.seed(SessionLocal())


@app.get("/health")
def health():
    return {"status": "ok"}
