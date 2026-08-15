import asyncio
import uuid
from decimal import Decimal
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal, init_db
from app.models.domain import (
    User, ProfileParent, ProfileStaff, Student, Subject,
    Inventory, Asset, ChartOfAccounts, AccountType, Attendance,
    JournalEntry, LedgerLine, UserRole, StudentProgram
)

async def ensure_seeded():
    """Initializes tables and seeds initial data if database tables are empty."""
    try:
        await init_db()
    except Exception as e:
        print(f"init_db info: {e}")

    async with AsyncSessionLocal() as db:
        try:
            res = await db.execute(select(ChartOfAccounts))
            if not res.scalars().first():
                print("Seeding initial Chart of Accounts...")
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
                    db.add(ChartOfAccounts(code=code, name=name, type=acc_type))
                await db.commit()

            st_res = await db.execute(select(Student))
            if not st_res.scalars().first():
                print("Seeding initial Student & Staff records...")
                parent_user = User(
                    id=str(uuid.uuid4()),
                    email="parent.hashimi@nest.ae",
                    role=UserRole.Parent,
                    hash="pbkdf2_sha256_hashed_secret",
                    is_active=True
                )
                db.add(parent_user)
                await db.flush()

                parent_profile = ProfileParent(
                    id=str(uuid.uuid4()),
                    user_id=parent_user.id,
                    phone="+971 50 123 4567"
                )
                db.add(parent_profile)
                await db.flush()

                student_zayed = Student(
                    id="std-101",
                    parent_id=parent_profile.id,
                    name="Zayed Al-Hashimi",
                    dob="2012-05-14",
                    standard="Grade 10",
                    program=StudentProgram.Both
                )
                db.add(student_zayed)

                staff_user = User(
                    id=str(uuid.uuid4()),
                    email="fatima.mansoori@nest.ae",
                    role=UserRole.Teacher,
                    hash="pbkdf2_sha256_hashed_secret",
                    is_active=True
                )
                db.add(staff_user)
                await db.flush()

                staff_fatima = ProfileStaff(
                    id="stf-201",
                    user_id=staff_user.id,
                    name="Fatima Al-Mansoori",
                    emirates_id="784-1992-8821941-1",
                    hourly_rate=Decimal("120.00"),
                    dob="1992-03-20",
                    address="Al Wasl Road, Villa 42, Dubai, UAE"
                )
                db.add(staff_fatima)
                await db.commit()
                print("✔ Database successfully auto-seeded.")
        except Exception as e:
            await db.rollback()
            print(f"⚠ ensure_seeded error (handled): {e}")

async def wipe_and_seed():
    print("Initializing Database schema...")
    await init_db()

    async with AsyncSessionLocal() as db:
        print("Step 1: Truncating tables...")
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
        await db.execute(delete(ChartOfAccounts))
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
            db.add(ChartOfAccounts(code=code, name=name, type=acc_type))
        await db.commit()

        print("Step 2: Seeding realistic UAE test data matching UI...")
        
        parent_user = User(
            id=str(uuid.uuid4()),
            email="parent.hashimi@nest.ae",
            role=UserRole.Parent,
            hash="pbkdf2_sha256_hashed_secret",
            is_active=True
        )
        db.add(parent_user)
        await db.flush()

        parent_profile = ProfileParent(
            id=str(uuid.uuid4()),
            user_id=parent_user.id,
            phone="+971 50 123 4567"
        )
        db.add(parent_profile)
        await db.flush()

        student_zayed = Student(
            id="std-101",
            parent_id=parent_profile.id,
            name="Zayed Al-Hashimi",
            dob="2012-05-14",
            standard="Grade 10",
            program=StudentProgram.Both
        )
        db.add(student_zayed)

        staff_user = User(
            id=str(uuid.uuid4()),
            email="fatima.mansoori@nest.ae",
            role=UserRole.Teacher,
            hash="pbkdf2_sha256_hashed_secret",
            is_active=True
        )
        db.add(staff_user)
        await db.flush()

        staff_fatima = ProfileStaff(
            id="stf-201",
            user_id=staff_user.id,
            name="Fatima Al-Mansoori",
            emirates_id="784-1992-8821941-1",
            hourly_rate=Decimal("120.00"),
            dob="1992-03-20",
            address="Al Wasl Road, Villa 42, Dubai, UAE"
        )
        db.add(staff_fatima)

        await db.commit()
        print("Successfully wiped and seeded UAE test data!")

if __name__ == "__main__":
    asyncio.run(wipe_and_seed())
