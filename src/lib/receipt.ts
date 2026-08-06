export function printKitchenReceipt(order: any) {
  const items = (order.order_items || [])
    .map(
      (item: any) =>
        `${item.quantity} x ${item.item_name}`
    )
    .join("\n");


  const receiptText = `
========================
      BREW HEAVEN
  Kitchen Order Ticket
========================

Order : #${order.order_number}
Table : ${order.table_number}
Name  : ${order.customer_name}

------------------------

${items}

------------------------

Instructions:
${order.special_instructions || "None"}

------------------------

${new Date(order.created_at).toLocaleString()}

========================
`;


  // CURRENT: Download receipt file

  const blob = new Blob(
    [receiptText],
    { type: "text/plain" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download =
    `Kitchen_Order_${order.order_number}.txt`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);



  /*
  
  FUTURE THERMAL PRINTER IMPLEMENTATION

  Instead of downloading:

  await sendToThermalPrinter(order);

  Example:

  QZ Tray
       ↓
  USB Thermal Printer
       ↓
  2 Kitchen Receipts

  */
}