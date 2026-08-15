from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from pydantic import BaseModel
from decimal import Decimal

from app.core.database import get_db
from app.models.domain import Asset, RefModule
from app.services.accounting_engine import AccountingEngine

router = APIRouter(prefix="/assets", tags=["Assets"])

class AssetCreate(BaseModel):
    category: str
    item_name: str
    value: float
    depreciation_rate: float # e.g. 10.0 (%)

@router.get("")
async def list_assets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Asset))
    assets = result.scalars().all()
    return assets

@router.post("")
async def create_asset(data: AssetCreate, db: AsyncSession = Depends(get_db)):
    asset = Asset(
        category=data.category,
        item_name=data.item_name,
        value=Decimal(str(data.value)),
        depreciation_rate=Decimal(str(data.depreciation_rate))
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if asset:
        await db.delete(asset)
        await db.commit()
    return {"status": "success", "message": f"Asset {asset_id} deleted"}

@router.post("/{asset_id}/depreciate")
async def depreciate_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Monthly depreciation = (Value * Rate / 100) / 12
    annual_dep = asset.value * (asset.depreciation_rate / Decimal("100.0"))
    monthly_dep = annual_dep / Decimal("12.0")
    monthly_dep = round(monthly_dep, 2)

    # Post Journal Entry: Debit 5100 Depreciation Expense, Credit 1500 Equipment & Facility Assets
    entry = await AccountingEngine.create_balanced_journal_entry(
        db=db,
        description=f"Monthly Asset Depreciation for {asset.item_name}",
        ref_module=RefModule.Manual,
        ref_id=asset.id,
        lines_data=[
            {"account_code": "5100", "debit": float(monthly_dep), "credit": 0.0},
            {"account_code": "1500", "debit": 0.0, "credit": float(monthly_dep)}
        ]
    )

    return {
        "asset_name": asset.item_name,
        "monthly_depreciation": float(monthly_dep),
        "journal_entry_id": entry.id
    }
