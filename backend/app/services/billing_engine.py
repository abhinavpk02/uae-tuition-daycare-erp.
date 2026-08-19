from decimal import Decimal
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.domain import (
    Attendance, RefType, ProfileStaff, Student, StudentProgram,
    Inventory, Invoice, InvoiceItem, InvoiceStatus, RefModule,
    DaycareSession, TuitionEnrollment
)
from app.services.accounting_engine import AccountingEngine, AccountingError

DAYCARE_HOURLY_RATE = Decimal("35.00") # Standard AED 35.00/hour

class BillingEngine:

    # =========================================================================
    # 1. DAYCARE ATTENDANCE & TIME-BASED BILLING ENGINE
    # =========================================================================
    @staticmethod
    async def checkout_daycare_session(
        db: AsyncSession,
        session_id: str,
        check_out_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Triggers check-out for a DaycareSession, calculates precise time spent (hours * hourly_rate),
        updates total_calculated_fee, creates an invoice, and dispatches a balanced General Ledger entry.
        """
        result = await db.execute(
            select(DaycareSession).where(DaycareSession.session_id == session_id)
        )
        session = result.scalar_one_or_none()
        if not session:
            raise ValueError(f"DaycareSession ID '{session_id}' not found.")

        if session.check_out_time is not None and session.total_calculated_fee is not None:
            return {
                "status": "already_completed",
                "session_id": session.session_id,
                "total_calculated_fee": float(session.total_calculated_fee)
            }

        # Determine check-out timestamp and elapsed time in hours
        check_out = check_out_time or datetime.utcnow()
        session.check_out_time = check_out

        duration_seconds = (check_out - session.check_in_time).total_seconds()
        hours_spent = max(duration_seconds / 3600.0, 0.25) # Minimum 15-min billing threshold
        rounded_hours = Decimal(str(round(hours_spent, 2)))

        # Time-based calculation: Hours Spent * Hourly Rate
        total_fee = Decimal(str(round(rounded_hours * session.hourly_rate, 2)))
        session.total_calculated_fee = total_fee

        # Fetch student profile for ledger details
        st_res = await db.execute(select(Student).where(Student.id == session.student_id))
        student = st_res.scalar_one_or_none()
        student_name = student.name if student else "Daycare Student"

        # Create Invoice
        invoice = Invoice(
            student_id=session.student_id,
            total_amount=total_fee,
            paid_amount=Decimal("0.00"),
            status=InvoiceStatus.Issued,
            due_date=check_out.strftime("%Y-%m-%d")
        )
        db.add(invoice)
        await db.flush()

        inv_item = InvoiceItem(
            invoice_id=invoice.id,
            description=f"Daycare Time Usage ({rounded_hours} hrs @ AED {session.hourly_rate}/hr)",
            amount=total_fee
        )
        db.add(inv_item)

        # Dispatch General Ledger Entry: Debit Accounts Receivable (1100), Credit Daycare Revenue (4100)
        journal_entry = await AccountingEngine.create_balanced_journal_entry(
            db=db,
            description=f"Daycare Hourly Session Billing: {student_name} ({rounded_hours} hrs)",
            ref_module=RefModule.Invoice,
            ref_id=invoice.id,
            lines_data=[
                {"account_code": "1100", "debit": float(total_fee), "credit": 0.0}, # Accounts Receivable
                {"account_code": "4100", "debit": 0.0, "credit": float(total_fee)}  # Daycare Revenue
            ]
        )

        try:
            db.add(session)
            await db.commit()
            await db.refresh(session)
        except Exception as e:
            await db.rollback()
            raise RuntimeError(f"Database commit failed during daycare checkout: {str(e)}")

        return {
            "status": "success",
            "session_id": session.session_id,
            "student_id": session.student_id,
            "student_name": student_name,
            "hours_spent": float(rounded_hours),
            "hourly_rate": float(session.hourly_rate),
            "total_calculated_fee": float(total_fee),
            "invoice_id": invoice.id,
            "journal_entry_id": journal_entry.id
        }

    # =========================================================================
    # 2. TUITION ENROLLMENT & FIXED-FEE BILLING ENGINE
    # =========================================================================
    @staticmethod
    async def process_monthly_tuition_billing(
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Monthly cron/background function that queries all active TuitionEnrollment records
        and generates a fixed monthly invoice and General Ledger entry for each.
        """
        result = await db.execute(
            select(TuitionEnrollment).where(TuitionEnrollment.status == "Active")
        )
        active_enrollments = result.scalars().all()

        total_billed = Decimal("0.00")
        processed_invoices = []

        current_date_str = datetime.utcnow().strftime("%Y-%m-%d")

        for enrollment in active_enrollments:
            st_res = await db.execute(select(Student).where(Student.id == enrollment.student_id))
            student = st_res.scalar_one_or_none()
            if not student or not student.is_tuition_student:
                continue

            monthly_fee = enrollment.monthly_fee
            total_billed += monthly_fee

            # Create Fixed-Fee Monthly Invoice
            invoice = Invoice(
                student_id=enrollment.student_id,
                total_amount=monthly_fee,
                paid_amount=Decimal("0.00"),
                status=InvoiceStatus.Issued,
                due_date=current_date_str
            )
            db.add(invoice)
            await db.flush()

            inv_item = InvoiceItem(
                invoice_id=invoice.id,
                description=f"Fixed Monthly Tuition: {enrollment.program_name}",
                amount=monthly_fee
            )
            db.add(inv_item)

            # Post directly to General Ledger: Debit Accounts Receivable (1100), Credit Tuition Revenue (4000)
            journal_entry = await AccountingEngine.create_balanced_journal_entry(
                db=db,
                description=f"Fixed Monthly Tuition Invoice: {student.name} ({enrollment.program_name})",
                ref_module=RefModule.Invoice,
                ref_id=invoice.id,
                lines_data=[
                    {"account_code": "1100", "debit": float(monthly_fee), "credit": 0.0}, # Accounts Receivable
                    {"account_code": "4000", "debit": 0.0, "credit": float(monthly_fee)}  # Tuition Revenue
                ]
            )

            processed_invoices.append({
                "enrollment_id": enrollment.enrollment_id,
                "student_name": student.name,
                "program_name": enrollment.program_name,
                "monthly_fee": float(monthly_fee),
                "invoice_id": invoice.id,
                "journal_entry_id": journal_entry.id
            })

        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise RuntimeError(f"Failed to commit monthly tuition billing batch: {str(e)}")

        return {
            "status": "success",
            "total_enrollments_billed": len(processed_invoices),
            "total_amount_billed": float(total_billed),
            "currency": "AED",
            "invoices": processed_invoices
        }

    # =========================================================================
    # 3. POS STORE CHECKOUT & STAFF PAYROLL
    # =========================================================================
    @staticmethod
    async def process_pos_checkout(
        db: AsyncSession,
        items: List[Dict[str, Any]],
        student_id: Optional[str] = None
    ) -> Dict[str, Any]:
        total_amount = Decimal("0.00")
        line_items_summary = []

        for item_data in items:
            item_id = item_data["item_id"]
            qty = int(item_data.get("qty", 1))

            result = await db.execute(select(Inventory).where(Inventory.id == item_id))
            inv_item = result.scalar_one_or_none()
            if not inv_item:
                raise ValueError(f"Inventory item ID '{item_id}' not found.")

            if inv_item.stock_qty < qty:
                raise ValueError(f"Insufficient stock for '{inv_item.item_name}'. Available: {inv_item.stock_qty}, Requested: {qty}.")

            inv_item.stock_qty -= qty
            line_total = inv_item.price * Decimal(qty)
            total_amount += line_total

            line_items_summary.append({
                "item_name": inv_item.item_name,
                "qty": qty,
                "unit_price": float(inv_item.price),
                "line_total": float(line_total)
            })

        journal_entry = await AccountingEngine.create_balanced_journal_entry(
            db=db,
            description=f"POS Inventory Sale: {len(items)} items",
            ref_module=RefModule.POS,
            lines_data=[
                {"account_code": "1000", "debit": float(total_amount), "credit": 0.0},
                {"account_code": "4200", "debit": 0.0, "credit": float(total_amount)}
            ]
        )

        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise RuntimeError(f"Database commit failed during POS checkout: {str(e)}")

        return {
            "status": "success",
            "total_amount": float(total_amount),
            "currency": "AED",
            "items": line_items_summary,
            "journal_entry_id": journal_entry.id
        }

    @staticmethod
    async def process_staff_payroll(
        db: AsyncSession,
        staff_id: str
    ) -> Dict[str, Any]:
        result = await db.execute(select(ProfileStaff).where(ProfileStaff.id == staff_id))
        staff = result.scalar_one_or_none()
        if not staff:
            raise ValueError(f"Staff member ID '{staff_id}' not found.")

        att_result = await db.execute(
            select(Attendance).where(
                Attendance.ref_type == RefType.Staff,
                Attendance.ref_id == staff_id,
                Attendance.check_out.isnot(None)
            )
        )
        attendances = att_result.scalars().all()

        total_hours = 0.0
        for att in attendances:
            if att.check_out and att.check_in:
                delta = att.check_out - att.check_in
                hours = delta.total_seconds() / 3600.0
                total_hours += hours

        if total_hours == 0:
            total_hours = 160.0

        gross_salary = Decimal(str(round(total_hours, 2))) * staff.hourly_rate

        journal_entry = await AccountingEngine.create_balanced_journal_entry(
            db=db,
            description=f"Monthly Payroll payout for {staff.name} ({round(total_hours, 2)} hrs @ AED {staff.hourly_rate}/hr)",
            ref_module=RefModule.Payroll,
            ref_id=staff_id,
            lines_data=[
                {"account_code": "5000", "debit": float(gross_salary), "credit": 0.0},
                {"account_code": "1000", "debit": 0.0, "credit": float(gross_salary)}
            ]
        )

        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise RuntimeError(f"Database commit failed during payroll processing: {str(e)}")

        return {
            "staff_name": staff.name,
            "emirates_id": staff.emirates_id,
            "total_hours": round(total_hours, 2),
            "hourly_rate": float(staff.hourly_rate),
            "gross_salary": float(gross_salary),
            "journal_entry_id": journal_entry.id
        }
