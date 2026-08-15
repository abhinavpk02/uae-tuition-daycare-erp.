import asyncio
from sqlalchemy import delete
from app.core.database import AsyncSessionLocal, init_db
from app.models.domain import (
    User, ProfileParent, ProfileStaff, Student, Subject,
    Inventory, Asset, ChartOfAccounts, AccountType, Attendance,
    JournalEntry, LedgerLine
)

async def seed():
    print("Initializing & Clearing Database schema...")
    await init_db()

    async with AsyncSessionLocal() as db:
        print("Clearing all data tables completely...")
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

        print("Seeding Chart of Accounts (COA) structure only...")
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

        print("Database completely cleared of all students, staff, inventory, assets, and logs!")

if __name__ == "__main__":
    asyncio.run(seed())
