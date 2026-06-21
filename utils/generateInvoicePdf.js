import PDFDocument from "pdfkit";

export const generateInvoicePdf = (transaction, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });

    doc.on("error", reject);

    doc.fontSize(24).text("AG & Associates", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(18).text("Tax Consultancy Invoice", {
      align: "center",
    });

    doc.moveDown(2);

    doc.fontSize(12).text(`Invoice No: ${transaction.invoiceNumber}`);
    doc.text(`Customer: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Plan: ${transaction.planName}`);
    doc.text(`Amount: ₹${transaction.amount}`);
    doc.text(`Payment ID: ${transaction.razorpay_payment_id}`);
    doc.text(`Status: ${transaction.status}`);
    doc.text(`Date: ${new Date(transaction.paidAt).toLocaleDateString()}`);

    doc.moveDown(2);

    doc.text("Thank you for choosing AG & Associates.");

    doc.end();
  });
};
