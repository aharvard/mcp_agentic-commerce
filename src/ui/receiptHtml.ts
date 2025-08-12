import { htmlShell } from "./htmlShell.js";

export function receiptHtml(
    details: any,
    items: Array<{ name: string; qty: number; price: number }>
) {
    // Use a regular URL for the logo - will be served from Netlify's dist/public folder
    const logo = "/public/Square_Logo_2025_Black.svg";
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
        <img src="${logo}" alt="logo" class="rc-logo-footer"/>
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
  .rc-thanks{font-weight:700;margin-top:6px}
  .rc-logo-footer{width:62px;height:62px;opacity:.9;margin:4px auto 8px;display:block}
  .rc-barcode{height:28px;width:160px;margin:10px auto 4px;background:
    repeating-linear-gradient(90deg,#111 0 2px, transparent 2px 4px),
    repeating-linear-gradient(90deg,transparent 0 6px, rgba(0,0,0,.35) 6px 7px, transparent 7px 10px);
    border-radius:2px}
</style>`;

    return htmlShell("Receipt", body);
}
