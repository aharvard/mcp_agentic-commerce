import { htmlShell } from "./htmlShell.js";

export function catalogHtml(
    businessId: string,
    businessName: string,
    items: Array<{
        id: string;
        name: string;
        description?: string;
        price: number;
        imageUrl?: string;
    }>
) {
    const list = (items || [])
        .map(
            (i) => `<div class=\"card\">
  <div class=\"media-row\">
    ${
        i.imageUrl
            ? `<img src=\"${i.imageUrl}\" alt=\"${i.name}\" class=\"media-img\"/>`
            : ""
    }
    <div class=\"media-body\">
      <div class="name">${i.name}</div>
      ${i.description ? `<div class="meta">${i.description}</div>` : ""}
      <div class="row"><strong>$${i.price.toFixed(2)}</strong></div>
      <button onclick="callTool('order_takeout',{ business_id: '${businessId}', items: [{ name: '${i.name.replace(
                /'/g,
                "\\'"
            )}', qty: 1, price: ${i.price} }] })">Order 1</button>
    </div>
  </div>
</div>`
        )
        .join("\n");

    const body = `
<h2>Menu</h2>
<div class="row"><strong>${businessName}</strong></div>
${list || "<div>No menu items available.</div>"}
`;
    return htmlShell("Menu", body);
}
