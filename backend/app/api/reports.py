from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.accounting_engine import AccountingEngine

router = APIRouter(prefix="/reports", tags=["Financial Reports"])

@router.get("/trial-balance")
async def get_trial_balance(db: AsyncSession = Depends(get_db)):
    try:
        report = await AccountingEngine.get_trial_balance(db)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pnl")
async def get_pnl_statement(db: AsyncSession = Depends(get_db)):
    try:
        report = await AccountingEngine.get_pnl_statement(db)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/balance-sheet")
async def get_balance_sheet(db: AsyncSession = Depends(get_db)):
    try:
        report = await AccountingEngine.get_balance_sheet(db)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
