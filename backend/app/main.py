from fastapi import FastAPI, status
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.database import init_db, verify_db_connection
from app.api import auth, students, staff, attendance, billing_pos, accounting, reports, timetable, assets, roles, v1_endpoints
from seed_data import ensure_seeded

app = FastAPI(
    title="UAE Tuition & Daycare ERP API",
    description="High-density 3NF Double-Entry Accounting & ERP Engine for UAE Tuition & Daycare Centers",
    version="1.0.0"
)

# Open CORS Allow Origins to support Vercel production, preview deployments, and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dual-mount Routers (with /api and without prefix) for universal serverless route matching
all_routers = [
    auth.router,
    students.router,
    staff.router,
    attendance.router,
    billing_pos.router,
    accounting.router,
    reports.router,
    timetable.router,
    assets.router,
    roles.router,
    v1_endpoints.router
]

for router in all_routers:
    app.include_router(router, prefix="/api")
    app.include_router(router)


@app.on_event("startup")
async def startup_event():
    print("🚀 Initializing UAE Tuition & Daycare ERP Backend...")
    try:
        await verify_db_connection()
        print("✔ Remote Turso libSQL Database connection verified.")
    except Exception as e:
        print(f"⚠ Warning during DB verification: {e}")

    try:
        await ensure_seeded()
        print("✔ Database schema & auto-seed check complete.")
    except Exception as e:
        print(f"⚠ Warning during schema auto-seed: {e}")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.get("/health", include_in_schema=False)
@app.get("/api/health")
async def health_check():
    return {"status": "online", "system": "UAE Tuition & Daycare ERP", "environment": "production", "database": "Turso libSQL"}
