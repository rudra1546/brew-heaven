import qz from "qz-tray";


export async function printKitchenReceipt(order: any) {

  try {

    // Connect to QZ Tray

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }


    // Select printer

    //Remove comment when printer isnt specified
    // const printerName = await qz.printers.find();
    const printerName = "HP LaserJet Professional M1136 MFP";

    const config = qz.configs.create(
      printerName
    );


    const items = (order.order_items || [])
      .map(
        (item: any) =>
          `${item.quantity} x ${item.item_name}`
      )
      .join("\n");


    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13pt;
      line-height: 1.5;
      color: #000000;
      margin: 0;
      padding: 24px;
    }
    .center {
      text-align: center;
      font-weight: bold;
    }
    .divider {
      border-top: 1px dashed #000000;
      margin: 12px 0;
    }
    .bold {
      font-weight: bold;
    }
    .items {
      white-space: pre-line;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="center" style="font-size: 16pt;">BREW HEAVEN</div>
  <div class="center">KITCHEN COPY</div>
  <div class="divider"></div>
  <div class="bold">Order : #${order.order_number}</div>
  <div class="bold">Table : ${order.table_number}</div>
  <div class="divider"></div>
  <div class="items">${items}</div>
  <div class="divider"></div>
  <div><span class="bold">Notes:</span><br/>${order.special_instructions || "None"}</div>
  <div class="divider"></div>
  <div><span class="bold">Time:</span><br/>${new Date(order.created_at).toLocaleString()}</div>
</body>
</html>
      `.trim();


    const data = [
      {
        type: "pixel",
        format: "html",
        flavor: "plain",
        data: htmlContent
      }
    ];


    // Print single copy
    await qz.print(
      config,
      data
    );


    console.log(
      "Printed successfully"
    );


  } catch (error) {

    console.error(
      "Printer Error",
      error
    );

  }

}


export async function printCustomerReceipt(order: any) {
  try {
    // Connect to QZ Tray
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    // Select printer
    const printerName = "HP LaserJet Professional M1136 MFP";
    const config = qz.configs.create(printerName);

    const rawItems = order?.order_items ?? order?.items ?? order?.orderItems ?? [];
    const orderItems: any[] = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);

    // Temporary diagnostic logs
    console.log(`[Diagnostic] printCustomerReceipt called for Order #${order?.order_number ?? order?.id ?? "N/A"}`);
    console.log(`[Diagnostic] Total items received in order: ${orderItems.length}`);
    console.log(`[Diagnostic] Received item details:`, orderItems.map((i: any, idx: number) => `[${idx + 1}] ${i.quantity ?? 1}x ${i.item_name ?? i.name ?? "Unknown"} @ ₹${i.price ?? 0}`));

    const itemsRows = orderItems
      .map((item: any) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const lineTotal = qty * price;
        return `
      <tr>
        <td style="padding: 4px 0;">${item.item_name ?? item.name}</td>
        <td class="right" style="padding: 4px 0;">${qty}</td>
        <td class="right" style="padding: 4px 0;">₹${price.toFixed(2)}</td>
        <td class="right" style="padding: 4px 0;">₹${lineTotal.toFixed(2)}</td>
      </tr>
          `.trim();
      })
      .join("\n");

    console.log(`[Diagnostic] Generated HTML table item rows count: ${orderItems.length}`);

    const calculatedSubtotal = orderItems.reduce((acc: number, item: any) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      return acc + qty * price;
    }, 0);

    const subtotal = order.subtotal != null ? Number(order.subtotal) : calculatedSubtotal;
    const total = order.total_amount != null ? Number(order.total_amount) : subtotal;

    const discountAmount = order.discount != null
      ? Number(order.discount)
      : (order.discount_amount != null ? Number(order.discount_amount) : 0);

    const discountRow = discountAmount > 0
      ? `<tr><td style="padding: 3px 0;">Discount:</td><td class="right" style="padding: 3px 0;">-₹${discountAmount.toFixed(2)}</td></tr>`
      : "";

    const taxRow = order.tax != null
      ? `<tr><td style="padding: 3px 0;">Taxes:</td><td class="right" style="padding: 3px 0;">₹${Number(order.tax).toFixed(2)}</td></tr>`
      : `<tr><td style="padding: 3px 0;">Taxes:</td><td class="right" style="padding: 3px 0;">(Inclusive)</td></tr>`;

    const paymentInfo = [
      order.payment_status ? String(order.payment_status).toUpperCase() : "",
      order.payment_method ? `(${order.payment_method})` : ""
    ].filter(Boolean).join(" ");

    const dateStr = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

    const tableLine = order.table_number != null
      ? `<div><span class="bold">Table :</span> ${order.table_number}</div>`
      : "";

    const customerLine = order.customer_name
      ? `<div><span class="bold">Customer :</span> ${order.customer_name}</div>`
      : "";

    const paymentLine = paymentInfo
      ? `<div><span class="bold">Payment :</span> ${paymentInfo}</div>`
      : "";

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1.4;
      color: #000000;
      margin: 0;
      padding: 24px;
      max-width: 480px;
    }
    .center {
      text-align: center;
      font-weight: bold;
    }
    .divider {
      border-top: 1px dashed #000000;
      margin: 10px 0;
    }
    .bold {
      font-weight: bold;
    }
    .right {
      text-align: right;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
    }
    th, td {
      font-size: 11pt;
    }
    th {
      border-bottom: 1px solid #000000;
      text-align: left;
      padding: 4px 0;
    }
    .summary-table {
      width: 100%;
      margin-top: 6px;
    }
    .total-row {
      font-size: 13pt;
      font-weight: bold;
      border-top: 1px dashed #000000;
      border-bottom: 1px dashed #000000;
    }
  </style>
</head>
<body>
  <div class="center" style="font-size: 16pt;">BREW HEAVEN</div>
  <div class="center" style="font-size: 10pt; font-weight: normal; margin-top: 2px;">Artisan Coffee & Kitchen</div>
  <div class="center" style="font-size: 11pt; margin-top: 4px;">CUSTOMER RECEIPT</div>
  <div class="divider"></div>
  <div><span class="bold">Order :</span> #${order.order_number ?? ""}</div>
  ${tableLine}
  ${customerLine}
  <div><span class="bold">Date :</span> ${dateStr}</div>
  ${paymentLine}
  <div class="divider"></div>
  <table>
    <thead>
      <tr>
        <th style="width: 48%;">Item</th>
        <th class="right" style="width: 14%;">Qty</th>
        <th class="right" style="width: 18%;">Price</th>
        <th class="right" style="width: 20%;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>
  <div class="divider"></div>
  <table class="summary-table">
    <tr>
      <td style="padding: 3px 0;">Subtotal:</td>
      <td class="right" style="padding: 3px 0;">₹${subtotal.toFixed(2)}</td>
    </tr>
    ${discountRow}
    ${taxRow}
    <tr class="total-row">
      <td style="padding: 6px 0;">Total Amount:</td>
      <td class="right" style="padding: 6px 0;">₹${total.toFixed(2)}</td>
    </tr>
  </table>
  <div class="divider"></div>
  <div class="center" style="font-size: 10pt; font-weight: normal; margin-top: 12px;">
    Thank you for visiting Brew Heaven!
  </div>
</body>
</html>
      `.trim();

    const data = [
      {
        type: "pixel",
        format: "html",
        flavor: "plain",
        data: htmlContent
      }
    ];

    await qz.print(config, data);

    console.log("Customer receipt printed successfully");
  } catch (error) {
    console.error("Customer Receipt Printer Error", error);
  }
}