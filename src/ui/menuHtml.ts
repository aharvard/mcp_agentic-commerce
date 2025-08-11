import { htmlShell } from "./htmlShell.js";

export function menuHtml(
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
            (i) =>
                `<div class=\"card\">\n  <div class=\"media-row\">\n    ${
                    i.imageUrl
                        ? `<img src=\"${i.imageUrl}\" alt=\"${i.name}\" class=\"media-img\"/>`
                        : ""
                }\n    <div class=\"media-body\">\n      <div class="name">${
                    i.name
                }</div>\n      ${
                    i.description
                        ? `<div class="meta">${i.description}</div>`
                        : ""
                }\n      <div class="row"><strong>$${i.price.toFixed(
                    2
                )}</strong></div>\n      <button onclick="callTool('order_takeout',{ business_id: '${businessId}', items: [{ name: '${i.name.replace(
                    /'/g,
                    "\\'"
                )}', qty: 1, price: ${
                    i.price
                } }] })">Order 1</button>\n    </div>\n  </div>\n</div>`
        )
        .join("\n");

    const body = `\n<p>menuHtml</p>\n<h2>Menu</h2>\n<div class="row"><strong>${businessName}</strong></div>\n${
        list || "<div>No menu items available.</div>"
    }\n`;
    return htmlShell("Menu", body);
}
