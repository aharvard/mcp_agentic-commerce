import { htmlShell } from "./htmlShell.js";

export function restaurantDetailsHtml(details: any) {
    const addr = `${details.location?.address1 ?? ""}${
        details.location?.city ? ", " + details.location.city : ""
    }`;
    const url = details.website || details.url || "#";
    const phone = details.phone || "";
    const hours = (details.hours || []).join(" · ");
    const color = (details as any)?.brandColor || "#a3bffa";

    const body = `
<h2>Restaurant Details</h2>
<div class="card">
  <div class="media-row">
    <div class="logo-col">
      <div class="logo-swatch" style="background:${color}"></div>
    </div>
    <div class="media-body">
      <div class="name">${details.name ?? "Unknown"}</div>
      <div class="meta">Rating: ${details.rating ?? "N/A"} • ${
        details.price ?? ""
    } • ${(details.categories || []).map((c: any) => c.title).join(", ")}</div>
      <div class="meta">${addr}</div>
      ${
          phone
              ? `<div class="row">Phone: <a href="tel:${phone}">${phone}</a></div>`
              : ""
      }
      ${hours ? `<div class="row">Hours: ${hours}</div>` : ""}
      <div class="row"><a href="${url}" target="_blank" rel="noopener">Open Website</a></div>
      <div class="actions-col" style="margin-top:8px">
        <button class="btn btn-secondary" onclick="callTool('view_menu',{ business_id: '${
            details.id
        }' })">View Menu</button>
        <button class="btn btn-primary" onclick="callTool('order_takeout',{ business_id: '${
            details.id
        }', items: [] })">Start Takeout Order</button>
      </div>
    </div>
  </div>
</div>`;

    return htmlShell("Restaurant Details", body);
}
