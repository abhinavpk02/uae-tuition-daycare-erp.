import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from app.models.domain import Base

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Production Database Connection URL Configuration
RAW_DATABASE_URL = os.getenv("DATABASE_URL")

if RAW_DATABASE_URL:
    target_url = RAW_DATABASE_URL
    # Ensure correct async driver scheme
    if target_url.startswith("postgresql://"):
        target_url = target_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql+asyncpg://", 1)
else:
    # Local Development Fallback
    target_url = "sqlite+aiosqlite:////tmp/erp.db" if os.getenv("VERCEL") else "sqlite+aiosqlite:///./erp.db"

# Engine configuration with production connection pooling & health checks
is_sqlite = "sqlite" in target_url

engine_kwargs = {
    "echo": False,
    "future": True
}

if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Production PostgreSQL Connection Pooling Parameters
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_pre_ping": True,  # Actively tests connection health before dispatch
        "pool_recycle": 300     # Recycles connection pool every 5 mins to prevent stale serverless timeouts
    })

engine = create_async_engine(target_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def verify_db_connection():
    """Startup health check verifying DB ping execution before accepting traffic."""
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
