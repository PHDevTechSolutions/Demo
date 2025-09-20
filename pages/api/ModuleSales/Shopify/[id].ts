import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }

  const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
  const SHOPIFY_PRODUCT_TOKEN = process.env.SHOPIFY_PRODUCT_TOKEN;

  if (!SHOPIFY_STORE || !SHOPIFY_PRODUCT_TOKEN) {
    return res
      .status(500)
      .json({ success: false, error: "Missing Shopify environment variables" });
  }

  const { id } = req.query;
  const { title, product_type, vendor, status, sku, description } = req.body; // ✅ description supported

  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Product ID is required" });
  }

  try {
    // 🔍 Fetch existing product
    const existingRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-04/products/${id}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_PRODUCT_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (!existingRes.ok) {
      const msg = await existingRes.text();
      throw new Error(`Shopify responded ${existingRes.status}: ${msg}`);
    }

    const { product: existingProduct } = await existingRes.json();

    // 🛠 Update SKU (first variant only)
    const updatedVariants = existingProduct.variants.map((v: any, idx: number) =>
      idx === 0 ? { ...v, sku: sku || v.sku } : v
    );

    // 📝 Build payload (description = body_html)
    const payload = {
      product: {
        id,
        title: title ?? existingProduct.title,
        product_type: product_type ?? existingProduct.product_type,
        vendor: vendor ?? existingProduct.vendor,
        status: status ?? existingProduct.status,
        body_html:
          description !== undefined
            ? description
            : existingProduct.body_html, // ✅ allow null or keep existing
        variants: updatedVariants,
      },
    };

    // 🚀 Send update request
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
