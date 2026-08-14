from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.domain import ChartOfAccounts, JournalEntry, LedgerLine
from app.schemas.domain_schemas import JournalEntryCreate
from app.services.accounting_engine import AccountingEngine, AccountingError

router = APIRouter(prefix="/accounting", tags=["Accounting"])

@router.get("/chart-of-accounts")
async def list_chart_of_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChartOfAccounts).order_by(ChartOfAccounts.code))
    accounts = result.scalars().all()
    return accounts

@router.get("/journal-entries")
async def list_journal_entries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JournalEntry).order_by(JournalEntry.date.desc()))
    entries = result.scalars().all()
    
    formatted = []
    for entry in entries:
        lines_res = await db.execute(select(LedgerLine).where(LedgerLine.entry_id == entry.id))
        lines = lines_res.scalars().all()
        formatted.append({
            "id": entry.id,
            "date": entry.date.isoformat(),
            "description": entry.description,
            "ref_module": entry.ref_module.value,
            "ref_id": entry.ref_id,
            "lines": [
                {
                    "id": l.id,
                    "account_id": l.account_id,
                    "debit": float(l.debit),
                    "credit": float(l.credit)
                } for l in lines
            ]
        })
    return formatted

@router.post("/journal-entry")
async def create_journal_entry(data: JournalEntryCreate, db: AsyncSession = Depends(get_db)):
    try:
        lines_payload = [
            {"account_code": l.account_code, "debit": l.debit, "credit": l.credit}
            for l in data.lines
        ]
        entry = await AccountingEngine.create_balanced_journal_entry(
            db=db,
            description=data.description,
            ref_module=data.ref_module,
            lines_data=lines_payload,
            ref_id=data.ref_id
        )
        return {"status": "success", "journal_entry_id": entry.id}
    except AccountingError as ae:
        raise HTTPException(status_code=400, detail=str(ae))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
