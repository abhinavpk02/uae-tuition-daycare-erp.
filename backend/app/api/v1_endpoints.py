from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from typing import Optional, List
from decimal import Decimal

from app.core.database import get_db
from app.models.domain import Student, ProfileParent, User, UserRole, ProfileStaff, StudentProgram

router = APIRouter(prefix="/v1", tags=["V1 Core Data Entry"])

# 1. Student Payload Schema
class StudentV1Create(BaseModel):
    name: str = Field(..., min_length=2, example="Zayed Al-Hashimi")
    dob: Optional[str] = Field(None, example="2012-05-14")
    standard: str = Field(..., example="Grade 10")
    program: StudentProgram = Field(StudentProgram.Both, example="Both")
    parent_phone: str = Field(..., example="+971 50 123 4567")
    parent_email: str = Field(..., example="parent@uaeerp.ae")
    creator_role: Optional[str] = Field("SuperAdmin", example="SuperAdmin")

# 2. Staff Payload Schema
class StaffV1Create(BaseModel):
    name: str = Field(..., min_length=2, example="Fatima Al-Mansoori")
    email: str = Field(..., example="fatima@uaeerp.ae")
    dob: Optional[str] = Field(None, example="1992-03-20")
    passport_no: Optional[str] = Field(None, example="N9876543")
    emirates_id: str = Field(..., example="784-1992-1234567-1")
    address: Optional[str] = Field(None, example="Al Wasl Road, Villa 42, Dubai, UAE")
    role: UserRole = Field(UserRole.Teacher, example="Teacher")
    hourly_rate: float = Field(..., ge=0, example=120.00)
    creator_role: Optional[str] = Field("SuperAdmin", example="SuperAdmin")


@router.post("/students", status_code=status.HTTP_201_CREATED)
async def create_student_v1(payload: StudentV1Create, db: AsyncSession = Depends(get_db)):
    # Strict Rule: Only SuperAdmin and Admin can register new student entries
    creator = payload.creator_role or "SuperAdmin"
    if creator not in ['SuperAdmin', 'Admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Access Denied: {creator} role cannot create student entries. Only SuperAdmin and Admin are authorized."
        )


    # 1. Lookup or create Parent User & ProfileParent
    usr_res = await db.execute(select(User).where(User.email == payload.parent_email))
    parent_user = usr_res.scalar_one_or_none()

    if not parent_user:
        parent_user = User(
            email=payload.parent_email,
            hash="parent123", # default placeholder hash
            role=UserRole.Parent,
            is_active=True
        )
        db.add(parent_user)
        await db.flush()

    # Lookup or create ProfileParent
    prt_res = await db.execute(select(ProfileParent).where(ProfileParent.user_id == parent_user.id))
    parent_profile = prt_res.scalar_one_or_none()

    if not parent_profile:
        parent_profile = ProfileParent(
            user_id=parent_user.id,
            phone=payload.parent_phone,
            alt_phone=None
        )
        db.add(parent_profile)
        await db.flush()

    # 2. Create Student
    student = Student(
        parent_id=parent_profile.id,
        name=payload.name,
        dob=payload.dob,
        standard=payload.standard,
        program=payload.program
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)

    return {
        "status": "success",
        "message": "Student added successfully",
        "student": {
            "id": student.id,
            "name": student.name,
            "standard": student.standard,
            "program": student.program.value,
            "parent_id": student.parent_id
        }
    }


@router.post("/staff", status_code=status.HTTP_201_CREATED)
async def create_staff_v1(payload: StaffV1Create, db: AsyncSession = Depends(get_db)):
    creator = payload.creator_role or "SuperAdmin"

    # Enforce Creation Boundaries:
    # 1. Teachers cannot add staff entries at all (only Students/Parents)
    if creator in ["Teacher", "Parent"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"{creator}s are not permitted to onboard staff members. Staff onboarding is restricted to Admin & SuperAdmin."
        )

    # 2. Admin can only add up to Teacher (cannot add SuperAdmin or Admin)
    if creator == "Admin" and payload.role in [UserRole.Admin, UserRole.SuperAdmin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin role can only onboard Teacher / Staff members. Only SuperAdmin can create new Admin accounts."
        )

    # 1. Check existing email or Emirates ID
    email_check = await db.execute(select(User).where(User.email == payload.email))
    if email_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Staff email is already registered")

    eid_check = await db.execute(select(ProfileStaff).where(ProfileStaff.emirates_id == payload.emirates_id))
    if eid_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Emirates ID is already registered")

    # 2. Create Staff User
    user = User(
        email=payload.email,
        hash="staff123",
        role=payload.role,
        is_active=True
    )
    db.add(user)
    await db.flush()

    # 3. Create Staff Profile
    staff_profile = ProfileStaff(
        user_id=user.id,
        name=payload.name,
        dob=payload.dob,
        passport_no=payload.passport_no,
        emirates_id=payload.emirates_id,
        address=payload.address,
        hourly_rate=Decimal(str(payload.hourly_rate))
    )
    db.add(staff_profile)
    await db.commit()
    await db.refresh(staff_profile)

    return {
        "status": "success",
        "message": "Staff member onboarded successfully",
        "staff": {
            "id": staff_profile.id,
            "name": staff_profile.name,
            "email": payload.email,
            "emirates_id": staff_profile.emirates_id,
            "role": payload.role.value,
            "hourly_rate": float(staff_profile.hourly_rate)
        }
    }
