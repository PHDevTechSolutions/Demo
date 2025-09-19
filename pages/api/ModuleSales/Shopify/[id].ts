import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
  const SHOPIFY_PRODUCT_TOKEN = process.env.SHOPIFY_PRODUCT_TOKEN!;

  const { id } = req.query; // product ID from URL
  const { title, product_type, vendor, status, sku } = req.body; // add sku

  try {
    // Build Shopify payload — include SKU
    const payload = {
      product: {
        id,
        title,
        product_type,
        vendor,
        status,
        variants: [
          {
            sku, // set SKU in the first variant
          },
        ],
      },
    };

    const shopifyRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-04/products/${id}.json`,
      {
        method: "PUT",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_PRODUCT_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!shopifyRes.ok) {
      const msg = await shopifyRes.text();
      throw new Error(`Shopify responded ${shopifyRes.status}: ${msg}`);
    }

    const json = await shopifyRes.json();
    return res.status(200).json({ success: true, data: json.product });
  } catch (err: any) {
    console.error("Shopify update error:", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "Update failed" });
  }
}
