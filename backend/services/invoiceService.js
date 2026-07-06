const PDFDocument = require('pdfkit');

function streamInvoice(res, order, shop) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${order.invoiceNumber}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text('Tax Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice: ${order.invoiceNumber}`);
  doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString('en-IN')}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();
  doc.text(`Shop: ${shop.name}`);
  doc.text(`Owner: ${shop.ownerName}`);
  doc.text(`Village/Taluka: ${shop.village}, ${shop.taluka}`);
  if (shop.gstNumber) doc.text(`GST: ${shop.gstNumber}`);
  doc.moveDown();

  doc.text('Items:', { underline: true });
  order.items.forEach((item, i) => {
    const product = item.productId;
    const name = product?.name || 'Product';
    doc.text(
      `${i + 1}. ${name} — ${item.quantity} x ₹${item.pricePerUnit.toLocaleString('en-IN')} = ₹${item.subtotal.toLocaleString('en-IN')}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: ₹${order.totalAmount.toLocaleString('en-IN')}`, { align: 'right' });
  doc.end();
}

function streamPaymentReceipt(res, payment, shop) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="receipt-${payment._id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text('Payment Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Shop: ${shop.name}`);
  doc.text(`Amount: ₹${payment.amount.toLocaleString('en-IN')}`);
  doc.text(`Method: ${payment.method}`);
  doc.text(`Date: ${new Date(payment.date).toLocaleDateString('en-IN')}`);
  if (payment.note) doc.text(`Note: ${payment.note}`);
  doc.end();
}

module.exports = { streamInvoice, streamPaymentReceipt };
