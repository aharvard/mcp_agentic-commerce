import { htmlShell } from "./htmlShell.js";

export function restaurantsHtml(list: any[]) {
    const items = list
        .map((b) => {
            const cats = (b.categories || [])
                .map((c: any) => c.title)
                .join(", ");
            const addr = `${b.location?.address1 ?? ""}${
                b.location?.city ? ", " + b.location.city : ""
            }`;
            const url = b.website || b.url || "#";
            return `<div class=\"card\">
  <div class=\"name\">${b.name}</div>
  <div class=\"meta\">Rating: ${b.rating ?? "N/A"} • ${
                b.price ?? ""
            } • ${cats}</div>
  <div class=\"meta\">${addr}</div>
  <div class=\"meta\"><a href=\"${url}\" target=\"_blank\" rel=\"noopener\">Website</a></div>
  <button onclick=\"callTool('view_menu',{ business_id: '${
      b.id
  }' })\">View Menu</button>
</div>`;
        })
        .join("\n");
    const body = `<h2>Nearby Restaurants</h2>${
        items ||
        "<div>No results. Try a more specific search (e.g., 'bbq in South Congress') or a different cuisine.</div>"
    }`;
    return htmlShell("Nearby Restaurants", body);
}
