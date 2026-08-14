import uuid
import enum
from datetime import datetime, date
from typing import List, Optional
from decimal import Decimal

from sqlalchemy import (
    String, Text, Integer, Numeric, Boolean, DateTime, Date, Enum as SQLEnum,
    ForeignKey, PrimaryKeyConstraint, Table, Column, CheckConstraint, Index
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

# Enums
class UserRole(str, enum.Enum):
    SuperAdmin = "SuperAdmin"
    Admin = "Admin"
    Teacher = "Teacher"
    Parent = "Parent"

class StudentProgram(str, enum.Enum):
    Tuition = "Tuition"
    Daycare = "Daycare"
    Both = "Both"

class SubjectTier(str, enum.Enum):
    HS = "HS"      # High School
    HSS = "HSS"    # Higher Secondary School

class RefType(str, enum.Enum):
    Student = "Student"
    Staff = "Staff"

class AccountType(str, enum.Enum):
    Asset = "Asset"
    Liability = "Liability"
    Equity = "Equity"
    Revenue = "Revenue"
    Expense = "Expense"

class RefModule(str, enum.Enum):
    POS = "POS"
    Payroll = "Payroll"
    Invoice = "Invoice"
    Manual = "Manual"

class InvoiceStatus(str, enum.Enum):
    Draft = "Draft"
    Issued = "Issued"
    Paid = "Paid"
    Overdue = "Overdue"


# Association tables for M2M relationships
enrollments = Table(
    "enrollments",
    Base.metadata,
    Column("student_id", String(36), ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
    Column("subject_id", String(36), ForeignKey("subjects.id", ondelete="CASCADE"), primary_key=True)
)

staff_subjects = Table(
    "staff_subjects",
    Base.metadata,
    Column("staff_id", String(36), ForeignKey("profiles_staff.id", ondelete="CASCADE"), primary_key=True),
    Column("subject_id", String(36), ForeignKey("subjects.id", ondelete="CASCADE"), primary_key=True)
)


# 1. Core & RBAC
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    parent_profile: Mapped[Optional["ProfileParent"]] = relationship("ProfileParent", back_populates="user", uselist=False)
    staff_profile: Mapped[Optional["ProfileStaff"]] = relationship("ProfileStaff", back_populates="user", uselist=False)


class ProfileParent(Base):
    __tablename__ = "profiles_parent"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    alt_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="parent_profile")
    students: Mapped[List["Student"]] = relationship("Student", back_populates="parent")


class ProfileStaff(Base):
    __tablename__ = "profiles_staff"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    dob: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    passport_no: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    emirates_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hourly_rate: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="staff_profile")
    subjects: Mapped[List["Subject"]] = relationship("Subject", secondary=staff_subjects, back_populates="staff_members")
    timetable_slots: Mapped[List["Timetable"]] = relationship("Timetable", back_populates="staff")


# 2. Academic & Daycare
class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    parent_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles_parent.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    dob: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    standard: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. Grade 10, KG 2
    program: Mapped[StudentProgram] = mapped_column(SQLEnum(StudentProgram), nullable=False, default=StudentProgram.Tuition)

    parent: Mapped["ProfileParent"] = relationship("ProfileParent", back_populates="students")
    subjects: Mapped[List["Subject"]] = relationship("Subject", secondary=enrollments, back_populates="students")
    invoices: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="student")


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    tier: Mapped[SubjectTier] = mapped_column(SQLEnum(SubjectTier), nullable=False)
    monthly_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    students: Mapped[List["Student"]] = relationship("Student", secondary=enrollments, back_populates="subjects")
    staff_members: Mapped[List["ProfileStaff"]] = relationship("ProfileStaff", secondary=staff_subjects, back_populates="subjects")
    timetable_slots: Mapped[List["Timetable"]] = relationship("Timetable", back_populates="subject")


class Timetable(Base):
    __tablename__ = "timetable"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(String(50), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    staff_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles_staff.id", ondelete="CASCADE"), nullable=False)
    start_time: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. "09:00 AM"
    end_time: Mapped[str] = mapped_column(String(20), nullable=False)   # e.g. "10:30 AM"

    subject: Mapped["Subject"] = relationship("Subject", back_populates="timetable_slots")
    staff: Mapped["ProfileStaff"] = relationship("ProfileStaff", back_populates="timetable_slots")


# 3. Operations & Assets
class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ref_type: Mapped[RefType] = mapped_column(SQLEnum(RefType), nullable=False)
    ref_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    check_in: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    check_out: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    stock_qty: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0.00)


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0.00)
    depreciation_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=0.00) # e.g. 10.00 (%)


# 4. Accounting & Billing (Double-Entry Engine)
class ChartOfAccounts(Base):
    __tablename__ = "chart_of_accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[AccountType] = mapped_column(SQLEnum(AccountType), nullable=False)

    ledger_lines: Mapped[List["LedgerLine"]] = relationship("LedgerLine", back_populates="account")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    ref_module: Mapped[RefModule] = mapped_column(SQLEnum(RefModule), nullable=False)
    ref_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    lines: Mapped[List["LedgerLine"]] = relationship("LedgerLine", back_populates="journal_entry", cascade="all, delete-orphan")


class LedgerLine(Base):
    __tablename__ = "ledger_lines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entry_id: Mapped[str] = mapped_column(String(36), ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False)
    account_id: Mapped[str] = mapped_column(String(36), ForeignKey("chart_of_accounts.id", ondelete="RESTRICT"), nullable=False)
    debit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    credit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)

    journal_entry: Mapped["JournalEntry"] = relationship("JournalEntry", back_populates="lines")
    account: Mapped["ChartOfAccounts"] = relationship("ChartOfAccounts", back_populates="ledger_lines")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.id", ondelete="RESTRICT"), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    status: Mapped[InvoiceStatus] = mapped_column(SQLEnum(InvoiceStatus), default=InvoiceStatus.Draft, nullable=False)
    due_date: Mapped[str] = mapped_column(String(20), nullable=False)

    student: Mapped["Student"] = relationship("Student", back_populates="invoices")
    items: Mapped[List["InvoiceItem"]] = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id: Mapped[str] = mapped_column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")


# 5. RBAC Permissions Management
class RolePermission(Base):
    __tablename__ = "role_permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    manage_students_staff: Mapped[bool] = mapped_column(Boolean, default=True)
    admissions_onboarding: Mapped[bool] = mapped_column(Boolean, default=True)
    operational_details: Mapped[bool] = mapped_column(Boolean, default=True)

