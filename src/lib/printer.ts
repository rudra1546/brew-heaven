  import qz from "qz-tray";


  export async function printKitchenReceipt(order:any){

    try {

      // Connect to QZ Tray

      if(!qz.websocket.isActive()) {
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
          (item:any)=>
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


    } catch(error){

      console.error(
        "Printer Error",
        error
      );

    }

  }