from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "output" / "pdf"
OUT_DIR.mkdir(parents=True, exist_ok=True)
PDF_PATH = OUT_DIR / "Quaerens_Company_Overview_Global_Business_Awards_2026.pdf"
LOGO_PATH = ROOT / "public" / "images" / "quaerens-logo.png"


def p(text: str, style: ParagraphStyle):
    return Paragraph(text, style)


def build():
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=14 * mm,
        title="Quaerens Company Overview",
        author="Quaerens Ltd",
    )

    styles = getSampleStyleSheet()
    navy = colors.HexColor("#06173d")
    blue = colors.HexColor("#2563eb")
    pale_blue = colors.HexColor("#eff6ff")
    border = colors.HexColor("#bfdbfe")
    muted = colors.HexColor("#475569")

    title = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=25,
        leading=30,
        textColor=navy,
        alignment=0,
        spaceAfter=8,
    )
    h2 = ParagraphStyle(
        "Heading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=blue,
        spaceBefore=8,
        spaceAfter=6,
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.7,
        leading=14,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=7,
    )
    small = ParagraphStyle(
        "Small",
        parent=body,
        fontSize=8.2,
        leading=11,
        textColor=muted,
    )
    card_head = ParagraphStyle(
        "CardHead",
        parent=body,
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        textColor=navy,
        spaceAfter=4,
    )
    card_body = ParagraphStyle(
        "CardBody",
        parent=body,
        fontSize=8.6,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    story = []

    if LOGO_PATH.exists():
        logo = Image(str(LOGO_PATH), width=58 * mm, height=22 * mm)
        story.append(logo)
        story.append(Spacer(1, 5 * mm))

    story.append(p("Quaerens Ltd - Company Overview", title))
    story.append(
        p(
            "Prepared as supporting evidence for the Global Business Awards 2026 nomination.",
            small,
        )
    )
    story.append(Spacer(1, 3 * mm))

    intro = Table(
        [
            [
                p(
                    "<b>Clear support when complaints get complicated.</b><br/>"
                    "Quaerens Ltd helps consumers organise evidence, understand dispute routes, "
                    "and prepare clearer complaint or assessment documents before taking the next step.",
                    body,
                )
            ]
        ],
        colWidths=[174 * mm],
    )
    intro.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), pale_blue),
                ("BOX", (0, 0), (-1, -1), 0.8, border),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(intro)

    story.append(p("What Quaerens Provides", h2))
    story.append(
        p(
            "Quaerens is an evidence-led consumer dispute support company. We assist clients who feel "
            "overwhelmed by rejected complaints, delayed refunds, unclear responses, or complex claims. "
            "Our team reviews the information available, identifies strengths and evidence gaps, and "
            "prepares practical next steps in plain English.",
            body,
        )
    )

    areas = [
        ["Property and home improvement", "Spray foam insulation, new build issues, housing disrepair, sale and rent back, and equity release concerns."],
        ["Finance and regulated routes", "Car finance, pension issues, Section 75 credit card support, APP fraud and bank scam refund complaints."],
        ["Travel and leisure", "Holiday park, caravan, timeshare, flight, travel, cruise, luggage and other travel-related disputes."],
        ["General consumer complaints", "Practical support where documents, complaint history and clear timelines can improve the route forward."],
    ]
    area_rows = [
        [p(f"<b>{name}</b><br/>{desc}", card_body)] for name, desc in areas
    ]
    area_table = Table(area_rows, colWidths=[174 * mm])
    area_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.7, border),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#dbeafe")),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(area_table)

    story.append(p("Evidence-Led Process", h2))
    process = [
        [
            p("<b>1. Initial Review</b><br/>The client shares a summary, key dates, documents and any replies already received.", card_body),
            p("<b>2. Evidence Assessment</b><br/>We organise the facts, identify missing evidence and assess the likely route forward.", card_body),
            p("<b>3. Clear Next Steps</b><br/>We prepare clearer complaint wording, assessment reports or handover packs where appropriate.", card_body),
        ]
    ]
    process_table = Table(process, colWidths=[56 * mm, 56 * mm, 56 * mm])
    process_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.7, border),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dbeafe")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(process_table)

    story.append(p("Free Assessment and Report Approach", h2))
    story.append(
        p(
            "Quaerens offers a free, no-obligation initial assessment route for non-DIY matters. "
            "Where suitable, clients can receive an assessment report that explains the issue, the "
            "documents reviewed, the apparent strengths and weaknesses, and the next recommended step. "
            "Paid support is only discussed where it appears genuinely useful and is explained clearly in advance.",
            body,
        )
    )

    story.append(p("Recent Outcome Example", h2))
    story.append(
        p(
            "As part of Quaerens' wider dispute support model, one recent consumer matter resulted in a "
            "settlement offer materially above the client's original expectation. The client had expected "
            "a recovery in the region of GBP 20,000; the final settlement offer exceeded GBP 25,000, "
            "demonstrating the value of clear evidence review, structured complaint preparation and "
            "persistent case support.",
            body,
        )
    )

    story.append(p("Legal and Partner Routes", h2))
    story.append(
        p(
            "Quaerens is not a law firm. We specialise in practical dispute support, evidence organisation "
            "and complaint preparation. Where a matter requires formal legal action, regulated claims handling "
            "or specialist representation, suitable cases can be referred to appropriate legal or authorised partners.",
            body,
        )
    )

    footer = Table(
        [[p("<b>Quaerens Ltd</b> | Consumer dispute assessment, evidence review and complaint support", small)]],
        colWidths=[174 * mm],
    )
    footer.setStyle(
        TableStyle(
            [
                ("LINEABOVE", (0, 0), (-1, 0), 0.6, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(footer)

    doc.build(story)
    print(PDF_PATH)


if __name__ == "__main__":
    build()
