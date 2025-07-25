import { neon } from "@neondatabase/serverless";

const db = neon(process.env.TASKFLOW_DB_URL!);

type IntentType =
  | "contactperson"
  | "contactnumber"
  | "emailaddress"
  | "address"
  | "deliveryaddress"
  | "typeclient"
  | "remarks"
  | "companygroup"
  | "area"
  | "date_created"
  | "date_updated"
  | "fulldetails"
  | "countbystatus"; // ✅ NEW

export async function detectAccountsReply(
  cleanMessage: string,
  referenceId: string
): Promise<{ reply: string } | null> {
  let intent: IntentType | null = null;
  let isEnglish = false;
  let statusToCount: string | null = null;

  // Detect intent
  if (/contact\s*person|sino\s+ang\s+contact\s*person/i.test(cleanMessage)) {
    intent = "contactperson";
  } else if (/contact\s*(number|no)|contact\s*number\s+ng/i.test(cleanMessage)) {
    intent = "contactnumber";
  } else if (/email\s*(address)?|email\s+address\s+ni/i.test(cleanMessage)) {
    intent = "emailaddress";
  } else if (/delivery\s*address|preferred\s+delivery\s+location/i.test(cleanMessage)) {
    intent = "deliveryaddress";
  } else if (/uri\s+ng\s+client|anong\s+uri\s+ng\s+client|type\s+of\s+client/i.test(cleanMessage)) {
    intent = "typeclient";
  } else if (/remarks|komento|feedback/i.test(cleanMessage)) {
    intent = "remarks";
  } else if (/address|lokasyon|location|saan\s+matatagpuan/i.test(cleanMessage)) {
    intent = "address";
  } else if (/company\s+group|kabilang\s+ang\s+.*?\s+sa\s+.*?group/i.test(cleanMessage)) {
    intent = "companygroup";
  } else if (/area|nakabase\s+ang/i.test(cleanMessage)) {
    intent = "area";
  } else if (/ginawa\s+ang\s+record|date\s+created/i.test(cleanMessage)) {
    intent = "date_created";
  } else if (/huling\s+na-update|date\s+updated/i.test(cleanMessage)) {
    intent = "date_updated";
  } else if (/full\s+details|buong\s+detalye|complete\s+details|lahat\s+ng\s+impormasyon/i.test(cleanMessage)) {
    intent = "fulldetails";
  } else if (
    /ilan|gaano\s+karami|total\s+(accounts|companies)?\s*(ng|na)?\s*(active|inactive|new\s*client|non[-\s]*buying|for\s*deletion)/i.test(cleanMessage) ||
    /how\s+many\s+(active|inactive|new\s*client|non[-\s]*buying|for\s*deletion)/i.test(cleanMessage)
  ) {
    intent = "countbystatus";
    if (/active/i.test(cleanMessage)) statusToCount = "Active";
    else if (/inactive/i.test(cleanMessage)) statusToCount = "Inactive";
    else if (/new\s*client/i.test(cleanMessage)) statusToCount = "New Client";
    else if (/non[-\s]*buying/i.test(cleanMessage)) statusToCount = "Non-Buying";
    else if (/for\s*deletion/i.test(cleanMessage)) statusToCount = "For Deletion";
  }

  if (!intent) return null;

  // Detect English
  if (/\b(who|what|where|type|contact|email|remarks|address|details|group|area|complete|full|how|many|total|accounts|inactive|active)\b/i.test(cleanMessage)) {
    isEnglish = true;
  }

  // Handle countbystatus
  if (intent === "countbystatus") {
    if (!statusToCount) {
      return {
        reply: isEnglish
          ? "Please specify a valid status like active, inactive, new client, etc."
          : "Pakispecify po ang tamang status gaya ng active, inactive, new client, atbp.",
      };
    }

    try {
      const countQuery = `SELECT COUNT(*) FROM accounts WHERE LOWER(status) = LOWER($1) AND referenceid = $2;`;
      const countResult = await db(countQuery, [statusToCount, referenceId]);
      const count = countResult?.[0]?.count ?? 0;

      const answer = isEnglish
        ? `There are ${count} accounts with status "${statusToCount}".`
        : `Mayroong ${count} accounts na may status na "${statusToCount}".`;

      return { reply: answer };
    } catch (error) {
      console.error("❌ CountByStatus DB error:", error);
      return {
        reply: isEnglish
          ? "An error occurred while fetching the count."
          : "Nagkaroon ng error habang kinukuha ang bilang.",
      };
    }
  }

  // Extract company name
  const extractCompanyName = () => {
    return cleanMessage
      .replace(/sino\s+ang|ano\s+ang|pwede\s+ko\s+bang\s+malaman|pakibigay|ibigay\s+mo|can\s+you\s+tell\s+me|what\s+is|who\s+is|give\s+me|i\s+want\s+to\s+know|contact\s*(person|number|no)?|email\s*(address)?|ng|ni|kay|para\s+sa|tungkol\s+sa|type\s+of\s+client|delivery\s+address|remarks|feedback|komento|address|location|lokasyon|saan\s+matatagpuan|company\s+group|area|date\s+(created|updated)|full\s+details|complete\s+details|buong\s+detalye|\bof\b/gi, "")
      .replace(/[?.!]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const companyname = extractCompanyName();
  if (!companyname) return null;

  try {
    const exactQuery = `
      SELECT * FROM accounts
      WHERE LOWER(companyname) = LOWER($1) AND referenceid = $2
      LIMIT 1;
    `;
    let rows = await db(exactQuery, [companyname, referenceId]);

    if (!rows || rows.length === 0) {
      const partialQuery = `
        SELECT * FROM accounts
        WHERE LOWER(companyname) ILIKE $1 AND referenceid = $2
        LIMIT 1;
      `;
      rows = await db(partialQuery, [`${companyname.toLowerCase()}%`, referenceId]);
    }

    if (!rows || rows.length === 0) {
      return {
        reply: isEnglish
          ? `No record found for company "${companyname}".`
          : `Walang record para sa company na "${companyname}".`,
      };
    }

    const row = rows[0];
    let answer = "";

    switch (intent) {
      case "contactperson":
        answer = isEnglish
          ? `The contact person of **${row.companyname}** is ${row.contactperson}.`
          : `Ang contact person ng **${row.companyname}** ay si ${row.contactperson}.`;
        break;
      case "contactnumber":
        answer = isEnglish
          ? `The contact number of **${row.companyname}** is ${row.contactnumber}.`
          : `Ang contact number ng **${row.companyname}** ay ${row.contactnumber}.`;
        break;
      case "emailaddress":
        answer = isEnglish
          ? `The email address of **${row.companyname}** is ${row.emailaddress}.`
          : `Ang email address ng **${row.companyname}** ay ${row.emailaddress}.`;
        break;
      case "address":
        answer = isEnglish
          ? `The address of **${row.companyname}** is ${row.address}.`
          : `Ang address ng **${row.companyname}** ay ${row.address}.`;
        break;
      case "deliveryaddress":
        answer = isEnglish
          ? `The delivery address of **${row.companyname}** is ${row.deliveryaddress}.`
          : `Ang delivery address ng **${row.companyname}** ay ${row.deliveryaddress}.`;
        break;
      case "typeclient":
        answer = isEnglish
          ? `The type of client of **${row.companyname}** is ${row.typeclient}.`
          : `Ang uri ng client ng **${row.companyname}** ay ${row.typeclient}.`;
        break;
      case "remarks":
        answer = isEnglish
          ? `The remarks for **${row.companyname}** is: ${row.remarks}.`
          : `Ang remarks para sa **${row.companyname}** ay ${row.remarks}.`;
        break;
      case "companygroup":
        answer = isEnglish
          ? `**${row.companyname}** belongs to the company group: ${row.companygroup}.`
          : `Ang **${row.companyname}** ay kabilang sa company group na ${row.companygroup}.`;
        break;
      case "area":
        answer = isEnglish
          ? `**${row.companyname}** is based in ${row.area}.`
          : `Nakabase ang **${row.companyname}** sa ${row.area}.`;
        break;
      case "date_created":
        answer = isEnglish
          ? `The record for **${row.companyname}** was created on ${row.date_created}.`
          : `Ginawa ang record ng **${row.companyname}** noong ${row.date_created}.`;
        break;
      case "date_updated":
        answer = isEnglish
          ? `The record for **${row.companyname}** was last updated on ${row.date_updated}.`
          : `Huling na-update ang record ng **${row.companyname}** noong ${row.date_updated}.`;
        break;
      case "fulldetails":
        answer = isEnglish
          ? `Here are the complete details for **${row.companyname}**:\n\n` +
            `• Contact Person: ${row.contactperson}\n` +
            `• Contact Number: ${row.contactnumber}\n` +
            `• Email Address: ${row.emailaddress}\n` +
            `• Address: ${row.address}\n` +
            `• Delivery Address: ${row.deliveryaddress}\n` +
            `• Type of Client: ${row.typeclient}\n` +
            `• Remarks: ${row.remarks}\n` +
            `• Company Group: ${row.companygroup}\n` +
            `• Area: ${row.area}\n` +
            `• Date Created: ${row.date_created}\n` +
            `• Date Updated: ${row.date_updated}`
          : `Narito ang buong detalye para sa **${row.companyname}**:\n\n` +
            `• Contact Person: ${row.contactperson}\n` +
            `• Contact Number: ${row.contactnumber}\n` +
            `• Email Address: ${row.emailaddress}\n` +
            `• Address: ${row.address}\n` +
            `• Delivery Address: ${row.deliveryaddress}\n` +
            `• Uri ng Client: ${row.typeclient}\n` +
            `• Remarks: ${row.remarks}\n` +
            `• Company Group: ${row.companygroup}\n` +
            `• Area: ${row.area}\n` +
            `• Petsa ng Pagkakagawa: ${row.date_created}\n` +
            `• Petsa ng Huling Update: ${row.date_updated}`;
        break;
    }

    return { reply: answer };
  } catch (error) {
    console.error("❌ Accounts DB query error:", error);
    return {
      reply: isEnglish
        ? "An error occurred while fetching the information."
        : "Nagkaroon ng error habang kinukuha ang impormasyon.",
    };
  }
}
