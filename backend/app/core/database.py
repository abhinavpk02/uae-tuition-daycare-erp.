import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.domain import Base

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Support Turso Database environment variables (TURSO_DATABASE_URL & TURSO_AUTH_TOKEN)
TURSO_DB_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_TOKEN = os.getenv("TURSO_AUTH_TOKEN")

if TURSO_DB_URL:
    DATABASE_URL = TURSO_DB_URL

# Default to /tmp/erp.db on Vercel serverless environment if no DATABASE_URL provided
if not DATABASE_URL:
    if os.getenv("VERCEL"):
        DATABASE_URL = "sqlite+aiosqlite:////tmp/erp.db"
    else:
        DATABASE_URL = "sqlite+aiosqlite:///./erp.db"

# 1. Convert Turso libsql:// or https:// to sqlite+libsql:// format for SQLAlchemy
if DATABASE_URL.startswith("libsql://"):
    DATABASE_URL = DATABASE_URL.replace("libsql://", "sqlite+libsql://", 1)
elif DATABASE_URL.startswith("https://") and "turso.io" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("https://", "sqlite+libsql://", 1)

# Append Turso Auth Token if set in environment
if TURSO_TOKEN and "turso.io" in DATABASE_URL and "authToken=" not in DATABASE_URL:
    delimiter = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{delimiter}authToken={TURSO_TOKEN}"

# 2. Convert standard PostgreSQL URLs to asyncpg
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)


AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
