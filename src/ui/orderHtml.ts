import { htmlShell } from "./htmlShell.js";

export function orderHtml(
    details: any,
    items: Array<{ name: string; qty: number; price: number }>
) {
    const total = (items || []).reduce(
        (s, i) => s + (i.price || 0) * (i.qty || 1),
        0
    );
    const list = (items || [])
        .map(
            (i) =>
                `<li>${i.qty || 1} × ${i.name} — $${(
                    (i.price || 0) * (i.qty || 1)
                ).toFixed(2)}</li>`
        )
        .join("");
    const body = `
<h2>Takeout Order</h2>
<div class=\"row\"><strong>${details?.name ?? "Restaurant"}</strong></div>
<div class=\"row\">${items?.length ? "Items:" : "No items supplied."}</div>
<ul>${list}</ul>
<div class=\"row total\">Total: $${total.toFixed(2)}</div>
<button onclick=\"notify('Order placed!','info')\">Place order (simulate)</button>`;
    return htmlShell("Takeout Order", body);
}
