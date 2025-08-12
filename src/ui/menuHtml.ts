import { htmlShell } from "./htmlShell.js";

export function menuHtml(
    businessId: string,
    businessName: string,
    items: Array<{
        id: string;
        name: string;
        description?: string;
        price: number;
        imageUrl?: string;
    }>
) {
    const list = (items || [])
        .map(
            (i) =>
                `<div class=\"card\">\n  <div class=\"media-row\">\n    ${
                    i.imageUrl
                        ? `<img src=\"${i.imageUrl}\" alt=\"${i.name}\" class=\"media-img\"/>`
                        : ""
                }\n    <div class=\"media-body\">\n      <div class="name">${
                    i.name
                }</div>\n      ${
                    i.description
                        ? `<div class="meta">${i.description}</div>`
                        : ""
                }\n      <div class="row"><strong>$${i.price.toFixed(
                    2
                )}</strong></div>\n      <div class=\"menu-controls\" id=\"ctrl-${
                    i.id
                }\" data-id=\"${i.id}\" data-name=\"${i.name
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "\\'")}\" data-price=\"${
                    i.price
                }\">\n        <button class=\"btn btn-secondary\" data-action=\"add\" data-id=\"${
                    i.id
                }\">Add</button>\n      </div>\n    </div>\n  </div>\n</div>`
        )
        .join("\n");

    const body = `
<h2>Menu</h2>
<div class="row"><strong>${businessName}</strong></div>
<div class="list-compact" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${
        list || "<div>No menu items available.</div>"
    }</div>

<div id="cart" class="card" style="margin-top:16px">
  <div class="name">Your Order</div>
  <div id="cart-items" class="meta">No items yet.</div>
  <div class="row" style="display:flex;justify-content:space-between;align-items:center">
    <div><strong>Total: $<span id="cart-total">0.00</span></strong></div>
    <button id="checkoutBtn" class="btn btn-primary" disabled>Checkout</button>
  </div>
</div>
<script>
  (function(){
    var cartMap = new Map();

    function renderSummary(){
      var listEl = document.getElementById('cart-items');
      var totalEl = document.getElementById('cart-total');
      var btn = document.getElementById('checkoutBtn');
      var total = 0; var items = []; var rows = [];
      cartMap.forEach(function(v){ total += v.qty * v.price; items.push({name:v.name, qty:v.qty, price:v.price}); rows.push(v.name + ' × ' + v.qty + ' — $' + (v.price * v.qty).toFixed(2)); });
      listEl.innerHTML = rows.length ? rows.map(function(r){ return '<div class="row">'+r+'</div>'; }).join('') : 'No items yet.';
      totalEl.textContent = total.toFixed(2);
      btn.disabled = items.length === 0;
      btn.onclick = function(){ callTool('order_takeout', { business_id: '${businessId}', items: items }); };
      try { postSize && postSize(); } catch(e){}
    }

    function renderControl(id){
      var ctrl = document.getElementById('ctrl-'+id); if(!ctrl) return;
      var item = cartMap.get(id) || { id: id, name: ctrl.getAttribute('data-name'), price: Number(ctrl.getAttribute('data-price')), qty: 0 };
      if(!item.qty){
        ctrl.innerHTML = '<button class="btn btn-secondary" data-action="add" data-id="'+id+'">Add</button>';
      } else {
        ctrl.innerHTML = '<div class="qty-controls">'
          + '<button class="qty-btn" data-action="dec" data-id="'+id+'">-</button>'
          + '<span class="qty-count">'+item.qty+'</span>'
          + '<button class="qty-btn" data-action="inc" data-id="'+id+'">+</button>'
          + '</div>';
      }
    }

    function cartAdd(id){
      var ctrl = document.getElementById('ctrl-'+id); if(!ctrl) return;
      var item = cartMap.get(id) || { id: id, name: ctrl.getAttribute('data-name'), price: Number(ctrl.getAttribute('data-price')), qty: 0 };
      item.qty += 1; cartMap.set(id, item); renderControl(id); renderSummary();
    }
    function cartInc(id){ var item = cartMap.get(id); if(!item){ cartAdd(id); return; } item.qty += 1; cartMap.set(id,item); renderControl(id); renderSummary(); }
    function cartDec(id){ var item = cartMap.get(id); if(!item) return; item.qty -= 1; if(item.qty <= 0){ cartMap.delete(id); } else { cartMap.set(id,item); } renderControl(id); renderSummary(); }
    // Expose for inline onclick context
    window.cartAdd = cartAdd; window.cartInc = cartInc; window.cartDec = cartDec;

    document.addEventListener('click', function(ev){
      var t = ev.target;
      if(!t || !t.getAttribute) return;
      var action = t.getAttribute('data-action');
      var id = t.getAttribute('data-id');
      if(!action || !id) return;
      if(action === 'add') { cartAdd(id); }
      if(action === 'inc') { cartInc(id); }
      if(action === 'dec') { cartDec(id); }
    });
    Array.prototype.forEach.call(document.querySelectorAll('.menu-controls'), function(n){ renderControl(n.getAttribute('data-id')); });
    renderSummary();
  })();
</script>
`;
    return htmlShell("Menu", body);
}
