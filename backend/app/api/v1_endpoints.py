from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal

from app.core.database import get_db
from app.models.domain import Student, ProfileParent, User, UserRole, ProfileStaff, StudentProgram, RefModule, ChartOfAccounts, AccountType
from app.services.accounting_engine import AccountingEngine

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
    role: str = Field("Teacher", example="Teacher")
    hourly_rate: float = Field(..., ge=0, example=120.00)
    creator_role: Optional[str] = Field("SuperAdmin", example="SuperAdmin")

# 3. Guest Quick Payment Payload Schema
class GuestPayRequest(BaseModel):
    guest_name: str = Field(..., min_length=2, example="Ahmed Al-Mansouri")
    service_type: str = Field(..., example="Drop-in Daycare") # "Drop-in Daycare", "Registration Fee", "POS Item"
    amount: float = Field(..., gt=0, example=150.00)


@router.post("/students", status_code=status.HTTP_201_CREATED)
async def create_student_v1(payload: StudentV1Create, db: AsyncSession = Depends(get_db)):
    try:
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
                hash="parent123",
                role=UserRole.Parent,
                is_active=True
            )
            db.add(parent_user)
            await db.flush()

        parent_prof_res = await db.execute(select(ProfileParent).where(ProfileParent.user_id == parent_user.id))
        parent_profile = parent_prof_res.scalar_one_or_none()

        if not parent_profile:
            parent_profile = ProfileParent(
                user_id=parent_user.id,
                phone=payload.parent_phone
            )
            db.add(parent_profile)
            await db.flush()

        # 2. Create Student Record
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
            "message": "Student registered successfully",
            "student": {
                "id": student.id,
                "name": student.name,
                "standard": student.standard,
                "program": student.program.value,
                "parent_phone": parent_profile.phone,
                "parent_email": parent_user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/staff", status_code=status.HTTP_201_CREATED)
async def create_staff_v1(payload: StaffV1Create, db: AsyncSession = Depends(get_db)):
    try:
        # Strict Rule: Only SuperAdmin and Admin can register staff entries
        creator = payload.creator_role or "SuperAdmin"
        if creator not in ['SuperAdmin', 'Admin']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Access Denied: {creator} role cannot create staff entries. Only SuperAdmin and Admin are authorized."
            )

        # 1. Check existing email or Emirates ID
        email_check = await db.execute(select(User).where(User.email == payload.email))
        if email_check.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff email is already registered")

        eid_check = await db.execute(select(ProfileStaff).where(ProfileStaff.emirates_id == payload.emirates_id))
        if eid_check.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Emirates ID is already registered")

        # Resolve UserRole Enum
        role_enum = UserRole.Admin if payload.role == "Admin" else UserRole.Teacher

        # 2. Create Staff User
        user = User(
            email=payload.email,
            hash="staff123",
            role=role_enum,
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
                "role": user.role.value,
                "hourly_rate": float(staff_profile.hourly_rate)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/billing/guest-pay", status_code=status.HTTP_201_CREATED)
async def process_guest_payment(payload: GuestPayRequest, db: AsyncSession = Depends(get_db)):
    """
    Guest Quick Payment Endpoint for 1-Timers (Drop-in Daycare, Registration Fee, POS Item).
    Bypasses `students` and `invoices` tables entirely.
    Directly writes a double-entry JournalEntry and LedgerLines:
      - Debit: Cash / Bank Balance (1000)
      - Credit: Revenue Account (4100 / 4000 / 4200)
    """
    try:
        rev_code = "4100"
        if payload.service_type == "Registration Fee":
            rev_code = "4000"
        elif payload.service_type == "POS Item":
            rev_code = "4200"

        rev_res = await db.execute(select(ChartOfAccounts).where(ChartOfAccounts.code == rev_code))
        rev_acc = rev_res.scalar_one_or_none()
        if not rev_acc:
            rev_res = await db.execute(select(ChartOfAccounts).where(ChartOfAccounts.type == AccountType.Revenue))
            rev_acc = rev_res.scalars().first()
            if rev_acc:
                rev_code = rev_acc.code

        description = f"Guest Quick Pay ({payload.service_type}) - {payload.guest_name}"
        
        lines_data = [
            {"account_code": "1000", "debit": payload.amount, "credit": 0.0},
            {"account_code": rev_code, "debit": 0.0, "credit": payload.amount}
        ]

        journal_entry = await AccountingEngine.create_balanced_journal_entry(
            db=db,
            description=description,
            ref_module=RefModule.POS,
            lines_data=lines_data
        )

        return {
            "status": "success",
            "message": f"Guest payment of AED {payload.amount:.2f} processed successfully for {payload.guest_name}",
            "journal_entry_id": journal_entry.id,
            "guest_name": payload.guest_name,
            "service_type": payload.service_type,
            "amount": payload.amount,
            "debit_account": "1000 (Cash & Bank Balance)",
            "credit_account": f"{rev_code} (Revenue Account)"
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
