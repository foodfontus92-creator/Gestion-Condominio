# Condominio 3D Dashboard

Dashboard 3D de gestión de condominios construido con **React Three Fiber**, **Tailwind CSS**, **FastAPI** y **PostgreSQL**.

## Características

- 🏢 Visualización 3D de 5 bloques × 9 departamentos cada uno (extensible)
- 🖱️ Clic en departamento → panel lateral con detalles (número, bloque, estado)
- ➕ Agregar nuevo bloque dinámicamente (con 9 departamentos)
- 🚫 Suprimir bloque o departamento (ocultar + marcar como fuera de servicio)
- 🗄️ Backend REST con CRUD de edificios y apartamentos
- 🔐 Autenticación JWT con roles (estructura lista: admin, residente, portero)
- 🐳 Despliegue con Docker Compose (PostgreSQL + Backend + Frontend)
- 🧪 Tests de API y frontend

## Estructura del proyecto

```
condominio-3d-dashboard/
├── backend/                 # FastAPI + SQLAlchemy + Alembic + PostgreSQL
│   ├── app/
│   │   ├── main.py          # Entrypoint FastAPI
│   │   ├── models.py        # Modelos Building / Apartment
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── crud.py          # Operaciones CRUD
│   │   ├── api.py           # Rutas REST
│   │   ├── auth.py          # Utilidades JWT + roles
│   │   ├── config.py        # Configuración desde .env
│   │   ├── database.py      # Engine y sesión SQLAlchemy
│   │   └── seed.py          # Seed inicial (5 edificios × 9 dptos)
│   ├── migrations/          # Migraciones Alembic
│   ├── tests/               # Tests pytest
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                # React 18 + TS + Vite + Tailwind + R3F
│   ├── src/
│   │   ├── App.tsx          # Componente principal (conectado a API)
│   │   ├── scene/CondominiumScene.tsx   # Escena 3D con edificios
│   │   ├── services/api.ts  # Cliente de API REST
│   │   ├── components/
│   │   │   ├── ApartmentPanel.tsx       # Panel lateral del departamento
│   │   │   ├── AddBuildingDialog.tsx    # Dialog agregar bloque
│   │   │   └── BuildingControls.tsx     # Controles agregar/suprimir
│   │   └── __tests__/
│   │       └── App.test.tsx
│   ├── Dockerfile.dev
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml       # Orquestación completa
└── README.md
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/buildings` | Listar edificios |
| POST | `/api/buildings` | Crear edificio |
| PATCH | `/api/buildings/{id}` | Editar edificio |
| PATCH | `/api/buildings/{id}/suppress` | Suprimir edificio |
| GET | `/api/apartments` | Listar departamentos |
| POST | `/api/apartments` | Crear departamento |
| PATCH | `/api/apartments/{id}` | Editar departamento |
| PATCH | `/api/apartments/{id}/suppress` | Suprimir departamento |

## Despliegue rápido

### Con Docker Compose (recomendado)
```bash
cp backend/.env.example backend/.env
# Edita backend/.env si es necesario
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

### Desarrollo manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Three Fiber, drei, Three.js
- **Backend:** FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, psycopg2
- **Auth:** JWT (python-jose), bcrypt (passlib)
- **Tests:** Vitest (frontend), pytest + TestClient (backend)

## Decisiones técnicas (ADR)

- Stack 3D: React Three Fiber (integración nativa con React)
- Arquitectura: Backend + BD desde el inicio
- Supresión: Ocultar visualmente + marcar como fuera de servicio
- Auth: JWT con roles (admin, residente, portero)
- Despliegue: Docker Compose
