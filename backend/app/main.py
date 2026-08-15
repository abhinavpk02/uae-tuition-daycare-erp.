from fastapi import FastAPI, status
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.database import init_db, verify_db_connection
from app.api import auth, students, staff, attendance, billing_pos, accounting, reports, timetable, assets, roles, v1_endpoints
from seed_data import seed

app = FastAPI(
    title="UAE Tuition & Daycare ERP API",
    description="High-density 3NF Double-Entry Accounting & ERP Engine for UAE Tuition & Daycare Centers",
    version="1.0.0"
)

# STRICT CORS Origins Configuration: Only authorized production portal & local dev
origins = [
    "https://daycare-portal.vercel.app",
    "https://uae-tuition-daycare-erp.vercel.app",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(billing_pos.router, prefix="/api")
app.include_router(accounting.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(timetable.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(v1_endpoints.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    # 1. Verify DB Connection before accepting traffic
    try:
        await verify_db_connection()
        print("✔ Production Database connection verified successfully.")
    except Exception as e:
        print(f"⚠ Warning: Initial DB verification check: {e}")

    # 2. Initialize schema / seed if required
    if not os.path.exists("./erp.db"):
        print("Database file erp.db not found. Initializing schema...")
        await init_db()

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.get("/api/health")
async def health_check():
    return {"status": "online", "system": "UAE Tuition & Daycare ERP", "environment": "production"}
