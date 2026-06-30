(function () {

  // ── helpers ─────────────────────────────────────────────────────────────────

  const PRODUCT_IMAGES = {
    'cookies-box': '/images/cookie-closeup.jpg',
  };

  function getProductImage(id) {
    for (const [prefix, src] of Object.entries(PRODUCT_IMAGES)) {
      if (id.startsWith(prefix)) return src;
    }
    return null;
  }

  function formatPrice(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  // ── styles ───────────────────────────────────────────────────────────────────

  const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='cd'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0.24 0 0 0 0 0.18 0 0 0 0 0.11 0 0 0 0.035 0'/></filter><rect width='100%25' height='100%25' filter='url(%23cd)'/></svg>\")";

  function injectStyles() {
    const el = document.createElement('style');
    el.textContent = `
      /* ── backdrop ── */
      #cart-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(61, 45, 28, 0.42);
        z-index: 950;
        opacity: 0;
        pointer-events: none;
        transition: opacity 300ms ease-out;
      }
      #cart-backdrop.open {
        opacity: 1;
        pointer-events: auto;
      }

      /* ── drawer panel ── */
      #cart-drawer {
        position: fixed;
        top: 0; right: 0; bottom: 0;
        width: 400px;
        background: #fbf2e0;
        background-image: ${GRAIN};
        z-index: 960;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 300ms ease-out;
        box-shadow: -6px 0 32px rgba(61, 45, 28, 0.14);
      }
      #cart-drawer.open {
        transform: translateX(0);
      }

      /* ── header ── */
      .cd-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 22px 24px 18px;
        border-bottom: 1px dashed #d4b896;
        flex-shrink: 0;
      }
      .cd-title {
        font-family: "Fraunces", "Times New Roman", serif;
        font-size: 1.25rem;
        font-weight: 600;
        font-style: italic;
        color: #3d2d1c;
        margin: 0;
      }
      .cd-close {
        width: 32px; height: 32px;
        border-radius: 50%;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 18px;
        color: #8b6f4d;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .cd-close:hover { background: #f4dcc0; color: #3d2d1c; }

      /* ── body (scrollable) ── */
      .cd-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px 24px 4px;
      }
      .cd-body::-webkit-scrollbar { width: 4px; }
      .cd-body::-webkit-scrollbar-track { background: transparent; }
      .cd-body::-webkit-scrollbar-thumb { background: #d4b896; border-radius: 4px; }

      /* ── cart item ── */
      .cd-item {
        display: flex;
        gap: 14px;
        padding: 16px 0;
        border-bottom: 1px dashed rgba(61, 45, 28, 0.1);
      }
      .cd-item:last-child { border-bottom: none; }

      .cd-item-img {
        width: 66px; height: 66px;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
        background: #f4dcc0;
        display: flex; align-items: center; justify-content: center;
      }
      .cd-item-img img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
      }

      .cd-item-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .cd-item-name {
        font-family: "Nunito", system-ui, sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: #3d2d1c;
        line-height: 1.35;
      }
      .cd-item-price {
        font-family: "Nunito", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 700;
        color: #c4615a;
      }
      .cd-item-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
      }
      .cd-qty-btn {
        width: 28px; height: 28px;
        border-radius: 8px;
        border: 1.5px solid #c8ad92;
        background: transparent;
        cursor: pointer;
        font-size: 17px;
        font-family: "Nunito", system-ui, sans-serif;
        color: #5c4530;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, border-color 0.15s;
        line-height: 1;
        padding: 0 0 1px;
        flex-shrink: 0;
      }
      .cd-qty-btn:hover { background: #f4dcc0; border-color: #8b6f4d; }
      .cd-qty-count {
        font-family: "Nunito", system-ui, sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: #3d2d1c;
        min-width: 20px;
        text-align: center;
      }
      .cd-remove {
        font-family: "Caveat", cursive;
        font-size: 15px;
        color: #87a07a;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        transition: color 0.15s;
        line-height: 1;
      }
      .cd-remove:hover { color: #5c4530; }

      /* ── empty state ── */
      .cd-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 56px 24px;
        gap: 18px;
        text-align: center;
      }
      .cd-empty-msg {
        font-family: "Caveat", cursive;
        font-size: 20px;
        color: #8b6f4d;
        line-height: 1.45;
      }

      /* ── footer ── */
      .cd-footer {
        padding: 16px 24px 28px;
        border-top: 1px dashed #d4b896;
        flex-shrink: 0;
        background: #fbf2e0;
      }
      .cd-subtotal-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 16px;
      }
      .cd-subtotal-label {
        font-family: "Nunito", system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8b6f4d;
      }
      .cd-subtotal-amount {
        font-family: "Fraunces", "Times New Roman", serif;
        font-size: 1.65rem;
        font-weight: 600;
        color: #3d2d1c;
      }
      @keyframes noosh-glow {
        0%   { background: #c4615a; opacity: 0.52; }
        35%  { background: #e8a8a2; opacity: 0.40; }
        65%  { background: #f4c8b6; opacity: 0.44; }
        100% { background: #c4615a; opacity: 0.52; }
      }

      .cd-checkout-btn {
        width: 100%;
        background: #c4615a;
        color: #fbf2e0;
        font-family: "Nunito", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: none;
        border-radius: 14px;
        padding: 15px;
        cursor: pointer;
        box-shadow: 0 4px 0 -1px #5c4530;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        margin-bottom: 10px;
        position: relative;
        isolation: isolate;
      }
      .cd-checkout-btn::before {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 20px;
        filter: blur(14px);
        z-index: -1;
        pointer-events: none;
        animation: noosh-glow 3.5s ease-in-out infinite;
        animation-delay: -0.6s;
      }
      .cd-checkout-btn:disabled::before {
        opacity: 0;
      }
      .cd-checkout-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 0 -1px #5c4530;
      }
      .cd-checkout-btn:active:not(:disabled) {
        transform: translateY(2px);
        box-shadow: 0 2px 0 -1px #5c4530;
      }
      .cd-checkout-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }
      .cd-checkout-note {
        font-family: "Caveat", cursive;
        font-size: 14px;
        color: #c4b09a;
        text-align: center;
        margin: 0;
      }

      /* ── error banner ── */
      .cd-error {
        display: none;
        padding: 10px 24px;
        background: #fdf0ee;
        color: #c4615a;
        font-family: "Nunito", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 600;
        text-align: center;
        border-bottom: 1px dashed #ecae9a;
        flex-shrink: 0;
      }
      .cd-error.visible { display: block; }

      /* ── pickup section ── */
      .cd-pickup {
        padding: 16px 24px 16px;
        border-top: 1px dashed #d4b896;
        flex-shrink: 0;
      }
      .cd-pickup-title {
        font-family: "Fraunces", "Times New Roman", serif;
        font-size: 1rem;
        font-weight: 600;
        font-style: italic;
        color: #3d2d1c;
        margin: 0 0 12px;
      }

      /* ── pickup title shimmer — plays twice then settles ── */
      @keyframes cd-shimmer-sweep {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      .cd-pickup-shimmer {
        background: linear-gradient(90deg,
          #3d2d1c 20%,
          #c4615a 38%,
          #f8d4ba 50%,
          #c4615a 62%,
          #3d2d1c 80%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: cd-shimmer-sweep 1.3s ease-in-out 2;
      }
      .cd-pickup-confirm {
        font-family: "Caveat", cursive;
        font-size: 16px;
        margin: 12px 0 0;
        line-height: 1.4;
      }
      .cd-pickup-done       { color: #87a07a; }
      .cd-pickup-incomplete { color: #c4b09a; }

      /* toggle + edit + card + delight: hidden on desktop, shown by mobile JS below */
      .cd-pickup-toggle { display: none; }
      .cd-pickup-edit   { display: none; }
      .cd-pickup-card   { display: none; }
      .cd-delight       { display: none; }

      /* ── mobile pickup collapsible ── */
      @media (max-width: 767px) {
        .cd-pickup-title { display: none; }

        .cd-pickup-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          background: #f4dcc0;
          border: 1.5px solid #d4b896;
          border-radius: 12px;
          padding: 10px 14px;
          font-family: "Caveat", cursive;
          font-size: 17px;
          color: #3d2d1c;
          cursor: pointer;
          text-align: left;
          margin-bottom: 10px;
          transition: background 0.15s;
        }
        .cd-pickup-toggle:hover { background: #eacfaa; }
        .cd-pickup-chevron {
          font-size: 14px;
          color: #8b6f4d;
          flex-shrink: 0;
          display: inline-block;
          transition: transform 250ms ease;
        }
        .cd-pickup-toggle[aria-expanded="true"] .cd-pickup-chevron {
          transform: rotate(180deg);
        }

        .cd-pickup-collapsible {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 300ms ease, opacity 250ms ease;
        }
        .cd-pickup-collapsible.open {
          max-height: 700px;
          opacity: 1;
        }

        /* softer section dividers on mobile */
        .cd-header { border-bottom-color: rgba(196, 97, 90, 0.35); }
        .cd-pickup { border-top-color:    rgba(196, 97, 90, 0.35); }
        .cd-footer { border-top-color:    rgba(196, 97, 90, 0.35); padding-top: 12px; }

        /* tighten pickup section padding so card sits 16px from drawer edge */
        .cd-pickup { padding: 16px 16px 8px; }

        /* hide the text confirm on mobile — card shows the date instead */
        .cd-pickup-confirm { display: none; }

        /* ── collapsed-selection card ── */
        .cd-pickup-card {
          width: 100%;
          text-align: left;
          background: rgba(244, 200, 182, 0.18);
          border: 1px solid rgba(196, 97, 90, 0.18);
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(196, 97, 90, 0.05);
          transition: background 200ms ease;
          margin-bottom: 0;
        }
        .cd-pickup-card:active { background: rgba(244, 200, 182, 0.3); }
        .cd-pickup-card-top {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .cd-pickup-card-label {
          font-family: "Nunito", system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #a4b894;
        }
        .cd-pickup-card-date {
          font-family: "Caveat", cursive;
          font-size: 18px;
          color: #c4615a;
        }
        .cd-pickup-card-divider {
          border: none;
          border-top: 1px solid rgba(244, 200, 182, 0.3);
          margin: 12px 0 10px;
        }
        .cd-pickup-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cd-pickup-card-change {
          font-family: "Caveat", cursive;
          font-size: 14px;
          color: #a4b894;
        }
        .cd-pickup-card-chevron {
          font-family: "Nunito", system-ui, sans-serif;
          font-size: 16px;
          color: #c4615a;
          display: inline-block;
          transition: transform 200ms ease;
        }
        .cd-pickup-card[aria-expanded="true"] .cd-pickup-card-chevron {
          transform: rotate(90deg);
        }

        /* make cd-body a flex column so .cd-delight can use margin:auto to center */
        .cd-body { display: flex; flex-direction: column; }
        .cd-empty { flex: 1; }

        /* fix: single-item border when .cd-delight follows the item */
        #cd-body[data-single="true"] .cd-item { border-bottom: none; }

        /* ── single-item decorative note ── */
        .cd-delight {
          margin: auto;
          text-align: center;
          font-family: "Caveat", cursive;
          font-size: 16px;
          font-style: italic;
          color: #a4b894;
          opacity: 0.7;
          pointer-events: none;
          padding: 0 8px;
        }
      }

      /* ── mobile ── */
      @media (max-width: 600px) {
        #cart-drawer { width: 100%; }
      }
    `;
    document.head.appendChild(el);
  }

  // ── DOM ──────────────────────────────────────────────────────────────────────

  let backdrop, drawer, cdBody, cdPickup, cdFooter, pickupConfirmEl, errorEl, subtotalEl, checkoutBtn;
  let cdPickupToggle, cdPickupToggleText, cdPickupCollapsible, cdPickupEditBtn;
  let cdPickupCard, cdPickupCardDate;
  let pickupData = null;
  let pickerExpanded = false;

  function buildDOM() {
    backdrop = document.createElement('div');
    backdrop.id = 'cart-backdrop';

    drawer = document.createElement('aside');
    drawer.id = 'cart-drawer';
    drawer.setAttribute('aria-label', 'shopping cart');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.innerHTML = `
      <div class="cd-header">
        <h2 class="cd-title">your sugar rush list</h2>
        <button class="cd-close" id="cd-close-btn" aria-label="close cart">✕</button>
      </div>
      <div class="cd-error" id="cd-error">something went wrong — please try again</div>
      <div class="cd-body" id="cd-body"></div>
      <div class="cd-pickup" id="cd-pickup" style="display:none">
        <h3 class="cd-pickup-title">when would you like to pick up?</h3>
        <button class="cd-pickup-toggle" id="cd-pickup-toggle" aria-expanded="false">
          <span id="cd-pickup-toggle-text">📅 choose pickup date &amp; time</span>
          <span class="cd-pickup-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="cd-pickup-collapsible" id="cd-pickup-collapsible">
          <div id="cd-pickup-mount"></div>
        </div>
        <p class="cd-pickup-confirm cd-pickup-incomplete" id="cd-pickup-confirm">please choose a pickup date and time</p>
        <button class="cd-pickup-edit" id="cd-pickup-edit">edit</button>
        <button class="cd-pickup-card" id="cd-pickup-card" aria-expanded="false">
          <div class="cd-pickup-card-top">
            <span aria-hidden="true">📅</span>
            <span class="cd-pickup-card-label">pickup</span>
          </div>
          <div class="cd-pickup-card-date" id="cd-pickup-card-date"></div>
          <hr class="cd-pickup-card-divider">
          <div class="cd-pickup-card-footer">
            <span class="cd-pickup-card-change">✎ change pickup</span>
            <span class="cd-pickup-card-chevron" aria-hidden="true">›</span>
          </div>
        </button>
      </div>
      <div class="cd-footer" id="cd-footer" style="display:none">
        <div class="cd-subtotal-row">
          <span class="cd-subtotal-label">subtotal</span>
          <span class="cd-subtotal-amount" id="cd-subtotal">$0.00</span>
        </div>
        <button class="cd-checkout-btn" id="cd-checkout-btn">checkout</button>
        <p class="cd-checkout-note">you'll be redirected to secure checkout</p>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    cdBody              = document.getElementById('cd-body');
    cdPickup            = document.getElementById('cd-pickup');
    cdFooter            = document.getElementById('cd-footer');
    pickupConfirmEl     = document.getElementById('cd-pickup-confirm');
    cdPickupToggle      = document.getElementById('cd-pickup-toggle');
    cdPickupToggleText  = document.getElementById('cd-pickup-toggle-text');
    cdPickupCollapsible = document.getElementById('cd-pickup-collapsible');
    cdPickupEditBtn     = document.getElementById('cd-pickup-edit');
    cdPickupCard        = document.getElementById('cd-pickup-card');
    cdPickupCardDate    = document.getElementById('cd-pickup-card-date');
    errorEl             = document.getElementById('cd-error');
    subtotalEl          = document.getElementById('cd-subtotal');
    checkoutBtn         = document.getElementById('cd-checkout-btn');
  }

  // ── open / close ─────────────────────────────────────────────────────────────

  function openDrawer() {
    backdrop.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('cd-close-btn').focus();
    if (isMobile()) {
      pickerExpanded = false;
      cdPickupCollapsible.classList.remove('open');
      cdPickupToggle.setAttribute('aria-expanded', 'false');
      updatePickupMobileState();
      updateDelightState();
    }
    shimmerPickupTitle();
  }

  function closeDrawer() {
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── mobile picker ────────────────────────────────────────────────────────────

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function shimmerPickupTitle() {
    if (cdPickup.style.display === 'none') return;
    const title = drawer.querySelector('.cd-pickup-title');
    if (!title) return;
    // Reset any in-progress shimmer so re-opens always play from the start
    title.classList.remove('cd-pickup-shimmer');
    void title.offsetWidth; // force reflow to restart animation
    // Delay start until after the 300ms drawer slide-in transition
    setTimeout(function () {
      title.classList.add('cd-pickup-shimmer');
      title.addEventListener('animationend', function () {
        title.classList.remove('cd-pickup-shimmer');
      }, { once: true });
    }, 350);
  }

  function openPicker() {
    pickerExpanded = true;
    cdPickupCollapsible.classList.add('open');
    cdPickupToggle.setAttribute('aria-expanded', 'true');
    updatePickupMobileState();
    updateDelightState();
  }

  function closePicker() {
    pickerExpanded = false;
    cdPickupCollapsible.classList.remove('open');
    cdPickupToggle.setAttribute('aria-expanded', 'false');
    updatePickupMobileState();
    updateDelightState();
  }

  function updatePickupMobileState() {
    if (!isMobile()) return;
    const hasSelection = !!(pickupData && pickupData.date && pickupData.time);
    if (hasSelection) {
      // Card is the persistent control when a date is chosen
      cdPickupToggle.style.display = 'none';
      cdPickupEditBtn.style.display = 'none';
      cdPickupCard.style.display = 'block';
      cdPickupCard.setAttribute('aria-expanded', pickerExpanded ? 'true' : 'false');
      const label = (pickupData.dateLabel || '').replace(/ \d{4}$/, '').toLowerCase();
      cdPickupCardDate.textContent = `${label} · ${pickupData.timeLabel}`;
    } else {
      // No selection yet — show the choose-date toggle
      cdPickupCard.style.display = 'none';
      cdPickupEditBtn.style.display = 'none';
      cdPickupToggle.style.display = 'flex';
      cdPickupToggleText.textContent = '📅 choose pickup date & time';
    }
  }

  // ── pickup state ─────────────────────────────────────────────────────────────

  function loadPickupData() {
    try {
      pickupData = JSON.parse(localStorage.getItem('noosh_pickup')) || null;
    } catch (e) { pickupData = null; }
  }

  function updatePickupConfirm() {
    if (!pickupConfirmEl) return;
    if (pickupData && pickupData.date && pickupData.time) {
      const label = (pickupData.dateLabel || '').replace(/ \d{4}$/, ''); // strip year
      pickupConfirmEl.textContent = `📅 pickup: ${label} at ${pickupData.timeLabel}`;
      pickupConfirmEl.className = 'cd-pickup-confirm cd-pickup-done';
    } else {
      pickupConfirmEl.textContent = 'please choose a pickup date and time';
      pickupConfirmEl.className = 'cd-pickup-confirm cd-pickup-incomplete';
    }
    updatePickupMobileState();
  }

  function updateCheckoutState() {
    const cart = window.NooshCart ? window.NooshCart.getCart() : [];
    const ready = cart.length > 0 && !!(pickupData && pickupData.date && pickupData.time);
    checkoutBtn.disabled = !ready;
  }

  // ── render ───────────────────────────────────────────────────────────────────

  function renderCart() {
    const cart = window.NooshCart ? window.NooshCart.getCart() : [];

    if (cart.length === 0) {
      cdBody.innerHTML = emptyHTML();
      cdPickup.style.display = 'none';
      cdFooter.style.display = 'none';
      updateCheckoutState();
      return;
    }

    cdPickup.style.display = '';
    cdFooter.style.display = '';
    cdBody.dataset.single = cart.length === 1 ? 'true' : 'false';
    cdBody.innerHTML = cart.map(itemHTML).join('') + delightHTML(cart);
    updateDelightState();
    subtotalEl.textContent = formatPrice(window.NooshCart.getCartTotal());
    updatePickupConfirm();
    updateCheckoutState();

    cdBody.querySelectorAll('.cd-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const delta = btn.dataset.action === 'dec' ? -1 : 1;
        const item = window.NooshCart.getCart().find(i => i.id === id);
        if (item) window.NooshCart.updateQuantity(id, item.quantity + delta);
      });
    });

    cdBody.querySelectorAll('.cd-remove').forEach(btn => {
      btn.addEventListener('click', () => window.NooshCart.removeFromCart(btn.dataset.id));
    });
  }

  function itemHTML(item) {
    const imgSrc = item.image || getProductImage(item.id);
    const imgBlock = imgSrc
      ? `<img src="${imgSrc}" alt="" loading="lazy">`
      : `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
           <circle cx="19" cy="19" r="14" stroke="#c4b09a" stroke-width="1.5" stroke-dasharray="4 3"/>
           <path d="M12 19 Q16 13 19 19 Q22 25 26 19" stroke="#c4b09a" stroke-width="1.5" stroke-linecap="round"/>
         </svg>`;

    return `
      <div class="cd-item">
        <div class="cd-item-img">${imgBlock}</div>
        <div class="cd-item-details">
          <div class="cd-item-name">${item.name}</div>
          <div class="cd-item-price">${formatPrice(item.price)}</div>
          <div class="cd-item-controls">
            <button class="cd-qty-btn" data-action="dec" data-id="${item.id}" aria-label="decrease quantity">−</button>
            <span class="cd-qty-count">${item.quantity}</span>
            <button class="cd-qty-btn" data-action="inc" data-id="${item.id}" aria-label="increase quantity">+</button>
            <button class="cd-remove" data-id="${item.id}">remove</button>
          </div>
        </div>
      </div>`;
  }

  function emptyHTML() {
    return `
      <div class="cd-empty">
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
          <circle cx="44" cy="44" r="36" stroke="#c4b09a" stroke-width="2" stroke-dasharray="6 4"/>
          <circle cx="44" cy="44" r="18" stroke="#d4c4a8" stroke-width="1.5" stroke-dasharray="3 3"/>
        </svg>
        <p class="cd-empty-msg">your list is empty —<br>go pick some treats!</p>
      </div>`;
  }

  function delightHTML(cart) {
    if (cart.length !== 1) return '';
    return `<p class="cd-delight" id="cd-delight">small kitchen, big love ✿</p>`;
  }

  function updateDelightState() {
    const el = document.getElementById('cd-delight');
    if (!el) return;
    const cart = window.NooshCart ? window.NooshCart.getCart() : [];
    el.style.display = (isMobile() && cart.length === 1 && !pickerExpanded) ? 'block' : 'none';
  }

  // ── checkout ─────────────────────────────────────────────────────────────────

  async function handleCheckout() {
    const cart = window.NooshCart ? window.NooshCart.getCart() : [];
    if (!cart.length) return;

    errorEl.classList.remove('visible');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'preparing your treats...';

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => {
            const imageUrl = item.image
              ? (item.image.startsWith('/') ? window.location.origin + item.image : item.image)
              : null;
            return {
              name: item.name,
              price: item.price / 100,
              quantity: item.quantity,
              ...(imageUrl && { image: imageUrl }),
            };
          }),
          pickup: pickupData ? {
            date:    pickupData.date,
            time:    pickupData.time,
            display: (pickupData.dateLabel || '').replace(/ \d{4}$/, '') + ' at ' + (pickupData.timeLabel || ''),
          } : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'checkout failed');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'checkout';
      errorEl.classList.add('visible');
    }
  }

  // ── events ───────────────────────────────────────────────────────────────────

  function wireEvents() {
    document.addEventListener('cartIconClick', openDrawer);
    backdrop.addEventListener('click', closeDrawer);
    document.getElementById('cd-close-btn').addEventListener('click', closeDrawer);
    checkoutBtn.addEventListener('click', handleCheckout);
    cdPickupToggle.addEventListener('click', () => {
      if (pickerExpanded) closePicker(); else openPicker();
    });
    cdPickupEditBtn.addEventListener('click', openPicker);
    cdPickupCard.addEventListener('click', () => {
      if (pickerExpanded) closePicker(); else openPicker();
    });
    document.addEventListener('cartUpdated', renderCart);
    document.addEventListener('pickupUpdated', e => {
      pickupData = e.detail;
      updatePickupConfirm();
      updateCheckoutState();
      if (isMobile() && pickupData && pickupData.date && pickupData.time) {
        closePicker();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  // ── boot ─────────────────────────────────────────────────────────────────────

  function init() {
    injectStyles();
    buildDOM();
    loadPickupData();
    wireEvents();
    renderCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
