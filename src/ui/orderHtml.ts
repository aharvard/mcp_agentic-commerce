import { htmlShell } from "./htmlShell.js";

export function orderHtml(
    details: any,
    items: Array<{ name: string; qty: number; price: number }>
) {
    const rows = (items || [])
        .map((i, idx) => {
            const qty = i.qty || 1;
            const line = (i.price || 0) * qty;
            return `<tr>
      <td><img src=\"https://dummyimage.com/48x48/eeeeee/111111&text=${
          idx + 1
      }\" alt=\"item\" style=\"width:48px;height:48px;border:1px solid var(--border);border-radius:8px\"/></td>
      <td>${i.name}</td>
      <td>$${(i.price || 0).toFixed(2)}</td>
      <td>
        <button onclick=\"callTool('order_takeout',{ business_id: '${
            details?.id || ""
        }', items: ${JSON.stringify(items).replace(
                /"/g,
                "&quot;"
            )} })\">-</button>
        <span style=\"display:inline-block;width:24px;text-align:center\">${qty}</span>
        <button onclick=\"callTool('order_takeout',{ business_id: '${
            details?.id || ""
        }', items: ${JSON.stringify(items).replace(
                /"/g,
                "&quot;"
            )} })\">+</button>
      </td>
      <td style=\"text-align:right\">$${line.toFixed(2)}</td>
      <td><button onclick=\"notify('Remove not implemented','info')\">Remove</button></td>
    </tr>`;
        })
        .join("");
    const total = (items || []).reduce(
        (s, i) => s + (i.price || 0) * (i.qty || 1),
        0
    );
    const table = `
<table style=\"width:100%;border-collapse:collapse\">
  <thead>
    <tr class=\"meta\">
      <th style=\"text-align:left;padding-bottom:8px\"></th>
      <th style=\"text-align:left;padding-bottom:8px\">Item</th>
      <th style=\"text-align:left;padding-bottom:8px\">Price</th>
      <th style=\"text-align:left;padding-bottom:8px\">Qty</th>
      <th style=\"text-align:right;padding-bottom:8px\">Line</th>
      <th></th>
    </tr>
  </thead>
  <tbody>${
      rows ||
      `<tr><td colspan=\"6\" class=\"meta\">No items supplied.</td></tr>`
  }</tbody>
  <tfoot>
    <tr>
      <td colspan=\"4\"></td>
      <td style=\"text-align:right;font-weight:600\">Total: $${total.toFixed(
          2
      )}</td>
      <td></td>
    </tr>
  </tfoot>
</table>`;

    const body = `
<h2>Takeout Order</h2>
<div class=\"row\"><strong>${details?.name ?? "Restaurant"}</strong></div>
<div class=\"row\">${table}</div>
<button onclick=\"notify('Order placed!','info')\">Place order (simulate)</button>`;
    return htmlShell("Takeout Order", body);
}
