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
  </head>
<body>
  <div class="mcp-ui-container">${bodyHtml}
    <div class="footer-note">This demo does not contain real seller data; all content is synthetic and for demonstration purposes only.</div>
  </div>
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
    // Also ensure we post after full load (images, fonts)
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      postSize();
      setTimeout(postSize, 0);
      setTimeout(postSize, 300);
    } else {
      window.addEventListener('DOMContentLoaded', () => { postSize(); setTimeout(postSize, 0); setTimeout(postSize, 300); });
    }
    window.addEventListener('load', () => { postSize(); setTimeout(postSize, 0); });

    // Image load fallback
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', () => postSize());
      img.addEventListener('error', () => postSize());
    });

    // Mutation observer as extra safety for dynamic content
    const mutationObserver = new MutationObserver(() => postSize());
    mutationObserver.observe(mcpUiContainer, { childList: true, subtree: true, attributes: true });

    // Allow callers to append extra JS that relies on postSize being defined
    try { ${extraScript} } catch (e) { /* no-op */ }
  </script>
</body>
</html>`;
}

function guessMime(ext: string): string {
    switch (ext.toLowerCase()) {
        case ".svg":
            return "image/svg+xml";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".gif":
            return "image/gif";
        case ".webp":
            return "image/webp";
        default:
            return "application/octet-stream";
    }
}

export function inlinePublicAsset(fileName: string): string {
    try {
        const baseDir = path.resolve(
            path.dirname(new URL(import.meta.url).pathname),
            "../public"
        );
        const filePath = path.join(baseDir, fileName);
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(fileName);
        const mime = guessMime(ext);
        if (ext.toLowerCase() === ".svg") {
            const text = buffer.toString("utf-8");
            return `data:${mime};utf8,${encodeURIComponent(text)}`;
        }
        const b64 = buffer.toString("base64");
        return `data:${mime};base64,${b64}`;
    } catch (err) {
        console.warn(`[ui] Failed to inline public asset ${fileName}:`, err);
        return "";
    }
}
