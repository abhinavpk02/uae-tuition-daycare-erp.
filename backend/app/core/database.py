import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text, event
from app.models.domain import Base

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Turso (libSQL) Connection Credentials from Environment
TURSO_DB_URL = os.getenv(
    "TURSO_DATABASE_URL", 
    "libsql://nest-daycare-abhinav02.aws-ap-south-1.turso.io"
)
TURSO_AUTH_TOKEN = os.getenv(
    "TURSO_AUTH_TOKEN", 
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY4MTM2OTMsImlkIjoiMDFhMDA2MzktODIwMS03YjUwLWJkMzktYjExZDExYzNhMDRjIiwia2lkIjoiY2RHN3VHbE5YbU1QOUlLc0wxWkItRUhqM0k3Q3hkd04xNDVxRHJiT0NwSSIsInJpZCI6IjcxMzc4YzQzLTdhM2YtNDBmYy1iYmEwLTY1YmNlNDYxNDQ1OSJ9.G2vEMVs2WPHp-uoN4YMBtX1Q402InPMhv61dBGxuCE0isnKeEIZ3rlKbpwbbWg2qR5Esmh80ocn0MvjJRmb2Cg"
)

# 1. Format Connection URL for SQLAlchemy libSQL / SQLite dialect
raw_url = TURSO_DB_URL.strip()

if raw_url.startswith("libsql://"):
    target_url = raw_url.replace("libsql://", "sqlite+libsql://", 1)
elif raw_url.startswith("https://") and "turso.io" in raw_url:
    target_url = raw_url.replace("https://", "sqlite+libsql://", 1)
elif not raw_url.startswith("sqlite"):
    target_url = f"sqlite+libsql://{raw_url}"
else:
    target_url = raw_url

# 2. Append authentication parameter to target URL
if TURSO_AUTH_TOKEN and "turso.io" in target_url and "authToken=" not in target_url:
    delimiter = "&" if "?" in target_url else "?"
    target_url = f"{target_url}{delimiter}authToken={TURSO_AUTH_TOKEN}"

# 3. Create Async Engine with connect_args for remote Turso access
connect_kwargs = {
    "check_same_thread": False
}
if TURSO_AUTH_TOKEN:
    connect_kwargs["auth_token"] = TURSO_AUTH_TOKEN

engine = create_async_engine(
    target_url,
    echo=False,
    future=True,
    connect_args=connect_kwargs
)

# 4. Enforce SQLite/Turso Foreign Keys PRAGMA on connect
@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()
    except Exception:
        pass

# 5. Configure AsyncSession Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def verify_db_connection():
    """Startup health check verifying Turso DB ping execution before accepting traffic."""
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))

async def init_db():
    """Initializes database schema tables on Turso libSQL cluster."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    """FastAPI Dependency for scoped AsyncSession transactions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
