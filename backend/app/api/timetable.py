from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.models.domain import Timetable, Subject, ProfileStaff

router = APIRouter(prefix="/timetable", tags=["Timetable"])

class TimetableCreate(BaseModel):
    room_id: str
    subject_id: str
    staff_id: str
    start_time: str
    end_time: str

@router.get("")
async def list_timetable(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Timetable))
    slots = result.scalars().all()
    
    formatted = []
    for s in slots:
        subj = await db.execute(select(Subject).where(Subject.id == s.subject_id))
        stf = await db.execute(select(ProfileStaff).where(ProfileStaff.id == s.staff_id))
        subject_obj = subj.scalar_one_or_none()
        staff_obj = stf.scalar_one_or_none()

        formatted.append({
            "id": s.id,
            "room_id": s.room_id,
            "subject_name": subject_obj.name if subject_obj else "N/A",
            "staff_name": staff_obj.name if staff_obj else "N/A",
            "start_time": s.start_time,
            "end_time": s.end_time
        })
    return formatted

@router.post("")
async def create_timetable_slot(data: TimetableCreate, db: AsyncSession = Depends(get_db)):
    slot = Timetable(
        room_id=data.room_id,
        subject_id=data.subject_id,
        staff_id=data.staff_id,
        start_time=data.start_time,
        end_time=data.end_time
    )
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return slot
