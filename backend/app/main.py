"""FastAPI application for Condominio 3D Dashboard."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.api import router as api_router
from app.api_v2 import router as api_v2_router
from app.config import settings
from app.database import engine, SessionLocal
from app import seed

app = FastAPI(title="Condominio 3D Dashboard", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(api_v2_router)


@app.on_event("startup")
def startup():
    models.Base.metadata.create_all(bind=engine)
    seed.seed(SessionLocal())


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
