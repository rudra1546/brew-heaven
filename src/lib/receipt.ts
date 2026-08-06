export function printKitchenReceipt(order: any) {
  const items = (order.order_items || [])
    .map((item: any) => `${item.quantity} x ${item.item_name}`)
    .join("\n");

  // ---------- Kitchen Copy ----------
  const kitchenReceipt = `
========================
      BREW HEAVEN
      KITCHEN COPY
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

  // ---------- Counter Copy ----------
  const counterItems = (order.order_items || [])
    .map(
      (item: any) =>
        `${item.quantity} x ${item.item_name}    ₹${(
          Number(item.price) * item.quantity
        ).toFixed(2)}`
    )
    .join("\n");

  const counterReceipt = `
========================
      BREW HEAVEN
      COUNTER COPY
========================

Order : #${order.order_number}
Table : ${order.table_number}
Name  : ${order.customer_name}

------------------------

${counterItems}

------------------------

Total : ₹${Number(order.total_amount).toFixed(2)}

Payment : ${order.payment_method}
Status  : ${order.payment_status}

------------------------

${new Date(order.created_at).toLocaleString()}

========================
`;

  downloadFile(
    kitchenReceipt,
    `Kitchen_Order_${order.order_number}_Kitchen.txt`
  );

  // Small delay so browsers don't block the second download
  setTimeout(() => {
    downloadFile(
      counterReceipt,
      `Kitchen_Order_${order.order_number}_Counter.txt`
    );
  }, 300);
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}