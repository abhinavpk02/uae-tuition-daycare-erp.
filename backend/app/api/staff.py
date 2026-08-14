from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.domain import ProfileStaff, User, UserRole
from app.schemas.domain_schemas import ProfileStaffCreate, ProfileStaffResponse
from app.services.billing_engine import BillingEngine

router = APIRouter(prefix="/staff", tags=["Staff"])

@router.get("", response_model=List[ProfileStaffResponse])
async def list_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProfileStaff))
    staff_members = result.scalars().all()
    return staff_members

@router.post("", response_model=ProfileStaffResponse)
async def create_staff(staff_in: ProfileStaffCreate, db: AsyncSession = Depends(get_db)):
    # Create user first
    user = User(
        email=staff_in.email,
        hash=staff_in.password,
        role=UserRole.Teacher,
        is_active=True
    )
    db.add(user)
    await db.flush()

    staff_profile = ProfileStaff(
        user_id=user.id,
        name=staff_in.name,
        dob=staff_in.dob,
        passport_no=staff_in.passport_no,
        emirates_id=staff_in.emirates_id,
        address=staff_in.address,
        hourly_rate=staff_in.hourly_rate
    )
    db.add(staff_profile)
    await db.commit()
    await db.refresh(staff_profile)
    return staff_profile

@router.post("/{staff_id}/process-payroll")
async def process_staff_payroll(staff_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await BillingEngine.process_staff_payroll(db, staff_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
