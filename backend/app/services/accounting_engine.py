from decimal import Decimal
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.domain import (
    ChartOfAccounts, JournalEntry, LedgerLine, AccountType, RefModule
)

class AccountingError(Exception):
    pass

class AccountingEngine:
    @staticmethod
    async def create_balanced_journal_entry(
        db: AsyncSession,
        description: str,
        ref_module: RefModule,
        lines_data: List[Dict[str, Any]], # [{"account_code": "1000", "debit": 100.0, "credit": 0.0}, ...]
        ref_id: Optional[str] = None,
        entry_date: Optional[datetime] = None
    ) -> JournalEntry:
        """
        Validates double-entry accounting rule: SUM(debit) == SUM(credit)
        and persists JournalEntry with LedgerLines.
        """
        total_debit = Decimal("0.00")
        total_credit = Decimal("0.00")
        prepared_lines = []

        for line in lines_data:
            code = line["account_code"]
            debit = Decimal(str(line.get("debit", 0)))
            credit = Decimal(str(line.get("credit", 0)))

            total_debit += debit
            total_credit += credit

            # Fetch account by code
            result = await db.execute(select(ChartOfAccounts).where(ChartOfAccounts.code == code))
            account = result.scalar_one_or_none()
            if not account:
                raise AccountingError(f"Chart of Account with code '{code}' not found.")

            prepared_lines.append({
                "account_id": account.id,
                "debit": debit,
                "credit": credit
            })

        # Strict Double-Entry Validation Constraint
        if round(total_debit, 2) != round(total_credit, 2):
            raise AccountingError(
                f"Double-entry unbalanced constraint failed! Total Debit ({total_debit}) != Total Credit ({total_credit})."
            )

        entry = JournalEntry(
            date=entry_date or datetime.utcnow(),
            description=description,
            ref_module=ref_module,
            ref_id=ref_id
        )
        db.add(entry)
        await db.flush() # get entry.id

        for pl in prepared_lines:
            ll = LedgerLine(
                entry_id=entry.id,
                account_id=pl["account_id"],
                debit=pl["debit"],
                credit=pl["credit"]
            )
            db.add(ll)

        await db.commit()
        await db.refresh(entry)
        return entry

    @staticmethod
    async def get_trial_balance(db: AsyncSession) -> Dict[str, Any]:
        """
        Calculates trial balance for all accounts: Sum(debit) vs Sum(credit) and net balance.
        """
        result = await db.execute(select(ChartOfAccounts))
        accounts = result.scalars().all()

        trial_balance_rows = []
        grand_total_debit = Decimal("0.00")
        grand_total_credit = Decimal("0.00")

        for acc in accounts:
            line_result = await db.execute(
                select(
                    func.coalesce(func.sum(LedgerLine.debit), 0).label("sum_debit"),
                    func.coalesce(func.sum(LedgerLine.credit), 0).label("sum_credit")
                ).where(LedgerLine.account_id == acc.id)
            )
            row = line_result.one()
            s_debit = Decimal(str(row.sum_debit))
            s_credit = Decimal(str(row.sum_credit))

            grand_total_debit += s_debit
            grand_total_credit += s_credit

            net = s_debit - s_credit

            trial_balance_rows.append({
                "account_id": acc.id,
                "code": acc.code,
                "name": acc.name,
                "type": acc.type.value,
                "total_debit": float(s_debit),
                "total_credit": float(s_credit),
                "net_balance": float(net)
            })

        return {
            "accounts": trial_balance_rows,
            "grand_total_debit": float(grand_total_debit),
            "grand_total_credit": float(grand_total_credit),
            "is_balanced": round(grand_total_debit, 2) == round(grand_total_credit, 2)
        }

    @staticmethod
    async def get_pnl_statement(db: AsyncSession) -> Dict[str, Any]:
        """
        Generates P&L (Profit and Loss Statement): Revenue vs Expense accounts.
        """
        result = await db.execute(
            select(ChartOfAccounts).where(
                ChartOfAccounts.type.in_([AccountType.Revenue, AccountType.Expense])
            )
        )
        accounts = result.scalars().all()

        revenues = []
        expenses = []
        total_revenue = Decimal("0.00")
        total_expense = Decimal("0.00")

        for acc in accounts:
            line_result = await db.execute(
                select(
                    func.coalesce(func.sum(LedgerLine.debit), 0).label("sum_debit"),
                    func.coalesce(func.sum(LedgerLine.credit), 0).label("sum_credit")
                ).where(LedgerLine.account_id == acc.id)
            )
            row = line_result.one()
            s_debit = Decimal(str(row.sum_debit))
            s_credit = Decimal(str(row.sum_credit))

            if acc.type == AccountType.Revenue:
                # Revenue normal balance is Credit
                net = s_credit - s_debit
                total_revenue += net
                revenues.append({
                    "code": acc.code,
                    "name": acc.name,
                    "amount": float(net)
                })
            else: # Expense
                # Expense normal balance is Debit
                net = s_debit - s_credit
                total_expense += net
                expenses.append({
                    "code": acc.code,
                    "name": acc.name,
                    "amount": float(net)
                })

        net_profit = total_revenue - total_expense

        return {
            "revenues": revenues,
            "total_revenue": float(total_revenue),
            "expenses": expenses,
            "total_expense": float(total_expense),
            "net_profit": float(net_profit)
        }

    @staticmethod
    async def get_balance_sheet(db: AsyncSession) -> Dict[str, Any]:
        """
        Generates Balance Sheet: Assets = Liabilities + Equity (+ Net Profit from P&L).
        """
        result = await db.execute(
            select(ChartOfAccounts).where(
                ChartOfAccounts.type.in_([AccountType.Asset, AccountType.Liability, AccountType.Equity])
            )
        )
        accounts = result.scalars().all()

        assets = []
        liabilities = []
        equity = []

        total_assets = Decimal("0.00")
        total_liabilities = Decimal("0.00")
        total_equity = Decimal("0.00")

        for acc in accounts:
            line_result = await db.execute(
                select(
                    func.coalesce(func.sum(LedgerLine.debit), 0).label("sum_debit"),
                    func.coalesce(func.sum(LedgerLine.credit), 0).label("sum_credit")
                ).where(LedgerLine.account_id == acc.id)
            )
            row = line_result.one()
            s_debit = Decimal(str(row.sum_debit))
            s_credit = Decimal(str(row.sum_credit))

            if acc.type == AccountType.Asset:
                # Asset normal balance is Debit
                net = s_debit - s_credit
                total_assets += net
                assets.append({"code": acc.code, "name": acc.name, "amount": float(net)})
            elif acc.type == AccountType.Liability:
                # Liability normal balance is Credit
                net = s_credit - s_debit
                total_liabilities += net
                liabilities.append({"code": acc.code, "name": acc.name, "amount": float(net)})
            elif acc.type == AccountType.Equity:
                # Equity normal balance is Credit
                net = s_credit - s_debit
                total_equity += net
                equity.append({"code": acc.code, "name": acc.name, "amount": float(net)})

        # Include Net Income in Equity
        pnl = await AccountingEngine.get_pnl_statement(db)
        net_income = Decimal(str(pnl["net_profit"]))
        total_equity_with_pnl = total_equity + net_income

        return {
            "assets": assets,
            "total_assets": float(total_assets),
            "liabilities": liabilities,
            "total_liabilities": float(total_liabilities),
            "equity": equity,
            "net_income": float(net_income),
            "total_equity": float(total_equity_with_pnl),
            "total_liabilities_and_equity": float(total_liabilities + total_equity_with_pnl)
        }
