(function () {
  const CART_KEY = 'noosh_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
  }

  function addToCart(id, name, price, image) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name, price: Math.round(Number(price)), quantity: 1, image: image || '' });
    }
    saveCart(cart);
  }

  function removeFromCart(id) {
    saveCart(getCart().filter(item => item.id !== id));
  }

  function updateQuantity(id, newQty) {
    const qty = Math.max(0, Math.round(Number(newQty)));
    if (qty === 0) { removeFromCart(id); return; }
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) { item.quantity = qty; saveCart(cart); }
  }

  function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  function clearCart() {
    saveCart([]);
  }

  window.NooshCart = {
    addToCart,
    removeFromCart,
    updateQuantity,
    getCart,
    getCartTotal,
    getCartCount,
    clearCart,
  };

  // ── toast helper ─────────────────────────────────────────────────────────────
  let _toastTimer;
  function showBagToast() {
    const toast = document.getElementById('bagToast');
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ── wire .add-to-sugar-rush buttons ─────────────────────────────────────────
  function wireAddButtons() {
    document.querySelectorAll('.add-to-sugar-rush').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id    = btn.dataset.productId;
        const name  = btn.dataset.productName;
        const price = parseInt(btn.dataset.productPrice, 10);
        const image = btn.dataset.productImage || '';
        if (!id || !name || !price) return;
        addToCart(id, name, price, image);
        console.log('Added:', name);
        showBagToast();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireAddButtons);
  } else {
    wireAddButtons();
  }

})();
