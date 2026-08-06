import qz from "qz-tray";


export async function printKitchenReceipt(order:any){

  try {

    // Connect to QZ Tray

    if(!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }


    // Select printer

    const printerName = await qz.printers.find();


    const config = qz.configs.create(
      printerName
    );


    const items = order.order_items
      .map(
        (item:any)=>
        `${item.quantity} x ${item.item_name}`
      )
      .join("\n");


    const receipt = `

       BREW HEAVEN

      KITCHEN COPY

----------------------

Order : #${order.order_number}

Table : ${order.table_number}


${items}


----------------------

Notes:
${order.special_instructions || "None"}


Time:
${new Date(order.created_at).toLocaleString()}


    `;


    const data = [
      {
        type:"raw",
        format:"plain",
        data:receipt
      }
    ];


    // Print 2 copies

    await qz.print(
      config,
      data
    );


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