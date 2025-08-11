import { htmlShell } from "./htmlShell.js";

export function searchResultsHtml(list: any[], title: string) {
    const rows = (list || [])
        .map((b) => {
            const cats = (b.categories || [])
                .map((c: any) => c.title)
                .join(", ");
            const addr = `${b.location?.address1 ?? ""}${
                b.location?.city ? ", " + b.location.city : ""
            }`;
            const color = (b as any)?.brandColor || "#a3bffa";
            return `<div class="list-row">
  <div class="logo-col">
    <div class="logo-swatch" style="background:${color}"></div>
  </div>
  <div class="main-col">
    <div class="name">${b.name}</div>
    <div class="meta">Rating: ${b.rating ?? "N/A"} • ${
                b.price ?? ""
            } • ${cats}</div>
    <div class="meta">${addr}</div>
  </div>
  <div class="actions-col">
    <button class="btn btn-secondary" onclick="callTool('view_restaurant',{ business_id: '${
        b.id
    }' })">Details</button>
    <button class="btn btn-primary" onclick="callTool('order_takeout',{ business_id: '${
        b.id
    }', items: [] })">Order Now</button>
  </div>
</div>`;
        })
        .join("\n");

    const body = `<h2>${title || "Search Results"}</h2>
      <div class="list-compact">
        ${
            rows ||
            `<div class="meta">No local results. Try a different city, add a state (e.g., "Austin, TX"), or use a broader query.</div>`
        }
      </div>`;
    return htmlShell("Search Results", body, `postSize()`);
}
