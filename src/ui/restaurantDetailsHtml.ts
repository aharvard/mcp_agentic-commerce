import { htmlShell } from "./htmlShell.js";

export function restaurantDetailsHtml(details: any) {
    const addr = `${details.location?.address1 ?? ""}${
        details.location?.city ? ", " + details.location.city : ""
    }`;
    const url = details.website || details.url || "#";
    const phone = details.phone || "";
    const hours = (details.hours || []).join(" · ");
    const squareNote = details?.square?.usesSquare
        ? `<div class="row"><em>Ordering available in chat</em></div>`
        : `<div class="promo-banner">
             <div class="title">In‑chat ordering not enabled</div>
             <div>Customers using assistants try to order here. Enable in‑chat ordering with Square to accept orders directly.</div>
             <div class="actions"><a href="https://squareup.com/us/en/point-of-sale/online-checkout" target="_blank" rel="noopener">Learn about Square Ordering</a></div>
           </div>`;
    const color = (details as any)?.brandColor || "#a3bffa";
    const body = `<p>restaurantDetailsHtml</p>
<h2>Restaurant Details</h2>
<div class="name">${details.name ?? "Unknown"}</div>
<div class="row"><span class="badge" style="background:${color};color:#fff">Brand</span></div>
<div class="meta">${addr}</div>
${
    phone
        ? `<div class="row">Phone: <a href="tel:${phone}">${phone}</a></div>`
        : ""
}
${hours ? `<div class="row">Hours: ${hours}</div>` : ""}
<div class="row">Rating: ${details.rating ?? "N/A"} (${
        details.review_count ?? 0
    } reviews)</div>
<div class="row"><a href="${url}" target="_blank" rel="noopener">Open Website</a></div>
${squareNote}
<div class="row"><button onclick="callTool('order_takeout',{ business_id: '${
        details.id
    }', items: [] })">Start Takeout Order</button></div>`;
    return htmlShell("Restaurant Details", body);
}
