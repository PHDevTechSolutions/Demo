import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.TASKFLOW_DB_URL;
if (!dbUrl) throw new Error("TASKFLOW_DB_URL is not set in environment variables.");

const sql = neon(dbUrl);

// 🧹 Clean values — convert "" to null or number
function cleanValue(v: any) {
  if (v === "" || v === undefined) return null;
  if (!isNaN(v) && v !== null) return Number(v);
  return v;
}

async function update(user: any) {
  try {
    const {
      id, referenceid, manager, tsm,
      companyname, companygroup, contactperson, contactnumber, emailaddress,
      typeclient, address, deliveryaddress, area,
      projectname, projectcategory, projecttype, source,
      startdate, enddate, activitynumber, typeactivity,
      activitystatus, remarks, callback, typecall,
      quotationnumber, quotationamount, sonumber, soamount,
      callstatus, actualsales, targetquota, ticketreferencenumber,
      wrapup, inquiries, csragent, paymentterm, deliverydate, drnumber,
    } = user;

    const updateRes = await sql`
      UPDATE activity
      SET companygroup = ${companygroup}, contactperson = ${contactperson},
          contactnumber = ${contactnumber}, emailaddress = ${emailaddress},
          typeclient = ${typeclient}, address = ${address},
          deliveryaddress = ${deliveryaddress}, area = ${area},
          projectname = ${projectname}, projectcategory = ${projectcategory},
          projecttype = ${projecttype}, source = ${source},
          activitystatus = ${activitystatus},
          date_updated = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'
      WHERE id = ${id}
      RETURNING *;
    `;

    if (updateRes.length === 0)
      return { success: false, error: "User not found or already updated." };

    await sql`
      INSERT INTO progress (
        ticketreferencenumber, wrapup, inquiries, referenceid, manager, tsm, companyname,
        companygroup, contactperson, contactnumber, emailaddress, typeclient, address,
        deliveryaddress, area, projectname, projectcategory, projecttype, source, startdate,
        enddate, activitynumber, typeactivity, activitystatus, remarks, callback, typecall,
        quotationnumber, quotationamount, sonumber, soamount, callstatus, actualsales,
        targetquota, csragent, paymentterm, deliverydate, drnumber
      )
      VALUES (
        ${cleanValue(ticketreferencenumber)}, ${wrapup}, ${cleanValue(inquiries)}, ${referenceid},
        ${manager}, ${tsm}, ${companyname}, ${companygroup}, ${contactperson},
        ${contactnumber}, ${emailaddress}, ${typeclient}, ${address}, ${deliveryaddress},
        ${area}, ${projectname}, ${projectcategory}, ${projecttype}, ${source}, ${startdate},
        ${enddate}, ${activitynumber}, ${typeactivity}, ${activitystatus}, ${remarks},
        ${callback}, ${typecall}, ${quotationnumber}, ${cleanValue(quotationamount)},
        ${sonumber}, ${cleanValue(soamount)}, ${callstatus}, ${cleanValue(actualsales)},
        ${cleanValue(targetquota)}, ${csragent}, ${cleanValue(paymentterm)}, ${deliverydate}, ${drnumber}
      );
    `;

    // 🟢 Notifications
    if ((typeactivity === "Outbound Call" || typeactivity === "Inbound Call") && callback) {
      const msg = `You have a callback in "${companyname}". Please make a call or activity.`;
      await sql`
        INSERT INTO notification (referenceid, manager, tsm, csragent, message, callback, date_created, type)
        VALUES (
          ${referenceid}, ${manager}, ${tsm},
          ${typeclient === "CSR Inquiries" ? csragent : null},
          ${msg}, ${callback}, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila', 'Callback Notification'
        );
      `;
    }

    if (
      [
        "Ringing Only", "No Requirements",
        "Sent Quotation - Standard", "Sent Quotation - With Special Price",
        "Sent Quotation - With SPF", "Not Connected With The Company",
        "Waiting for Projects", "Cannot Be Reached",
      ].includes(typecall)
    ) {
      const msg = `You have a new follow-up from "${companyname}". The status is "${typecall}".`;
      await sql`
        INSERT INTO notification (referenceid, manager, tsm, csragent, message, date_created, type)
        VALUES (
          ${referenceid}, ${manager}, ${tsm},
          ${typeclient === "CSR Inquiries" ? csragent : null},
          ${msg}, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila', 'Follow-Up Notification'
        );
      `;
    }

    if (typeclient === "CSR Inquiries" && csragent) {
      const msg = `The Ticket Number "${ticketreferencenumber}" of "${companyname}" (Status: ${typecall}).`;
      await sql`
        INSERT INTO notification (referenceid, manager, tsm, csragent, message, date_created, type)
        VALUES (
          ${referenceid}, ${manager}, ${tsm}, ${csragent},
          ${msg}, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila', 'CSR Notification'
        );
      `;
    }

    return { success: true, data: updateRes };
  } catch (err: any) {
    console.error("❌ Error updating user:", err);
    return { success: false, error: err.message || "Database update failed." };
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    const result = await update(body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("❌ Error in PUT /EditUser:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
