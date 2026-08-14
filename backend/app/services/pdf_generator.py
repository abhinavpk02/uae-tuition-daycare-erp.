import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_invoice_pdf(invoice_data: dict) -> bytes:
    """
    Generates a formal PDF invoice document in memory and returns bytes.
    invoice_data structure:
    {
        "id": "INV-1002",
        "date": "2026-08-14",
        "student_name": "Zayed Al-Hashimi",
        "standard": "Grade 10",
        "status": "Issued",
        "total_amount": 1225.00,
        "items": [
            {"description": "Tuition Fee - Advanced Mathematics", "amount": 1200.00},
            {"description": "Daycare Hourly Usage (5 hrs @ AED 35/hr)", "amount": 175.00}
        ]
    }
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=colors.HexColor('#0F5132'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'InvoiceSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#6B7280'),
        spaceAfter=12
    )

    elements = []

    # Header section
    elements.append(Paragraph("UAE TUITION & DAYCARE ERP", title_style))
    elements.append(Paragraph("Official Tax Invoice & Financial Statement | United Arab Emirates (AED)", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#10B981'), spaceAfter=15))

    # Meta Info Table
    meta_data = [
        [
            Paragraph(f"<b>Invoice ID:</b> {invoice_data.get('id', 'INV-1001')}", styles['Normal']),
            Paragraph(f"<b>Date:</b> {invoice_data.get('date', '2026-08-14')}", styles['Normal'])
        ],
        [
            Paragraph(f"<b>Student Name:</b> {invoice_data.get('student_name', 'N/A')}", styles['Normal']),
            Paragraph(f"<b>Standard/Grade:</b> {invoice_data.get('standard', 'N/A')}", styles['Normal'])
        ],
        [
            Paragraph(f"<b>Payment Status:</b> <font color='#10B981'><b>{invoice_data.get('status', 'Issued')}</b></font>", styles['Normal']),
            Paragraph(f"<b>Currency:</b> AED (UAE Dirham)", styles['Normal'])
        ]
    ]

    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 20))

    # Line Items Table Header
    items_data = [["Item Description", "Amount (AED)"]]
    for item in invoice_data.get("items", []):
        items_data.append([
            item.get("description", "Service Item"),
            f"{float(item.get('amount', 0)):,.2f}"
        ])

    items_data.append([
        "TOTAL AMOUNT PAYABLE",
        f"AED {float(invoice_data.get('total_amount', 0)):,.2f}"
    ])

    item_table = Table(items_data, colWidths=[400, 140])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F5132')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -2), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#F1F5F9')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, -1), (1, -1), colors.HexColor('#0F5132')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))

    elements.append(item_table)
    elements.append(Spacer(1, 30))

    # Audit Footer
    footer_text = Paragraph(
        "<i>This invoice is generated automatically by the double-entry accounting ledger engine of UAE Tuition & Daycare ERP. Verified compliant with standard audit practices.</i>",
        styles['Italic']
    )
    elements.append(footer_text)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
