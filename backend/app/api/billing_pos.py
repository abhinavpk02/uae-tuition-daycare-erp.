from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.domain import Inventory, Invoice, InvoiceItem, Student
from app.schemas.domain_schemas import (
    InventoryItemCreate, InventoryItemResponse, POSCheckoutRequest
)
from app.services.billing_engine import BillingEngine
from app.services.pdf_generator import generate_invoice_pdf

router = APIRouter(prefix="/billing-pos", tags=["Billing & POS"])

@router.get("/inventory", response_model=List[InventoryItemResponse])
async def list_inventory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inventory))
    items = result.scalars().all()
    return items

@router.post("/inventory", response_model=InventoryItemResponse)
async def create_inventory_item(item_in: InventoryItemCreate, db: AsyncSession = Depends(get_db)):
    item = Inventory(
        item_name=item_in.item_name,
        stock_qty=item_in.stock_qty,
        price=item_in.price
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.post("/pos/checkout")
async def pos_checkout(req: POSCheckoutRequest, db: AsyncSession = Depends(get_db)):
    try:
        items_payload = [{"item_id": i.item_id, "qty": i.qty} for i in req.items]
        res = await BillingEngine.process_pos_checkout(db, items_payload, req.student_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/daycare/calculate/{student_id}")
async def daycare_calculate(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await BillingEngine.calculate_daycare_billing(db, student_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str, db: AsyncSession = Depends(get_db)):
    inv_res = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = inv_res.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    st_res = await db.execute(select(Student).where(Student.id == invoice.student_id))
    student = st_res.scalar_one_or_none()

    items_res = await db.execute(select(InvoiceItem).where(InvoiceItem.invoice_id == invoice.id))
    items = items_res.scalars().all()

    payload = {
        "id": f"INV-{invoice.id[:8].upper()}",
        "date": invoice.due_date,
        "student_name": student.name if student else "N/A",
        "standard": student.standard if student else "N/A",
        "status": invoice.status.value,
        "total_amount": float(invoice.total_amount),
        "items": [{"description": it.description, "amount": float(it.amount)} for it in items]
    }

    pdf_bytes = generate_invoice_pdf(payload)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="invoice_{invoice.id[:8]}.pdf"'}
    )

