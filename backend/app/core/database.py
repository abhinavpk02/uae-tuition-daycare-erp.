import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.domain import Base

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Determine Database Connection URL
TURSO_DB_URL = os.getenv("TURSO_DATABASE_URL")
TURSO_TOKEN = os.getenv("TURSO_AUTH_TOKEN")
ENV_DB_URL = os.getenv("DATABASE_URL")

target_url = None

if os.getenv("VERCEL"):
    # On Vercel Serverless, default to /tmp/erp.db unless explicit PostgreSQL or supported DB URL is set
    if ENV_DB_URL and ("postgres" in ENV_DB_URL):
        target_url = ENV_DB_URL
    else:
        target_url = "sqlite+aiosqlite:////tmp/erp.db"
else:
    if TURSO_DB_URL:
        target_url = TURSO_DB_URL
    elif ENV_DB_URL:
        target_url = ENV_DB_URL
    else:
        target_url = "sqlite+aiosqlite:///./erp.db"

# 1. Format Turso URLs if applicable
if target_url.startswith("libsql://"):
    target_url = target_url.replace("libsql://", "sqlite+libsql://", 1)
elif target_url.startswith("https://") and "turso.io" in target_url:
    target_url = target_url.replace("https://", "sqlite+libsql://", 1)

if TURSO_TOKEN and "turso.io" in target_url and "authToken=" not in target_url:
    delimiter = "&" if "?" in target_url else "?"
    target_url = f"{target_url}{delimiter}authToken={TURSO_TOKEN}"

# 2. Format PostgreSQL URLs
if target_url.startswith("postgresql://"):
    target_url = target_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif target_url.startswith("postgres://"):
    target_url = target_url.replace("postgres://", "postgresql+asyncpg://", 1)

try:
    engine = create_async_engine(
        target_url,
        echo=False,
        connect_args={"check_same_thread": False} if "sqlite" in target_url else {}
    )
except Exception:
    # Safe fallback for serverless sandbox
    target_url = "sqlite+aiosqlite:////tmp/erp.db"
    engine = create_async_engine(
        target_url,
        echo=False,
        connect_args={"check_same_thread": False}
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
