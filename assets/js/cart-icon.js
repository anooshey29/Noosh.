(function () {
  function init() {
    const style = document.createElement('style');
    style.textContent = `
      #noosh-cart-icon {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #fbf2e0;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 4px 14px rgba(61, 45, 28, 0.18),
          0 1px 4px  rgba(61, 45, 28, 0.10);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        z-index: 900;
      }
      #noosh-cart-icon:hover {
        transform: scale(1.08);
        box-shadow:
          0 8px 22px rgba(61, 45, 28, 0.22),
          0 2px 6px  rgba(61, 45, 28, 0.12);
      }
      #noosh-cart-icon:active {
        transform: scale(0.96);
      }
      #noosh-cart-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #c4615a;
        color: #f8e8d2;
        font-family: "Nunito", system-ui, sans-serif;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        display: none;
        align-items: center;
        justify-content: center;
        border: 2px solid #fbf2e0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'noosh-cart-icon';
    btn.setAttribute('aria-label', 'open cart');
    btn.innerHTML = `
      <svg width="34" height="38" viewBox="0 0 34 38" fill="none"
           xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- left handle: wobbly arch -->
        <path d="M7,14.5 C6.5,7.5 8,3.5 11.5,3.5 C15,3.5 16,7.5 15.5,14.5"
              stroke="#3d2d1c" stroke-width="2" stroke-linecap="round"/>
        <!-- right handle: wobbly arch -->
        <path d="M18.5,14.5 C18,7.5 19.5,3.5 22.5,3.5 C26,3.5 27.5,7.5 27,14.5"
              stroke="#3d2d1c" stroke-width="2" stroke-linecap="round"/>
        <!-- bag body: slightly uneven sides, rounded corners at base -->
        <path d="M2.5,14 C2,23 1.5,30.5 2,35.5 Q2.5,37.5 5,37.5
                 Q17,38 29,37.5 Q31.5,37.5 32,35.5
                 C32.5,30.5 32,23 31.5,14 Z"
              stroke="#3d2d1c" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
        <!-- top fold: subtle bow -->
        <path d="M2.5,14 Q17,15 31.5,14"
              stroke="#3d2d1c" stroke-width="2" stroke-linecap="round"/>
        <!-- fold crease line inside bag -->
        <path d="M3,19 Q17,20 31,19"
              stroke="#3d2d1c" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
      </svg>
      <span id="noosh-cart-badge" aria-live="polite"></span>
    `;

    document.body.appendChild(btn);

    function updateBadge() {
      const count = window.NooshCart ? window.NooshCart.getCartCount() : 0;
      const badge = document.getElementById('noosh-cart-badge');
      if (!badge) return;
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    document.addEventListener('cartUpdated', updateBadge);
    updateBadge();

    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('cartIconClick'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
