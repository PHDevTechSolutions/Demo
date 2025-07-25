import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.TASKFLOW_DB_URL,
});

// 👇 Function to get date range from message
export function parseDateRange(input: string): { start: string; end: string } | null {
  const today = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  const getStartOfWeek = (d: Date) => {
    const day = d.getDay() || 7;
    const newDate = new Date(d);
    newDate.setDate(d.getDate() - day + 1);
    return newDate;
  };

  const getStartOfLastWeek = () => {
    const lastWeek = getStartOfWeek(new Date());
    lastWeek.setDate(lastWeek.getDate() - 7);
    return lastWeek;
  };

  const contains = (...keywords: string[]) =>
    keywords.some(k => input.includes(k.toLowerCase()));

  if (contains("araw", "ngayong araw", "today"))
    return { start: toISO(today), end: toISO(today) };

  if (contains("kahapon", "yesterday")) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return { start: toISO(yesterday), end: toISO(yesterday) };
  }

  if (contains("ngayong linggo", "this week")) {
    const start = getStartOfWeek(today);
    return { start: toISO(start), end: toISO(today) };
  }

  if (contains("nakaraang linggo", "last week")) {
    const start = getStartOfLastWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: toISO(start), end: toISO(end) };
  }

  if (contains("ngayong buwan", "this month")) {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: toISO(start), end: toISO(today) };
  }

  if (contains("nakaraang buwan", "last month")) {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start: toISO(start), end: toISO(end) };
  }

  if (contains("ngayong taon", "this year")) {
    const start = new Date(today.getFullYear(), 0, 1);
    return { start: toISO(start), end: toISO(today) };
  }

  if (contains("nakaraang taon", "last year")) {
    const start = new Date(today.getFullYear() - 1, 0, 1);
    const end = new Date(today.getFullYear() - 1, 11, 31);
    return { start: toISO(start), end: toISO(end) };
  }

  const months: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11
  };

  for (const [name, monthIndex] of Object.entries(months)) {
    if (input.includes(name)) {
      const year = today.getFullYear();
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0);
      return { start: toISO(start), end: toISO(end) };
    }
  }

  return null;
}

// 👇 Progress-based reply function
export async function detectProgressReply(message: string, referenceid: string) {
  const dateRange = parseDateRange(message);
  const messageLower = message.toLowerCase();
  const isEnglish = /[a-z]/i.test(message) && !/[\u00C0-\u024F]/.test(message);

  // total quotation amount
  if (messageLower.includes("quotation") && messageLower.includes("amount") && !messageLower.includes("para kay")) {
    const result = await pool.query(`
      SELECT COALESCE(SUM(quotationamount), 0) AS total FROM progress WHERE referenceid = $1
    `, [referenceid]);
    const total = parseFloat(result.rows[0].total).toFixed(2);
    return {
      reply: isEnglish ? `The total quotation amount is ₱${total}.` : `Ang kabuuang quotation amount ay ₱${total}.`
    };
  }

  // total sales order amount
  if (messageLower.includes("sales order") && messageLower.includes("amount") && !messageLower.includes("para kay")) {
    const result = await pool.query(`
      SELECT COALESCE(SUM(soamount), 0) AS total FROM progress WHERE referenceid = $1
    `, [referenceid]);
    const total = parseFloat(result.rows[0].total).toFixed(2);
    return {
      reply: isEnglish ? `The total sales order amount is ₱${total}.` : `Ang kabuuang sales order amount ay ₱${total}.`
    };
  }

  // total actual sales
  if (messageLower.includes("actual sales") && !messageLower.includes("ng")) {
    const result = await pool.query(`
      SELECT COALESCE(SUM(actualsales), 0) AS total FROM progress WHERE referenceid = $1
    `, [referenceid]);
    const total = parseFloat(result.rows[0].total).toFixed(2);
    return {
      reply: isEnglish ? `The total actual sales is ₱${total}.` : `Ang kabuuang actual sales ay ₱${total}.`
    };
  }

  // total actual sales ng [CompanyName]
  const matchActualSalesCompany = messageLower.match(/actual sales ng (.+)/);
  if (matchActualSalesCompany) {
    const company = matchActualSalesCompany[1].trim();
    const result = await pool.query(`
      SELECT COALESCE(SUM(actualsales), 0) AS total FROM progress WHERE referenceid = $1 AND LOWER(companyname) = LOWER($2)
    `, [referenceid, company]);
    const total = parseFloat(result.rows[0].total).toFixed(2);
    return {
      reply: isEnglish ? `The total actual sales of ${company} is ₱${total}.` : `Ang kabuuang actual sales ni ${company} ay ₱${total}.`
    };
  }

  // kabuuang quotation number
  if (messageLower.includes("quotation number")) {
    const result = await pool.query(`
      SELECT COUNT(DISTINCT quotationnumber) AS count FROM progress WHERE referenceid = $1
    `, [referenceid]);
    return {
      reply: isEnglish ? `The number of unique quotation numbers is ${result.rows[0].count}.` : `Ang bilang ng unique quotation number ay ${result.rows[0].count}.`
    };
  }

  // kabuuang sales order number
  if (messageLower.includes("sales order number")) {
    const result = await pool.query(`
      SELECT COUNT(DISTINCT soamount) AS count FROM progress WHERE referenceid = $1
    `, [referenceid]);
    return {
      reply: isEnglish ? `The number of unique sales order amounts is ${result.rows[0].count}.` : `Ang bilang ng unique sales order number ay ${result.rows[0].count}.`
    };
  }

  // quotation amount para kay [CompanyName]
  const matchQuotationCompany = messageLower.match(/quotation amount para kay (.+)/);
  if (matchQuotationCompany) {
    const company = matchQuotationCompany[1].trim();
    const result = await pool.query(`
      SELECT COALESCE(SUM(quotationamount), 0) AS total FROM progress WHERE referenceid = $1 AND LOWER(companyname) = LOWER($2)
    `, [referenceid, company]);
    const total = parseFloat(result.rows[0].total).toFixed(2);
    return {
      reply: isEnglish ? `The total quotation amount for ${company} is ₱${total}.` : `Ang kabuuang quotation amount para kay ${company} ay ₱${total}.`
    };
  }

  // sales order amount para kay [CompanyName]
  const matchSOCompany = messageLower.match(/sales order amount para kay (.+)/);
  if (matchSOCompany) {
    const company = matchSOCompany[1].trim();
    const result = await pool.query(`
      SELECT COALESCE(SUM(soamount), 0) AS total FROM progress WHERE referenceid = $1 AND LOWER(companyname) = LOWER($2)
    `, [referenceid, company]);
    const total = parseFloat(result.rows[0].total).toFixed(2);
    return {
      reply: isEnglish ? `The total sales order amount for ${company} is ₱${total}.` : `Ang kabuuang sales order amount para kay ${company} ay ₱${total}.`
    };
  }

  // fallback to date-based actualsales query
  if (dateRange) {
    const { start, end } = dateRange;

    try {
      const result = await pool.query(
        `SELECT COALESCE(SUM(actualsales), 0) AS total FROM progress
         WHERE referenceid = $1 AND DATE(date_created) BETWEEN $2 AND $3`,
        [referenceid, start, end]
      );

      const total = parseFloat(result.rows[0].total).toFixed(2);
      return {
        reply: isEnglish
          ? `Your total sales from ${start} to ${end} is ₱${total}.`
          : `Ang kabuuang benta mo mula ${start} hanggang ${end} ay ₱${total}.`,
      };
    } catch (error) {
      console.error("❌ detectProgressReply error:", error);
      return {
        reply: isEnglish
          ? "There was an error retrieving the sales data."
          : "Nagkaroon ng error sa pagkuha ng sales data."
      };
    }
  }

  return null;
}
