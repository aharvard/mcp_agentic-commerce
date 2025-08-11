import { htmlShell, inlinePublicAsset } from "./htmlShell.js";

export function searchResultsHtml(list: any[]) {
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
      <button onclick="callTool('view_restaurant',{ business_id: '${
          b.id
      }' })">View Details</button>
    </div>
  </div>
</div>`;
        })
        .join("\n");
    const squareLogo = inlinePublicAsset("Square_Jewel_Black.svg");
    const body = `<p>searchResultsHtml</p><h2>Search Results</h2>
     <img src="${squareLogo}" alt="Square Logo" style="height:20px;opacity:.8;margin-bottom:8px"/>
     <div class="items">
     ${
         items ||
         `<div>No local results. Try a different city, add a state (e.g., "Austin, TX"), or use a broader query.</div>`
     }
     </div>`;
    return htmlShell("Search Results", body, `postSize()`);
}
