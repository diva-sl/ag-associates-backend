// import PDFDocument from "pdfkit";
// import path from "path";

// export const generateInvoicePdf = (transaction, user) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({
//       size: "A4",
//       margin: 40,
//       bufferPages: false,
//     });

//     const buffers = [];

//     doc.on("data", (chunk) => buffers.push(chunk));

//     doc.on("end", () => {
//       resolve(Buffer.concat(buffers));
//     });

//     doc.on("error", reject);

//     const logoPath = path.join(process.cwd(), "assets", "ag-logo.png");

//     const PRIMARY = "#511D43";
//     const SECONDARY = "#901E3E";
//     const LIGHT = "#F9FAFB";
//     const BORDER = "#E5E7EB";
//     const TEXT = "#111827";
//     const SUCCESS = "#16A34A";

//     const formatCurrency = (value) => `INR ${Number(value || 0).toFixed(2)}`;

//     /* =====================================================
//        HEADER
//     ====================================================== */

//     doc.rect(0, 0, 612, 120).fill(PRIMARY);

//     try {
//       doc.image(logoPath, 40, 25, {
//         width: 72,
//       });
//     } catch (error) {
//       console.log("Logo not found");
//     }

//     doc
//       .fillColor("white")
//       .font("Helvetica-Bold")
//       .fontSize(24)
//       .text("AG & ASSOCIATES", 130, 30);

//     doc
//       .font("Helvetica")
//       .fontSize(11)
//       .text("Corporate Tax Consultants & Compliance Experts", 130, 58);

//     doc
//       .fontSize(10)
//       .text("GST | Income Tax | ROC | Audit | Compliance", 130, 78);

//     doc.font("Helvetica-Bold").fontSize(26).text("TAX INVOICE", 400, 42);

//     /* =====================================================
//        COMPANY DETAILS
//     ====================================================== */

//     doc.fillColor(TEXT).font("Helvetica").fontSize(10);

//     doc.text("46, Malaiamman Nagar", 40, 145);
//     doc.text("M Pudupalayam", 40, 160);
//     doc.text("Tirupur - 641665", 40, 175);
//     doc.text("Tamil Nadu, India", 40, 190);
//     doc.text("GSTIN : 33AZRPA1920F1ZT", 40, 205);
//     doc.text("info@agandassociates.org", 40, 220);
//     doc.text("+91 73734 76048", 40, 235);

//     /* =====================================================
//        INVOICE INFO BOX
//     ====================================================== */

//     doc.roundedRect(340, 140, 230, 125, 10).stroke(BORDER);

//     doc.fillColor(PRIMARY).font("Helvetica-Bold").fontSize(11);

//     doc.text("Invoice Number", 355, 155);

//     doc.fillColor(TEXT).font("Helvetica");

//     doc.text(transaction.invoiceNumber || "-", 355, 172);

//     doc.fillColor(PRIMARY).font("Helvetica-Bold");

//     doc.text("Invoice Date", 355, 195);

//     doc.fillColor(TEXT).font("Helvetica");

//     doc.text(
//       new Date(transaction.paidAt || new Date()).toLocaleDateString("en-IN"),
//       355,
//       212,
//     );

//     doc.text(`Ref: ${transaction.razorpay_payment_id || "-"}`, 355, 235);

//     /* =====================================================
//        PAID BADGE
//     ====================================================== */

//     doc.roundedRect(485, 205, 65, 24, 5).fill(SUCCESS);

//     doc
//       .fillColor("white")
//       .font("Helvetica-Bold")
//       .fontSize(10)
//       .text("PAID", 505, 212);

//     /* =====================================================
//        BILL TO
//     ====================================================== */

//     doc
//       .fillColor(PRIMARY)
//       .font("Helvetica-Bold")
//       .fontSize(14)
//       .text("Bill To", 40, 290);

//     doc.fillColor(TEXT).font("Helvetica").fontSize(11);

//     doc.text(user?.name || "-", 50, 315);

//     doc.text(user?.email || "-", 50, 333);

//     if (user?.phone) {
//       doc.text(user.phone, 50, 351);
//     }

//     if (user?.gstin) {
//       doc.text(`GSTIN : ${user.gstin}`, 50, 369);
//     }

//     /* =====================================================
//        TABLE HEADER
//     ====================================================== */

//     doc.rect(40, 415, 530, 35).fill(PRIMARY);

//     doc.fillColor("white").font("Helvetica-Bold").fontSize(11);

//     doc.text("Description", 55, 427);

//     doc.text("Amount", 470, 427);

//     /* =====================================================
//        TABLE BODY
//     ====================================================== */

//     doc.rect(40, 450, 530, 130).stroke(BORDER);

//     doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(11);

//     doc.text(`${transaction.planName} Subscription Plan`, 55, 470);

//     doc.font("Helvetica").text(formatCurrency(transaction.subtotal), 420, 470, {
//       width: 120,
//       align: "right",
//     });

//     doc.text("CGST (9%)", 55, 505);

//     doc.text(formatCurrency(transaction.cgstAmount), 420, 505, {
//       width: 120,
//       align: "right",
//     });

//     doc.text("SGST (9%)", 55, 540);

//     doc.text(formatCurrency(transaction.sgstAmount), 420, 540, {
//       width: 120,
//       align: "right",
//     });

//     /* =====================================================
//        PAYMENT DETAILS
//     ====================================================== */

//     doc
//       .fillColor(PRIMARY)
//       .font("Helvetica-Bold")
//       .fontSize(14)
//       .text("Payment Details", 40, 610);

//     doc.fillColor(TEXT).font("Helvetica").fontSize(11);

//     doc.text(
//       `Payment Method : ${transaction.paymentMethod || "Razorpay"}`,
//       40,
//       635,
//     );

//     doc.text(`Payment ID : ${transaction.razorpay_payment_id || "-"}`, 40, 655);

//     doc.text(`Status : ${transaction.status || "Paid"}`, 40, 675);

//     /* =====================================================
//        GST DETAILS
//     ====================================================== */

//     doc
//       .fillColor(PRIMARY)
//       .font("Helvetica-Bold")
//       .fontSize(13)
//       .text("Tax Details", 40, 720);

//     doc.fillColor(TEXT).font("Helvetica").fontSize(10);

//     doc.text("GSTIN : 33AZRPA1920F1ZT", 40, 742);

//     doc.text("SAC Code : 998212", 40, 757);

//     doc.text("Accounting & Tax Consultancy Services", 40, 772);

//     doc.text(`GST Rate : ${transaction.gstRate || 18}%`, 40, 787);

//     /* =====================================================
//        PREMIUM TOTAL BOX
//     ====================================================== */

//     doc.roundedRect(330, 600, 240, 115, 10).fillAndStroke("#FFF7ED", BORDER);

//     doc.fillColor(TEXT).font("Helvetica").fontSize(11);

//     doc.text("Subtotal", 350, 620);

//     doc.text(formatCurrency(transaction.subtotal), 430, 620, {
//       width: 110,
//       align: "right",
//     });

//     doc.text("GST (18%)", 350, 645);

//     doc.text(formatCurrency(transaction.gstAmount), 430, 645, {
//       width: 110,
//       align: "right",
//     });

//     doc.moveTo(350, 670).lineTo(550, 670).strokeColor(BORDER).stroke();

//     doc.fillColor("#6B7280").fontSize(10).font("Helvetica");

//     doc.text("Amount Paid", 350, 680);

//     doc.fillColor(SECONDARY).font("Helvetica-Bold").fontSize(20);

//     doc.text(formatCurrency(transaction.totalAmount), 390, 675, {
//       width: 150,
//       align: "right",
//     });

//     /* =====================================================
//        SIGNATURE
//     ====================================================== */

//     doc.moveTo(410, 740).lineTo(540, 740).strokeColor(PRIMARY).stroke();

//     doc.fillColor(PRIMARY).font("Helvetica-Bold").fontSize(11);

//     doc.text("Authorized Signatory", 420, 748);

//     doc.fillColor(TEXT).fontSize(10);

//     doc.text("AG & ASSOCIATES", 430, 765);

//     /* =====================================================
//        FOOTER
//     ====================================================== */

//     doc.fillColor("#6B7280").font("Helvetica").fontSize(8);

//     doc.text("Website : https://agandassociates.org", 40, 800, {
//       width: 530,
//       align: "center",
//     });

//     doc.text(
//       "Email : info@agandassociates.org | Phone : +91 73734 76048",
//       40,
//       812,
//       {
//         width: 530,
//         align: "center",
//       },
//     );

//     doc.text(
//       "This is a computer-generated invoice and does not require a physical signature.",
//       40,
//       824,
//       {
//         width: 530,
//         align: "center",
//       },
//     );

//     doc.end();
//   });
// };
import PDFDocument from "pdfkit";
import path from "path";

export const generateInvoicePdf = (transaction, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: false,
    });

    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    const logoPath = path.join(process.cwd(), "assets", "ag-logo.png");

    const regularFont = path.join(
      process.cwd(),
      "assets",
      "fonts",
      "NotoSans-Regular.ttf",
    );

    const boldFont = path.join(
      process.cwd(),
      "assets",
      "fonts",
      "NotoSans-Bold.ttf",
    );

    doc.registerFont("Noto", regularFont);
    doc.registerFont("Noto-Bold", boldFont);

    const PRIMARY = "#511D43";
    const BORDER = "#E5E7EB";
    const TEXT = "#111827";

    const money = (value) =>
      `₹ ${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    /* HEADER */

    doc.rect(0, 0, 612, 110).fill(PRIMARY);

    try {
      doc.image(logoPath, 40, 22, {
        width: 65,
      });
    } catch {}

    doc
      .font("Noto-Bold")
      .fontSize(24)
      .fillColor("white")
      .text("AG & ASSOCIATES", 120, 28);

    doc
      .font("Noto")
      .fontSize(10)
      .text("Corporate Tax Consultants & Compliance Experts", 120, 58);

    doc
      .font("Noto")
      .fontSize(9)
      .text("GST | Income Tax | ROC | Audit | Compliance", 120, 76);

    doc.font("Noto-Bold").fontSize(24).text("TAX INVOICE", 400, 40);

    /* COMPANY DETAILS */

    let y = 135;

    doc.font("Noto").fontSize(10).fillColor(TEXT);

    doc.text("46, Malaiamman Nagar", 40, y);
    doc.text("M Pudupalayam", 40, y + 15);
    doc.text("Tirupur - 641665", 40, y + 30);
    doc.text("Tamil Nadu, India", 40, y + 45);
    doc.text("GSTIN : 33AZRPA1920F1ZT", 40, y + 60);

    /* INVOICE BOX */

    doc.roundedRect(350, 135, 210, 110, 8).stroke(BORDER);

    doc.font("Noto-Bold").fillColor(PRIMARY).text("Invoice No", 365, 150);

    doc.font("Noto").fillColor(TEXT).text(transaction.invoiceNumber, 365, 168);

    doc.font("Noto-Bold").fillColor(PRIMARY).text("Invoice Date", 365, 190);

    doc
      .font("Noto")
      .fillColor(TEXT)
      .text(new Date(transaction.paidAt).toLocaleDateString("en-IN"), 365, 208);

    /* PAID BADGE */

    doc.roundedRect(475, 190, 55, 22, 4).fill("#16A34A");

    doc.font("Noto-Bold").fillColor("white").fontSize(9).text("PAID", 490, 197);

    /* CUSTOMER */

    doc
      .font("Noto-Bold")
      .fillColor(PRIMARY)
      .fontSize(13)
      .text("Bill To", 40, 270);

    doc.font("Noto").fillColor(TEXT).fontSize(10);

    doc.text(user.name || "-", 50, 292);
    doc.text(user.email || "-", 50, 308);

    if (user.phone) {
      doc.text(user.phone, 50, 324);
    }

    /* TABLE */

    doc.rect(40, 365, 530, 30).fill(PRIMARY);

    doc.font("Noto-Bold").fillColor("white").fontSize(10);

    doc.text("Description", 55, 375);
    doc.text("Amount", 470, 375);

    doc.rect(40, 395, 530, 120).stroke(BORDER);

    doc.font("Noto").fillColor(TEXT);

    doc.text(`${transaction.planName} Subscription`, 55, 420);

    doc.text(money(transaction.subtotal), 430, 420, {
      width: 110,
      align: "right",
    });

    doc.text("CGST @ 9%", 55, 450);

    doc.text(money(transaction.cgstAmount), 430, 450, {
      width: 110,
      align: "right",
    });

    doc.text("SGST @ 9%", 55, 480);

    doc.text(money(transaction.sgstAmount), 430, 480, {
      width: 110,
      align: "right",
    });

    /* TOTAL BOX */

    doc.roundedRect(340, 540, 230, 100, 8).fillAndStroke("#FFF7ED", BORDER);

    doc.font("Noto").fillColor(TEXT);

    doc.text("Subtotal", 355, 560);

    doc.text(money(transaction.subtotal), 440, 560, {
      width: 100,
      align: "right",
    });

    doc.text("GST", 355, 585);

    doc.text(money(transaction.gstAmount), 440, 585, {
      width: 100,
      align: "right",
    });

    doc.moveTo(355, 610).lineTo(545, 610).stroke();

    doc.font("Noto-Bold").fontSize(18).fillColor(PRIMARY);

    doc.text("Grand Total", 355, 620);

    doc.text(money(transaction.totalAmount), 420, 620, {
      width: 120,
      align: "right",
    });

    /* PAYMENT DETAILS */

    doc
      .font("Noto-Bold")
      .fontSize(12)
      .fillColor(PRIMARY)
      .text("Payment Details", 40, 545);

    doc.font("Noto").fontSize(10).fillColor(TEXT);

    doc.text(`Payment ID : ${transaction.razorpay_payment_id}`, 40, 570);

    doc.text(`Method : ${transaction.paymentMethod}`, 40, 588);

    doc.text(`Status : ${transaction.status}`, 40, 606);

    /* GST DETAILS */

    doc.font("Noto-Bold").fillColor(PRIMARY).text("Tax Details", 40, 670);

    doc.font("Noto").fillColor(TEXT);

    doc.text("GSTIN : 33AZRPA1920F1ZT", 40, 692);

    doc.text("SAC Code : 998212", 40, 708);

    /* SIGNATURE */

    doc.moveTo(420, 720).lineTo(540, 720).stroke();

    doc.font("Noto-Bold").fillColor(PRIMARY);

    doc.text("Authorized Signatory", 425, 730);

    /* FOOTER */

    doc.font("Noto").fillColor("#6B7280").fontSize(8);

    doc.text(
      "Website: agandassociates.org | Email: info@agandassociates.org | +91 73734 76048",
      40,
      785,
      {
        width: 530,
        align: "center",
      },
    );

    doc.end();
  });
};
