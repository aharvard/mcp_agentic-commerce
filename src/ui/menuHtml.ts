import { htmlShell } from "./htmlShell.js";

export function menuHtml(details: any) {
    const addr = `${details.location?.address1 ?? ""}${
        details.location?.city ? ", " + details.location.city : ""
    }`;
    const url = details.website || details.url || "#";
    const body = `
<h2>Restaurant</h2>
<div class=\"name\">${details.name ?? "Unknown"}</div>
<div class=\"meta\">${addr}</div>
<div class=\"row\">Rating: ${details.rating ?? "N/A"} (${
        details.review_count ?? 0
    } reviews)</div>
<div class=\"row\"><a href=\"${url}\" target=\"_blank\" rel=\"noopener\">Open Website</a></div>
<div class=\"row\"><button onclick=\"callTool('order_takeout',{ business_id: '${
        details.id
    }', items: [] })\">Start Takeout Order</button></div>`;
    return htmlShell("Restaurant Menu", body);
}
