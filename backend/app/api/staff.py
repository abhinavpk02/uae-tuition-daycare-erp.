from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from app.core.database import get_db
from app.models.domain import ProfileStaff, User, UserRole
from app.schemas.domain_schemas import ProfileStaffCreate
from app.services.billing_engine import BillingEngine

router = APIRouter(prefix="/staff", tags=["Staff"])

@router.get("")
async def list_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProfileStaff).options(selectinload(ProfileStaff.user)))
    staff_members = result.scalars().all()
    
    formatted = []
    for st in staff_members:
        user_email = st.user.email if st.user else f"{st.name.lower().replace(' ', '.')}@nest.ae"
        user_role = "Teacher"
        if st.user and st.user.role:
            user_role = st.user.role.value if hasattr(st.user.role, 'value') else str(st.user.role)

        formatted.append({
            "id": st.id,
            "name": st.name,
            "dob": st.dob,
            "passport_no": st.passport_no,
            "emirates_id": st.emirates_id,
            "address": st.address,
            "hourly_rate": float(st.hourly_rate),
            "email": user_email,
            "role": user_role
        })
    return formatted

@router.post("")
async def create_staff(staff_in: ProfileStaffCreate, db: AsyncSession = Depends(get_db)):
    try:
        user = User(
            id=str(uuid.uuid4()),
            email=staff_in.email,
            hash=staff_in.password or "staff123",
            role=UserRole.Teacher,
            is_active=True
        )
        db.add(user)
        await db.flush()

        staff_profile = ProfileStaff(
            id=str(uuid.uuid4()),
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

        return {
            "id": staff_profile.id,
            "name": staff_profile.name,
            "email": staff_in.email,
            "role": "Teacher",
            "emirates_id": staff_profile.emirates_id,
            "hourly_rate": float(staff_profile.hourly_rate)
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{staff_id}/process-payroll")
async def process_staff_payroll(staff_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await BillingEngine.process_staff_payroll(db, staff_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
