import asyncio
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal, init_db
from app.models.domain import (
    User, UserRole, ProfileParent, ProfileStaff, Student, StudentProgram,
    Subject, SubjectTier, Inventory, Asset, ChartOfAccounts, AccountType,
    RefModule, Attendance, RefType, JournalEntry, LedgerLine
)
from app.services.accounting_engine import AccountingEngine


async def seed():
    print("Initializing & Clearing Database schema...")
    await init_db()

    async with AsyncSessionLocal() as db:
        print("Clearing old records...")
        await db.execute(delete(Attendance))
        await db.execute(delete(LedgerLine))
        await db.execute(delete(JournalEntry))
        await db.execute(delete(Student))
        await db.execute(delete(Inventory))
        await db.execute(delete(Asset))
        await db.execute(delete(Subject))
        await db.execute(delete(ProfileStaff))
        await db.execute(delete(ProfileParent))
        await db.execute(delete(User))
        await db.commit()

        print("Seeding Chart of Accounts (COA)...")
        coa_defaults = [
            ("1000", "Cash & Bank Balance", AccountType.Asset),
            ("1100", "Accounts Receivable", AccountType.Asset),
            ("1200", "Inventory Asset", AccountType.Asset),
            ("1500", "Fixed Assets & Equipment", AccountType.Asset),
            ("2000", "Accounts Payable", AccountType.Liability),
            ("3000", "Owner Capital / Equity", AccountType.Equity),
            ("4000", "Tuition Fee Revenue", AccountType.Revenue),
            ("4100", "Daycare Service Revenue", AccountType.Revenue),
            ("4200", "POS Sales Revenue", AccountType.Revenue),
            ("5000", "Staff Payroll Expense", AccountType.Expense),
            ("5100", "Asset Depreciation Expense", AccountType.Expense),
            ("5200", "Facility Utilities Expense", AccountType.Expense),
        ]

        for code, name, acc_type in coa_defaults:
            res = await db.execute(select(ChartOfAccounts).where(ChartOfAccounts.code == code))
            if not res.scalar_one_or_none():
                db.add(ChartOfAccounts(code=code, name=name, type=acc_type))
        await db.flush()

        print("Seeding 5 Sample Staff Users...")
        staff_data = [
            ("Fatima Al-Mansoori", "fatima@uaeerp.ae", UserRole.Teacher, "784-1992-1234567-1", Decimal("120.00")),
            ("Sarah Jenkins", "sarah.j@uaeerp.ae", UserRole.Teacher, "784-1990-2345678-2", Decimal("95.00")),
            ("Omar Al-Zahabi", "omar.z@uaeerp.ae", UserRole.Admin, "784-1988-3456789-3", Decimal("150.00")),
            ("Aisha Al-Mheiri", "aisha.m@uaeerp.ae", UserRole.Admin, "784-1995-4567890-4", Decimal("140.00")),
            ("Khalfan Al-Remeithi", "khalfan.r@uaeerp.ae", UserRole.Teacher, "784-1998-5678901-5", Decimal("85.00"))
        ]

        for name, email, role, eid, rate in staff_data:
            usr = User(email=email, hash="staff123", role=role, is_active=True)
            db.add(usr)
            await db.flush()
            db.add(ProfileStaff(
                user_id=usr.id,
                name=name,
                dob="1992-05-14",
                passport_no="N" + eid.replace("-", "")[:8],
                emirates_id=eid,
                address="Dubai, UAE",
                hourly_rate=rate
            ))
        await db.flush()

        print("Seeding SuperAdmin & Parent...")
        admin_usr = User(email="admin@uaeerp.ae", hash="admin123", role=UserRole.SuperAdmin, is_active=True)
        parent_usr = User(email="mohammed.hashimi@gmail.com", hash="parent123", role=UserRole.Parent, is_active=True)
        db.add_all([admin_usr, parent_usr])
        await db.flush()

        parent_prof = ProfileParent(user_id=parent_usr.id, phone="+971 50 123 4567", alt_phone="+971 4 398 7654")
        db.add(parent_prof)
        await db.flush()

        print("Seeding 5 Sample Students...")
        students_data = [
            ("Zayed Al-Hashimi", "Grade 10", StudentProgram.Both, parent_prof.id),
            ("Mariam Al-Hashimi", "KG 2", StudentProgram.Daycare, parent_prof.id),
            ("Sami Al-Nuaimi", "Grade 4", StudentProgram.Both, parent_prof.id),
            ("Rashid Al-Maktoum", "Grade 5", StudentProgram.Tuition, parent_prof.id),
            ("Fatima Al-Qassimi", "Grade 3", StudentProgram.Both, parent_prof.id)
        ]

        for std_name, std_grade, prog, p_id in students_data:
            db.add(Student(parent_id=p_id, name=std_name, dob="2012-01-01", standard=std_grade, program=prog))
        await db.flush()

        print("Seeding 5 Sample POS Inventory Items...")
        inventory_data = [
            ("Grade 10 Mathematics Course Book", 50, Decimal("120.00")),
            ("Daycare Uniform Set (Polo & Shorts)", 35, Decimal("150.00")),
            ("Montessori Activity & Arts Kit", 40, Decimal("75.00")),
            ("Physics & Chemistry Lab Experiment Workbook", 30, Decimal("95.00")),
            ("Healthy Daycare Snack & Juice Pack", 100, Decimal("25.00"))
        ]

        for item_name, qty, pr in inventory_data:
            db.add(Inventory(item_name=item_name, stock_qty=qty, price=pr))
        await db.flush()

        print("Seeding 5 Sample Fixed Assets...")
        assets_data = [
            ("Technology", "Interactive Smartboard Setup (Room 101)", Decimal("15000.00"), Decimal("15.00")),
            ("Technology", "Dell High-Density Server & Router Rack", Decimal("25000.00"), Decimal("20.00")),
            ("Facility", "Daycare Montessori Play & Soft Furniture", Decimal("18000.00"), Decimal("10.00")),
            ("Transportation", "Toyota Coaster Student Bus Shuttle", Decimal("140000.00"), Decimal("12.50")),
            ("Facility", "Magnetic Wall Whiteboards & Projector Set", Decimal("8500.00"), Decimal("10.00"))
        ]

        for cat, item_name, val, rate in assets_data:
            db.add(Asset(category=cat, item_name=item_name, value=val, depreciation_rate=rate))
        await db.flush()

        print("Dispatching 5 Sample Double-Entry Journal Entries...")
        await AccountingEngine.create_balanced_journal_entry(
            db=db, description="Purchase of Tuition & Daycare Equipment Assets", ref_module=RefModule.Manual,
            lines_data=[{"account_code": "1500", "debit": 12500.0, "credit": 0.0}, {"account_code": "1000", "debit": 0.0, "credit": 12500.0}]
        )
        await AccountingEngine.create_balanced_journal_entry(
            db=db, description="Initial Owner Capital Injection", ref_module=RefModule.Manual,
            lines_data=[{"account_code": "1000", "debit": 100000.0, "credit": 0.0}, {"account_code": "3000", "debit": 0.0, "credit": 100000.0}]
        )
        await AccountingEngine.create_balanced_journal_entry(
            db=db, description="Student Tuition Fee Receipt - Sami Al-Nuaimi", ref_module=RefModule.POS,
            lines_data=[{"account_code": "1000", "debit": 400.0, "credit": 0.0}, {"account_code": "4000", "debit": 0.0, "credit": 400.0}]
        )
        await AccountingEngine.create_balanced_journal_entry(
            db=db, description="Daycare Service Fee Settlement", ref_module=RefModule.POS,
            lines_data=[{"account_code": "1000", "debit": 750.0, "credit": 0.0}, {"account_code": "4100", "debit": 0.0, "credit": 750.0}]
        )
        await AccountingEngine.create_balanced_journal_entry(
            db=db, description="Monthly Facility Utilities Payment", ref_module=RefModule.Manual,
            lines_data=[{"account_code": "5200", "debit": 2200.0, "credit": 0.0}, {"account_code": "1000", "debit": 0.0, "credit": 2200.0}]
        )

        await db.commit()
        print("Successfully reset and seeded exactly 5 sample items per module!")


if __name__ == "__main__":
    asyncio.run(seed())
