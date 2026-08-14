import asyncio
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.models.domain import (
    User, UserRole, ProfileParent, ProfileStaff, Student, StudentProgram,
    Subject, SubjectTier, Inventory, Asset, ChartOfAccounts, AccountType,
    RefModule, Attendance, RefType
)
from app.services.accounting_engine import AccountingEngine


async def seed():
    print("Initializing Database schema...")
    await init_db()

    async with AsyncSessionLocal() as db:
        print("Seeding Chart of Accounts (COA)...")
        coa_defaults = [
            ("1000", "Cash & Bank Account", AccountType.Asset),
            ("1100", "Accounts Receivable", AccountType.Asset),
            ("1200", "Inventory Asset", AccountType.Asset),
            ("1500", "Equipment & Facility Assets", AccountType.Asset),
            ("2000", "Accounts Payable", AccountType.Liability),
            ("3000", "Owner Capital / Equity", AccountType.Equity),
            ("4000", "Tuition Fee Revenue", AccountType.Revenue),
            ("4100", "Daycare Fee Revenue", AccountType.Revenue),
            ("4200", "POS Sales Revenue", AccountType.Revenue),
            ("5000", "Staff Payroll Expense", AccountType.Expense),
            ("5100", "Asset Depreciation Expense", AccountType.Expense),
            ("5200", "Facility Utilities Expense", AccountType.Expense),
        ]

        coa_map = {}
        for code, name, acc_type in coa_defaults:
            res = await db.execute(select(ChartOfAccounts).where(ChartOfAccounts.code == code))
            existing = res.scalar_one_or_none()
            if not existing:
                acc = ChartOfAccounts(code=code, name=name, type=acc_type)
                db.add(acc)
                coa_map[code] = acc
            else:
                coa_map[code] = existing

        await db.flush()


        print("Seeding Admin & Staff Users...")
        res_usr = await db.execute(select(User).where(User.email == "admin@uaeerp.ae"))
        if not res_usr.scalar_one_or_none():
            # SuperAdmin
            admin_user = User(
                email="admin@uaeerp.ae",
                hash="admin123",
                role=UserRole.SuperAdmin,
                is_active=True
            )
            db.add(admin_user)

            # Staff (Teacher/Daycare Supervisor)
            staff_user = User(
                email="fatima.mansoori@uaeerp.ae",
                hash="staff123",
                role=UserRole.Teacher,
                is_active=True
            )
            db.add(staff_user)
            await db.flush()

            staff_profile = ProfileStaff(
                user_id=staff_user.id,
                name="Fatima Al-Mansoori",
                dob="1992-05-14",
                passport_no="N9876543",
                emirates_id="784-1992-1234567-1",
                address="Al Wasl Road, Villa 42, Dubai, UAE",
                hourly_rate=Decimal("120.00")
            )
            db.add(staff_profile)


        print("Seeding Parent & Student Profiles...")
        res_p = await db.execute(select(User).where(User.email == "mohammed.hashimi@gmail.com"))
        if not res_p.scalar_one_or_none():
            parent_user = User(
                email="mohammed.hashimi@gmail.com",
                hash="parent123",
                role=UserRole.Parent,
                is_active=True
            )
            db.add(parent_user)
            await db.flush()

            parent_profile = ProfileParent(
                user_id=parent_user.id,
                phone="+971 50 123 4567",
                alt_phone="+971 4 398 7654"
            )
            db.add(parent_profile)
            await db.flush()

            student1 = Student(
                parent_id=parent_profile.id,
                name="Zayed Al-Hashimi",
                dob="2010-08-20",
                standard="Grade 10",
                program=StudentProgram.Both
            )
            student2 = Student(
                parent_id=parent_profile.id,
                name="Mariam Al-Hashimi",
                dob="2020-03-11",
                standard="KG 2",
                program=StudentProgram.Daycare
            )
            db.add_all([student1, student2])


        print("Seeding Subjects...")
        res_sub = await db.execute(select(Subject).where(Subject.name == "Advanced Mathematics"))
        if not res_sub.scalar_one_or_none():
            sub1 = Subject(name="Advanced Mathematics", tier=SubjectTier.HSS, monthly_fee=Decimal("1200.00"))
            sub2 = Subject(name="Physics & Chemistry Lab", tier=SubjectTier.HS, monthly_fee=Decimal("950.00"))
            sub3 = Subject(name="English Literature", tier=SubjectTier.HS, monthly_fee=Decimal("800.00"))
            db.add_all([sub1, sub2, sub3])

        print("Seeding POS Inventory...")
        res_inv = await db.execute(select(Inventory).where(Inventory.item_name == "Grade 10 Mathematics Course Book"))
        if not res_inv.scalar_one_or_none():
            inv1 = Inventory(item_name="Grade 10 Mathematics Course Book", stock_qty=50, price=Decimal("120.00"))
            inv2 = Inventory(item_name="Daycare Uniform Set (Polo & Shorts)", stock_qty=35, price=Decimal("150.00"))
            inv3 = Inventory(item_name="Montessori Activity Kit", stock_qty=40, price=Decimal("75.00"))
            db.add_all([inv1, inv2, inv3])


        print("Seeding Fixed Assets...")
        res_a1 = await db.execute(select(Asset).where(Asset.item_name == "Interactive Smartboard Setup"))
        if not res_a1.scalar_one_or_none():
            asset1 = Asset(category="Technology", item_name="Interactive Smartboard Setup", value=Decimal("15000.00"), depreciation_rate=Decimal("15.00"))
            asset2 = Asset(category="Facility", item_name="Daycare Montessori Play Equipment", value=Decimal("10000.00"), depreciation_rate=Decimal("10.00"))
            db.add_all([asset1, asset2])


        await db.commit()
        
        # Fetch student and staff for initial logs if needed
        st_res = await db.execute(select(Student).where(Student.name == "Zayed Al-Hashimi"))
        student1 = st_res.scalar_one_or_none()

        sp_res = await db.execute(select(ProfileStaff).where(ProfileStaff.name == "Fatima Al-Mansoori"))
        staff_profile = sp_res.scalar_one_or_none()

        # Seed initial attendance logs if none exist
        att_check = await db.execute(select(Attendance))
        if not att_check.scalars().first() and student1 and staff_profile:
            print("Seeding Sample Attendance Logs for Daycare & Staff...")
            now = datetime.utcnow()
            att_student = Attendance(
                ref_type=RefType.Student,
                ref_id=student1.id,
                check_in=now - timedelta(hours=4),
                check_out=now
            )
            att_staff = Attendance(
                ref_type=RefType.Staff,
                ref_id=staff_profile.id,
                check_in=now - timedelta(hours=8),
                check_out=now
            )
            db.add_all([att_student, att_staff])
            await db.commit()

        # Seed initial ledger entries if none exist
        je_check = await db.execute(select(AccountingEngine).where(False) if False else select(Attendance)) # just check entries
        from app.models.domain import JournalEntry
        je_res = await db.execute(select(JournalEntry))
        if not je_res.scalars().first():
            print("Dispatching Opening Capital & Facility Ledger Entries...")
            await AccountingEngine.create_balanced_journal_entry(
                db=db,
                description="Initial Owner Capital Injection",
                ref_module=RefModule.Manual,
                lines_data=[
                    {"account_code": "1000", "debit": 100000.0, "credit": 0.0},
                    {"account_code": "3000", "debit": 0.0, "credit": 100000.0}
                ]
            )

            await AccountingEngine.create_balanced_journal_entry(
                db=db,
                description="Purchase of Tuition & Daycare Equipment Assets",
                ref_module=RefModule.Manual,
                lines_data=[
                    {"account_code": "1500", "debit": 25000.0, "credit": 0.0},
                    {"account_code": "1000", "debit": 0.0, "credit": 25000.0}
                ]
            )

        print("Successfully seeded UAE Tuition & Daycare ERP database!")


if __name__ == "__main__":
    asyncio.run(seed())
