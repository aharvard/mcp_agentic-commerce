import { htmlShell, inlinePublicAsset } from "./htmlShell.js";

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
            const favicon = b.website
                ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                      b.website
                  )}&sz=64`
                : `https://dummyimage.com/64x64/eeeeee/111111&text=${encodeURIComponent(
                      (b.name || " ").slice(0, 1)
                  )}`;
            return `<div class="card">
  <div class="media-row">
    <img class="media-img" src="${favicon}" alt="logo"/>
    <div class="media-body">
      <div class="name">${b.name}</div>
      <div class="meta">Rating: ${b.rating ?? "N/A"} • ${
                b.price ?? ""
            } • ${cats}</div>
      <div class="meta">${addr}</div>
      <div class="row"><a href="${url}" target="_blank" rel="noopener">Website</a></div>
      <button onclick="callTool('view_menu',{ business_id: '${
          b.id
      }' })">View Menu</button>
    </div>
  </div>
</div>`;
        })
        .join("\n");
    const squareLogo = inlinePublicAsset("Square_Jewel_Black.svg");
    const body = `<h2>Nearby Restaurants</h2>
     <img src="${squareLogo}" alt="Square Logo" style="height:20px;opacity:.8;margin-bottom:8px"/>
     ${
         items ||
         "<div>No results. Try a more specific search (e.g., 'bbq in South Congress') or a different cuisine.</div>"
     }`;
    return htmlShell("Nearby Restaurants", body, `postSize()`);
}
