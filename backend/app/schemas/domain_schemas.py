from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from app.models.domain import UserRole, StudentProgram, SubjectTier, RefType, AccountType, RefModule, InvoiceStatus

# Auth
class UserCreate(BaseModel):
    email: str
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    is_active: bool

# Staff
class ProfileStaffCreate(BaseModel):
    name: str
    dob: Optional[str] = None
    passport_no: Optional[str] = None
    emirates_id: str
    address: Optional[str] = None
    hourly_rate: float
    email: str
    password: str

class ProfileStaffResponse(BaseModel):
    id: str
    name: str
    emirates_id: str
    hourly_rate: float
    address: Optional[str] = None

# Parent & Student
class ParentCreate(BaseModel):
    email: str
    password: str
    phone: str
    alt_phone: Optional[str] = None

class StudentCreate(BaseModel):
    parent_id: str
    name: str
    dob: Optional[str] = None
    standard: str
    program: StudentProgram

class StudentResponse(BaseModel):
    id: str
    name: str
    standard: str
    program: StudentProgram
    parent_id: str

# Subject
class SubjectCreate(BaseModel):
    name: str
    tier: SubjectTier
    monthly_fee: float

class SubjectResponse(BaseModel):
    id: str
    name: str
    tier: SubjectTier
    monthly_fee: float

# Attendance Webhook / Scanner
class AttendanceCheckIn(BaseModel):
    ref_type: RefType
    ref_id: str

class AttendanceCheckOut(BaseModel):
    attendance_id: str

class AttendanceResponse(BaseModel):
    id: str
    ref_type: RefType
    ref_id: str
    check_in: datetime
    check_out: Optional[datetime] = None

# Inventory & POS
class InventoryItemCreate(BaseModel):
    item_name: str
    stock_qty: int
    price: float

class InventoryItemResponse(BaseModel):
    id: str
    item_name: str
    stock_qty: int
    price: float

class POSCheckoutItem(BaseModel):
    item_id: str
    qty: int

class POSCheckoutRequest(BaseModel):
    items: List[POSCheckoutItem]
    student_id: Optional[str] = None

# Double-Entry Accounting
class LedgerLineCreate(BaseModel):
    account_code: str
    debit: float = 0.0
    credit: float = 0.0

class JournalEntryCreate(BaseModel):
    description: str
    ref_module: RefModule = RefModule.Manual
    ref_id: Optional[str] = None
    lines: List[LedgerLineCreate]
