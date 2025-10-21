import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
  const SHOPIFY_PRODUCT_TOKEN = process.env.SHOPIFY_PRODUCT_TOKEN!;

  try {
    const url = `https://${SHOPIFY_STORE}/admin/api/2024-04/products.json?limit=500`;
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_PRODUCT_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Shopify responded ${response.status}`);

    const { products } = await response.json();

    // ✅ Include body_html + first image
    const mappedProducts = products.map((p: any) => {
      const sku = p.variants?.[0]?.sku || "";
      const cleanTitle = p.title.replace(/Super Sale\s*/i, "").trim();

      return {
        id: p.id,
        title: cleanTitle,
        sku,
        body_html: p.body_html || null, // ✅ description
        image: p.image ? { src: p.image.src } : null, // ✅ featured image
      };
    });

    return res.status(200).json({ success: true, data: mappedProducts });
  } catch (err: any) {
    console.error("Shopify fetch error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
