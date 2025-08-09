import fs from "fs";
import path from "path";

function loadCss(): string {
    try {
        const cssPath = path.resolve(
            path.dirname(new URL(import.meta.url).pathname),
            "./style.css"
        );
        return fs.readFileSync(cssPath, "utf-8");
    } catch (err) {
        console.warn(
            "[ui] Failed to load style.css, falling back to empty styles:",
            err
        );
        return "";
    }
}

export function htmlShell(title: string, bodyHtml: string, extraScript = "") {
    const styles = loadCss();
    return `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>${title}</title>
  <style>${styles}</style>
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
