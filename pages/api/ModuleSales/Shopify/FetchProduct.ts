import type { NextApiRequest, NextApiResponse } from "next";

interface ShopifyProduct {
  id: number;
  title: string;
  sku: string;
  body_html?: string | null;
  image?: { src: string } | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
  const SHOPIFY_PRODUCT_TOKEN = process.env.SHOPIFY_PRODUCT_TOKEN!;
  const search = (req.query.search as string)?.toLowerCase() || "";

  try {
    let allProducts: ShopifyProduct[] = [];
    let nextPageInfo: string | null = null;
    const limit = 250;

    do {
      const url: string = nextPageInfo
        ? `https://${SHOPIFY_STORE}/admin/api/2024-07/products.json?limit=${limit}&page_info=${nextPageInfo}`
        : `https://${SHOPIFY_STORE}/admin/api/2024-07/products.json?limit=${limit}`;

      const response: Response = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_PRODUCT_TOKEN,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Shopify responded ${response.status}`);

      const linkHeader = response.headers.get("link");
      const data: { products: any[] } = await response.json();

      // ✅ Include `image.src` + `body_html`
      const mapped: ShopifyProduct[] = data.products.map((p: any) => ({
        id: p.id,
        title: p.title,
        sku: p.variants?.[0]?.sku || "N/A",
        body_html: p.body_html || null,
        image: p.image ? { src: p.image.src } : null,
      }));

      allProducts = allProducts.concat(mapped);

      // Handle pagination
      const match = linkHeader?.match(/<[^>]+page_info=([^>]+)>; rel="next"/);
      nextPageInfo = match ? match[1] : null;
    } while (nextPageInfo);

    // Optional: search filter
    if (search) {
      allProducts = allProducts.filter((p) =>
        p.title.toLowerCase().includes(search)
      );
    }

    return res.status(200).json({ success: true, data: allProducts });
  } catch (err: any) {
    console.error("Shopify fetch error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
