from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.domain import Attendance, RefType
from app.schemas.domain_schemas import AttendanceCheckIn, AttendanceCheckOut, AttendanceResponse

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("", response_model=List[AttendanceResponse])
async def list_attendance(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Attendance).order_by(Attendance.check_in.desc()))
    records = result.scalars().all()
    return records

@router.post("/check-in", response_model=AttendanceResponse)
async def check_in(data: AttendanceCheckIn, db: AsyncSession = Depends(get_db)):
    att = Attendance(
        ref_type=data.ref_type,
        ref_id=data.ref_id,
        check_in=datetime.utcnow()
    )
    db.add(att)
    await db.commit()
    await db.refresh(att)
    return att

@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(data: AttendanceCheckOut, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Attendance).where(Attendance.id == data.attendance_id))
    att = result.scalar_one_or_none()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    if att.check_out is not None:
        raise HTTPException(status_code=400, detail="Already checked out")

    att.check_out = datetime.utcnow()
    await db.commit()
    await db.refresh(att)
    return att
