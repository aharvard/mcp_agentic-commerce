export function htmlShell(title: string, bodyHtml: string, extraScript = "") {
    return `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>${title}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body{
      font-family:system-ui,Arial,sans-serif;
      background-color: #f0f0f0;
    }
    .mcp-ui-container{
      padding: 16px;
    }
    .card{
      border:1px solid #ddd;
      border-radius:8px;
      padding:12px;
      margin:8px 0;
      background-color: #fff;
    }
    .name{
      font-weight:600;
      font-size:1.2rem;
      margin-bottom:8px;
    }
    .meta{        color:#555;font-size:.9rem}
    .row{margin:8px 0}
    button{      cursor:pointer;    }
  </style>
  <script>
    function callTool(toolName, params){
      console.log('[mcp-ui] posting tool', toolName, params);
      window.parent.postMessage({ type: 'tool', payload: { toolName, params } }, '*');
    }
    function notify(message, level){
      console.log('[mcp-ui] posting notify', level||'info', message);
      window.parent.postMessage({ type: 'notify', payload: { level: level||'info', data: message } }, '*');
    }
  </script>
  ${extraScript}
  </head>
<body>
    <div class="mcp-ui-container">${bodyHtml}</div>
    <script>
  const mcpUiContainer = document.querySelector('.mcp-ui-container');
  
  function postSize() {
    const height = mcpUiContainer.scrollHeight;
    const width = mcpUiContainer.scrollWidth;
    console.log('posting size', {height, width});
    window.parent.postMessage(
      {
        type: "ui-size-change",
        payload: {
          height: height,
          width: width, 
        },
      },
      "*",
    );
  }

  // Create ResizeObserver to watch for size changes
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // Post size whenever document size changes
      postSize();
    }
  });

  // Start observing the mcp-ui-container element
  resizeObserver.observe(mcpUiContainer);
  // Post initial size on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    postSize();
  } else {
    window.addEventListener('DOMContentLoaded', postSize);
  }
</script>
</body>
</html>`;
}

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
    return htmlShell(
        "Nearby Restaurants",
        `<h2>Nearby Restaurants</h2>${items || "<div>No results</div>"}`
    );
}

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
