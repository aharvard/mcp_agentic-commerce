import { htmlShell } from "./htmlShell.js";

export function receiptHtml(
    details: any,
    items: Array<{ name: string; qty: number; price: number }>
) {
    // Inline SVG logo
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 501.43" width="62" height="62" style="opacity: 0.9">
  <path d="M501.43,83.79v333.84c0,46.27-37.5,83.79-83.79,83.79H83.79c-46.28,0-83.79-37.5-83.79-83.79V83.79C0,37.52,37.52,0,83.79,0h333.84c46.29,0,83.79,37.5,83.79,83.79ZM410.23,117.65c0-14.61-11.85-26.45-26.45-26.45H117.63c-14.61,0-26.45,11.84-26.45,26.45v266.19c0,14.61,11.84,26.45,26.45,26.45h266.17c14.61,0,26.45-11.85,26.45-26.45V117.65h-.02ZM182.32,197.6c0-8.43,6.79-15.26,15.17-15.26h106.4c8.39,0,15.17,6.84,15.17,15.26v106.24c0,8.43-6.75,15.26-15.17,15.26h-106.4c-8.39,0-15.17-6.84-15.17-15.26v-106.24ZM778.95,221.94l-3.85-.86c-41.04-9.31-65.81-14.93-65.81-42,0-24.2,23.02-41.11,55.98-41.11,30.52,0,53.74,12.76,73.08,40.16,1.11,1.57,2.84,2.61,4.74,2.84,1.89.23,3.79-.35,5.23-1.59l32.16-27.71c2.68-2.31,3.15-6.22,1.1-9.09-24.19-33.89-67.01-54.12-114.56-54.12-31.56,0-60.34,9.26-81.04,26.08-21.73,17.65-33.21,41.93-33.21,70.23,0,63.76,54.74,76.94,98.71,87.53,4.45,1.08,8.77,2.1,12.95,3.08,39.74,9.36,66,15.54,66,43.74s-24.04,45.48-61.24,45.48c-33.71,0-64.35-17.1-86.28-48.14-1.1-1.55-2.8-2.59-4.68-2.84-1.88-.25-3.73.28-5.2,1.49l-33.86,27.99c-2.72,2.25-3.28,6.14-1.3,9.05,25.63,37.64,76.48,61.97,129.56,61.97,32.56,0,62.52-9.57,84.36-26.95,23.27-18.51,35.57-44.01,35.57-73.73,0-67.27-57.62-80.13-108.45-91.48ZM1126.34,177.74h-40.76c-3.74,0-6.78,3.04-6.78,6.78v19.06c-12.6-14.21-33.77-30.22-65.18-30.22s-56.88,12.32-75.37,35.62c-17.16,21.63-26.62,51.73-26.62,84.75s9.45,63.12,26.62,84.75c18.49,23.31,44.56,35.62,75.37,35.62,26.63,0,49.1-9.45,65.18-27.37v107.92c0,3.74,3.04,6.78,6.78,6.78h40.76c3.74,0,6.78-3.04,6.78-6.78V184.52c0-3.74-3.04-6.78-6.78-6.78ZM1080.11,287.17v13.57c0,39.86-21.97,65.61-55.98,65.61-36.15,0-57.74-27.15-57.74-72.61s21.58-72.61,57.74-72.61c34.01,0,55.98,25.93,55.98,66.05ZM1360.6,177.74h-40.76c-3.74,0-6.78,3.04-6.78,6.78v130.66c0,32.45-23.32,49.42-46.36,49.42-26.03,0-39.79-15.58-39.79-45.04v-135.03c0-3.74-3.04-6.78-6.78-6.78h-40.76c-3.74,0-6.78,3.04-6.78,6.78v146.41c0,50.53,30.93,83.17,78.8,83.17,23.76,0,43.95-9.67,61.67-29.56v17.96c0,3.74,3.04,6.78,6.78,6.78h40.76c3.74,0,6.78-3.04,6.78-6.78v-217.99c0-3.74-3.04-6.78-6.78-6.78ZM1607.93,367.07c-8.79-.24-12.72-4.78-12.72-14.7v-98.9c0-51.66-31.71-80.11-89.3-80.11-44.71,0-80.07,23.24-94.59,62.18-.66,1.78-.52,3.78.39,5.47.93,1.73,2.57,2.98,4.48,3.42l37.83,8.71c3.37.77,6.78-1.14,7.94-4.45,6.74-19.11,20.01-28.01,41.76-28.01,25.53,0,38.48,11.62,38.48,34.54v3.2l-62.73,12.98c-53.04,11.03-77.74,34.25-77.74,73.09s32.22,68.73,78.36,68.73c28.25,0,51.2-8.69,66.46-25.16,9.13,17.73,33.93,26.29,62.3,21.35,3.24-.57,5.6-3.38,5.6-6.69v-28.9c0-3.63-2.93-6.67-6.52-6.77ZM1542.21,300.54v26.89c0,27.56-27.28,41.98-54.24,41.98-20.26,0-32.35-10.13-32.35-27.1,0-19.37,14.63-26.41,38.23-31.5l48.36-10.27ZM1774.35,177.33c-3.17-.52-6.47-.77-10.09-.77-27.5,0-50.92,12.35-62.11,32.47v-24.51c0-3.74-3.04-6.78-6.78-6.78h-40.76c-3.74,0-6.78,3.04-6.78,6.78v217.99c0,3.74,3.04,6.78,6.78,6.78h40.76c3.74,0,6.78-3.04,6.78-6.78v-114.9c0-34.27,23.2-57.3,57.74-57.3,4.7,0,8.63.17,12.74.56,1.89.18,3.79-.45,5.2-1.73,1.41-1.28,2.22-3.11,2.22-5.02v-40.09c0-3.34-2.39-6.16-5.69-6.7ZM1973.75,206.72c-18.32-21.83-44.82-33.36-76.62-33.36s-59.09,12.34-79.33,34.76c-19.98,22.12-30.98,52.52-30.98,85.61,0,70.87,46.26,120.37,112.49,120.37,43.9,0,79.17-21.53,96.77-59.08.8-1.7.85-3.61.14-5.37-.71-1.76-2.14-3.15-3.91-3.82l-33.69-12.76c-3.39-1.28-7.27.37-8.63,3.68-8.08,19.63-26.56,30.9-50.68,30.9-33.08,0-56.1-23.59-60.26-61.64h154.16c3.74,0,6.78-3.04,6.78-6.78v-11.63c0-31.99-9.32-60.72-26.25-80.88ZM1945.22,264.82h-103.37c7.73-28.91,27.66-45.45,54.84-45.45,34.72,0,47.8,23.3,48.52,45.45Z"/>
</svg>`;
    const now = new Date();
    const date = now.toLocaleString();
    const orderId = `R-${now.getFullYear().toString().slice(-2)}${(
        now.getMonth() + 1
    )
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${(
        now.getTime() % 10000
    )
        .toString()
        .padStart(4, "0")}`;
    const subtotal = (items || []).reduce(
        (s, i) => s + (i.price || 0) * (i.qty || 0),
        0
    );
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    const lines =
        (items || [])
            .map((i) => {
                const line = (i.price || 0) * (i.qty || 0);
                return `<div class="rc-line"><span class="rc-left">${(
                    i.name || ""
                ).replace(/</g, "&lt;")}</span><span class="rc-right">${
                    i.qty
                } × $${(i.price || 0).toFixed(2)} — $${line.toFixed(
                    2
                )}</span></div>`;
            })
            .join("") || `<div class="rc-line rc-empty">No items</div>`;

    const body = `
<div class="receipt-stage">
  <div class="receipt-wrap">
    <div class="receipt">
      <div class="rc-header">
        <div class="rc-brand">${(details?.name || "Your Order")
            .toUpperCase()
            .replace(/</g, "&lt;")}</div>
        <div class="rc-sub">Thank you for your order!</div>
        <div class="rc-date">${date}</div>
        <div class="rc-order">Order #${orderId}</div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-body">
        ${lines}
        <div class="rc-divider dotted"></div>
        <div class="rc-line"><span class="rc-left">Subtotal</span><span class="rc-right">$${subtotal.toFixed(
            2
        )}</span></div>
        <div class="rc-line"><span class="rc-left">Tax</span><span class="rc-right">$${tax.toFixed(
            2
        )}</span></div>
        <div class="rc-line total"><span class="rc-left">Total</span><span class="rc-right">$${total.toFixed(
            2
        )}</span></div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-footer">
        ${logoSvg}
        <div class="rc-msg">This is a playful demo receipt. No real purchase was made.</div>
        <div class="rc-thanks">— Come back soon! —</div>
        <div class="rc-barcode" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</div>
<style>
  .receipt-stage{position:relative}
  .receipt-wrap{display:flex;justify-content:center;padding:8px}
  .receipt{background:#fffdfa;color:#111;width:360px;max-width:100%;
    border:1px solid #e6e1d8;border-radius:12px;padding:16px 16px 10px;margin-top:8px;
    box-shadow:0 8px 20px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
    background-image:
      radial-gradient(#efefef 1px, transparent 1px),
      linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.01) 40%, transparent 60%);
    background-size: 6px 6px, 100% 100%; background-position: 0 0, 0 0;
  }
  .rc-header{text-align:center;margin-bottom:8px}
  .rc-brand{font-weight:800;letter-spacing:.5px}
  .rc-sub{font-size:12px;color:#666}
  .rc-date,.rc-order{font-size:12px;color:#777}
  .rc-order{margin-top:2px}
  .rc-divider{border-top:2px dashed #e4e0d8;margin:10px 0}
  .rc-divider.dotted{border-top:2px dotted #e4e0d8}
  .rc-body{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace}
  .rc-line{display:flex;justify-content:space-between;gap:12px;padding:6px 0}
  .rc-line.total{font-weight:800}
  .rc-line .rc-left{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
  .rc-line .rc-right{text-align:right;flex:1}
  .rc-empty{color:#888}
  .rc-footer{margin-top:6px;text-align:center;color:#666;font-size:12px}
  .rc-footer svg{margin:4px auto 8px;display:block}
  .rc-thanks{font-weight:700;margin-top:6px}
  .rc-barcode{height:28px;width:160px;margin:10px auto 4px;background:
    repeating-linear-gradient(90deg,#111 0 2px, transparent 2px 4px),
    repeating-linear-gradient(90deg,transparent 0 6px, rgba(0,0,0,.35) 6px 7px, transparent 7px 10px);
    border-radius:2px}
</style>`;

    return htmlShell("Receipt", body);
}
