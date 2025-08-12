import { htmlShell } from "./htmlShell.js";

export function orderHtml(
    details: any,
    items: Array<{ name: string; qty: number; price: number }>
) {
    const initialItemsJs = JSON.stringify(items || []).replace(/</g, "\\u003c");

    const body = `
<h2>Takeout Order</h2>
<div class="row"><strong>${details?.name ?? "Restaurant"}</strong></div>

<div class="order-card">
<table class="order-table">
  <colgroup>
    <col class="col-idx" />
    <col class="col-name" />
    <col class="col-price" />
    <col class="col-qty" />
    <col class="col-line" />
    <col class="col-actions" />
  </colgroup>
  <thead>
    <tr class="meta">
      <th class="th-idx"></th>
      <th class="th-name">Item</th>
      <th class="th-price">Price</th>
      <th class="th-qty">Qty</th>
      <th class="th-line">Line</th>
      <th class="th-actions"></th>
    </tr>
  </thead>
  <tbody id="order-rows"></tbody>
  <tfoot>
    <tr>
      <td colspan="4"></td>
      <td class="line-amount">Total: $<span id="order-total">0.00</span></td>
      <td></td>
    </tr>
  </tfoot>
</table>
</div>

<div style="margin-top:12px">
  <button id="placeOrderBtn" class="btn btn-primary place-btn">Place fake order</button>
</div>

<style>
  .order-card{background:#fff;color:#111;border:1px solid var(--border);border-radius:12px;padding:16px;margin-top:8px;box-shadow:0 2px 10px rgba(0,0,0,0.06)}
  .order-table{width:100%;border-collapse:collapse}
  .order-table th,.order-table td{padding:12px 10px;vertical-align:middle}
  .order-table thead th{color:#666;font-weight:600}
  .order-table tbody tr{border-bottom:2px dotted #eee}
  .order-table tbody tr:last-child{border-bottom:none}

  /* Column sizing to avoid layout shift */
  .col-idx{width:68px}
  .col-price{width:120px}
  .col-qty{width:160px}
  .col-line{width:160px}
  .col-actions{width:140px}
  .th-line,.line-amount,.cell-line{ text-align:right }
  .cell-price,.cell-line{ white-space:nowrap; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; font-variant-numeric:tabular-nums }

  .qty-controls{display:inline-flex;align-items:center;gap:10px}
  .qty-btn{width:32px;height:32px;border-radius:9999px;border:1px solid var(--border);background:#f7f7f7;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
  .qty-btn:hover{background:#efefef}
  .qty-count{display:inline-block;min-width:24px;text-align:center;font-weight:600}

  .line-amount{text-align:right;padding-right:24px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-variant-numeric:tabular-nums}
  .actions-col{padding-left:18px;text-align:right}
  .actions-col .btn{min-width:96px}
</style>

<script>
(function(){
  var businessId = ${JSON.stringify(details?.id || "")};
  var orderItems = ${initialItemsJs};

  function toCurrency(n){ return (Number(n)||0).toFixed(2); }

  function render(){
    var tbody = document.getElementById('order-rows');
    var totalEl = document.getElementById('order-total');
    if(!tbody || !totalEl) return;

    var rowsHtml = orderItems.map(function(i, idx){
      var qty = i.qty || 0; if(qty < 0) qty = 0;
      var line = (Number(i.price||0) * qty);
      return '<tr>'
        + '<td class="cell-idx"><img src="https://dummyimage.com/48x48/eeeeee/111111&text='+(idx+1)+'" alt="item" style="width:48px;height:48px;border:1px solid var(--border);border-radius:8px"/></td>'
        + '<td class="cell-name">'+ (i.name || '') +'</td>'
        + '<td class="cell-price">$'+ toCurrency(i.price) +'</td>'
        + '<td class="cell-qty">'
          + '<div class="qty-controls">'
          +   '<button class="qty-btn" data-action="dec" data-idx="'+idx+'">-</button>'
          +   '<span class="qty-count">'+ qty +'</span>'
          +   '<button class="qty-btn" data-action="inc" data-idx="'+idx+'">+</button>'
          + '</div>'
        + '</td>'
        + '<td class="cell-line">$'+ toCurrency(line) +'</td>'
        + '<td class="actions-col"><button class="btn" data-action="remove" data-idx="'+idx+'">Remove</button></td>'
      + '</tr>';
    }).join('');

    tbody.innerHTML = rowsHtml || '<tr><td colspan="6" class="meta">No items supplied.</td></tr>';

    var total = orderItems.reduce(function(sum, i){ return sum + (Number(i.price||0) * (Number(i.qty||0))); }, 0);
    totalEl.textContent = toCurrency(total);

    try { postSize && postSize(); } catch(e){}
  }

  function inc(idx){ if(!orderItems[idx]) return; orderItems[idx].qty = (orderItems[idx].qty||0) + 1; }
  function dec(idx){ if(!orderItems[idx]) return; var q=(orderItems[idx].qty||0)-1; if(q<=0){ orderItems.splice(idx,1); } else { orderItems[idx].qty = q; } }
  function removeItem(idx){ if(idx>=0 && idx<orderItems.length){ orderItems.splice(idx,1); } }

  document.addEventListener('click', function(ev){
    var t = ev.target;
    if(!t || !t.getAttribute) return;
    var action = t.getAttribute('data-action');
    if(!action) return;
    var idxStr = t.getAttribute('data-idx');
    var idx = idxStr == null ? -1 : parseInt(idxStr, 10);

    if(action === 'inc'){ inc(idx); render(); }
    if(action === 'dec'){ dec(idx); render(); }
    if(action === 'remove'){ removeItem(idx); render(); }
  });

  var placeBtn = document.getElementById('placeOrderBtn');
  if(placeBtn){
    placeBtn.addEventListener('click', function(){
      callTool('view_receipt', { business_id: businessId, items: orderItems });
    });
  }

  render();
})();
</script>`;

    return htmlShell("Takeout Order", body);
}
