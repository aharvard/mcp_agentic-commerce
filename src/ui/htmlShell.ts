export function htmlShell(title: string, bodyHtml: string, extraScript = "") {
    return `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body{ font-family:system-ui,Arial,sans-serif; background-color: #f0f0f0; }
    .mcp-ui-container{ padding: 16px; }
    .card{ border:1px solid #ddd; border-radius:8px; padding:12px; margin:8px 0; background-color: #fff; }
    .name{ font-weight:600; font-size:1.2rem; margin-bottom:8px; }
    .meta{ color:#555; font-size:.9rem }
    .row{ margin:8px 0 }
    button{ cursor:pointer; }
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
      window.parent.postMessage({ type: "ui-size-change", payload: { height, width } }, "*");
    }
    const resizeObserver = new ResizeObserver(() => { postSize(); });
    resizeObserver.observe(mcpUiContainer);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      postSize();
    } else {
      window.addEventListener('DOMContentLoaded', postSize);
    }
  </script>
</body>
</html>`;
}
