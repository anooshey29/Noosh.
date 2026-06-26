(function () {
  'use strict';

  const PICKUP_KEY  = 'noosh_pickup';
  const MONTH_NAMES = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];
  const DAY_HDRS    = ['mon','tue','wed','thu','fri','sat','sun'];

  // 30-min slots 10:00 AM → 5:00 PM
  const ALL_SLOTS = [];
  for (let h = 10; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 17 && m > 0) break;
      ALL_SLOTS.push({ h, m, value: pad(h) + ':' + pad(m), label: fmtTime(h, m) });
    }
  }

  // ── utils ──────────────────────────────────────────────────────────────────

  function pad(n) { return String(n).padStart(2, '0'); }

  function fmtTime(h, m) {
    const ampm = h < 12 ? 'am' : 'pm';
    const h12  = h > 12 ? h - 12 : h;
    return `${h12}:${pad(m)} ${ampm}`;
  }

  function fmtISO(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function fmtDateLabel(date) {
    const D = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return `${D[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  }

  // ── pickup rules ───────────────────────────────────────────────────────────

  function cutoff() { return Date.now() + 24 * 60 * 60 * 1000; }

  function dateDisabled(y, mo, d) {
    if (new Date(y, mo, d).getDay() === 0) return true;           // Sunday
    return new Date(y, mo, d, 17, 0).getTime() < cutoff();       // no slots within 24h
  }

  function slotsForDate(date) {
    const min = cutoff();
    return ALL_SLOTS.filter(t =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), t.h, t.m).getTime() >= min
    );
  }

  function stillValid(dateISO, timeStr) {
    if (!dateISO) return false;
    const [y, mo, d] = dateISO.split('-').map(Number);
    if (dateDisabled(y, mo - 1, d)) return false;
    if (!timeStr) return true;
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(y, mo - 1, d, h, m).getTime() >= cutoff();
  }

  // ── state ──────────────────────────────────────────────────────────────────

  const _today = new Date();
  let viewYear  = _today.getFullYear();
  let viewMonth = _today.getMonth();
  let selDate   = null;   // Date object
  let selTime   = null;   // "HH:MM"
  let pickerEl  = null;

  function loadSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(PICKUP_KEY));
      if (!saved || !stillValid(saved.date, saved.time)) return;
      const [y, mo, d] = saved.date.split('-').map(Number);
      selDate   = new Date(y, mo - 1, d);
      selTime   = saved.time || null;
      viewYear  = y;
      viewMonth = mo - 1;
    } catch (e) {}
  }

  function persist() {
    if (!selDate) return;
    const data = {
      date:      fmtISO(selDate),
      time:      selTime,
      dateLabel: fmtDateLabel(selDate),
      timeLabel: selTime ? fmtTime(...selTime.split(':').map(Number)) : null,
    };
    try { localStorage.setItem(PICKUP_KEY, JSON.stringify(data)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('pickupUpdated', { detail: data }));
  }

  // ── styles ─────────────────────────────────────────────────────────────────

  const CSS = `
    #pickup-picker {
      padding: 0 24px 16px;
      border-top: 1px dashed #d4b896;
      flex-shrink: 0;
      display: none;
    }
    #pickup-picker.pp-on { display: block; }

    .pp-lbl {
      display: block;
      font-family: "Nunito", system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #8b6f4d;
      padding-top: 14px;
      margin-bottom: 10px;
    }

    /* month navigation */
    .pp-month-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .pp-month-title {
      font-family: "Fraunces", "Times New Roman", serif;
      font-size: 1rem;
      font-style: italic;
      font-weight: 600;
      color: #3d2d1c;
    }
    .pp-arrow {
      width: 28px; height: 28px;
      border: none; background: none; padding: 0;
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px;
      font-size: 20px; line-height: 1;
      color: #8b6f4d;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .pp-arrow:hover:not(:disabled) { background: #f4dcc0; color: #3d2d1c; }
    .pp-arrow:disabled { color: #d4c4a8; cursor: default; }

    /* calendar grid */
    .pp-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      row-gap: 2px;
    }
    .pp-hdr {
      font-family: "Nunito", system-ui, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #8b6f4d;
      text-align: center;
      padding: 4px 0 6px;
    }
    .pp-hdr:last-child { color: #d4c4a8; } /* Sun */

    .pp-day {
      font-family: "Nunito", system-ui, sans-serif;
      font-size: 13px;
      font-weight: 500;
      width: 32px; height: 32px;
      padding: 0;
      margin: 1px auto;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      border: none; background: none;
      cursor: pointer;
      color: #3d2d1c;
      transition: background 0.12s, color 0.12s;
    }
    .pp-day:hover:not(.pp-off):not(.pp-sel) { background: #f4c8b6; }
    .pp-day.pp-off { color: #d4c4a8; cursor: default; pointer-events: none; }
    .pp-day.pp-sel { background: #c4615a; color: #f8e8d2; font-weight: 700; }

    /* time picker */
    .pp-time-wrap { margin-top: 12px; }
    .pp-time-lbl {
      display: block;
      font-family: "Nunito", system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #8b6f4d;
      margin-bottom: 6px;
    }
    .pp-time-sel {
      width: 100%;
      font-family: "Nunito", system-ui, sans-serif;
      font-size: 14px;
      color: #3d2d1c;
      background: #f8e8d2;
      border: 1.5px solid #c8ad92;
      border-radius: 10px;
      padding: 9px 36px 9px 12px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'><path d='M1 1l5 5 5-5' stroke='%238b6f4d' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
      background-repeat: no-repeat;
      background-position: right 12px center;
    }
    .pp-time-sel:focus { outline: 2px solid #c4615a; outline-offset: 2px; }
    .pp-no-times {
      font-family: "Nunito", system-ui, sans-serif;
      font-size: 13px;
      color: #c4b09a;
      margin: 0;
    }
  `;

  // ── render ─────────────────────────────────────────────────────────────────

  function buildCalendar() {
    const now2        = new Date();
    const atCurrent   = viewYear === now2.getFullYear() && viewMonth === now2.getMonth();
    const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
    const offset      = (firstDow + 6) % 7; // Mon = 0 … Sun = 6
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const hdrs = DAY_HDRS.map(d => `<div class="pp-hdr">${d}</div>`).join('');

    let cells = '';
    for (let i = 0; i < offset; i++) cells += '<span></span>';

    for (let d = 1; d <= daysInMonth; d++) {
      const dow    = new Date(viewYear, viewMonth, d).getDay();
      const isSun  = dow === 0;
      const isOff  = isSun || dateDisabled(viewYear, viewMonth, d);
      const isSel  = selDate &&
        selDate.getFullYear() === viewYear &&
        selDate.getMonth()    === viewMonth &&
        selDate.getDate()     === d;

      const cls = ['pp-day', isOff ? 'pp-off' : '', isSel ? 'pp-sel' : '']
        .filter(Boolean).join(' ');
      cells += `<button class="${cls}" data-day="${d}">${d}</button>`;
    }

    return `
      <div class="pp-month-row">
        <button class="pp-arrow" id="pp-prev" aria-label="previous month"${atCurrent ? ' disabled' : ''}>&#8249;</button>
        <span class="pp-month-title">${MONTH_NAMES[viewMonth]} ${viewYear}</span>
        <button class="pp-arrow" id="pp-next" aria-label="next month">&#8250;</button>
      </div>
      <div class="pp-grid">${hdrs}${cells}</div>`;
  }

  function buildTimePicker() {
    if (!selDate) return '';
    const slots = slotsForDate(selDate);
    if (!slots.length) {
      return `<div class="pp-time-wrap"><p class="pp-no-times">no times available for this date</p></div>`;
    }
    const opts = slots.map(t =>
      `<option value="${t.value}"${selTime === t.value ? ' selected' : ''}>${t.label}</option>`
    ).join('');
    return `
      <div class="pp-time-wrap">
        <label class="pp-time-lbl" for="pp-time-sel">pickup time</label>
        <select id="pp-time-sel" class="pp-time-sel">
          <option value="">select a time…</option>
          ${opts}
        </select>
      </div>`;
  }

  function render() {
    if (!pickerEl) return;
    pickerEl.innerHTML =
      `<span class="pp-lbl">when would you like to pick up?</span>` +
      buildCalendar() +
      buildTimePicker();
    bindEvents();
  }

  // ── events ─────────────────────────────────────────────────────────────────

  function bindEvents() {
    const now2 = new Date();

    pickerEl.querySelector('#pp-prev')?.addEventListener('click', () => {
      let mo = viewMonth - 1, yr = viewYear;
      if (mo < 0) { mo = 11; yr--; }
      if (yr < now2.getFullYear() || (yr === now2.getFullYear() && mo < now2.getMonth())) return;
      viewMonth = mo; viewYear = yr;
      render();
    });

    pickerEl.querySelector('#pp-next')?.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });

    pickerEl.querySelectorAll('.pp-day[data-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        selDate = new Date(viewYear, viewMonth, parseInt(btn.dataset.day, 10));
        selTime = null;
        persist();
        render();
      });
    });

    const timeSel = pickerEl.querySelector('#pp-time-sel');
    timeSel?.addEventListener('change', () => {
      selTime = timeSel.value || null;
      persist();
      render();
    });
  }

  // ── visibility sync ────────────────────────────────────────────────────────

  function syncVis(cart) {
    if (!pickerEl) return;
    pickerEl.classList.toggle('pp-on', !!(cart && cart.length > 0));
  }

  // ── boot ───────────────────────────────────────────────────────────────────

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    loadSaved();

    const footer = document.getElementById('cd-footer');
    if (!footer) return;

    pickerEl = document.createElement('div');
    pickerEl.id = 'pickup-picker';
    footer.parentNode.insertBefore(pickerEl, footer);

    render();

    const initCart = window.NooshCart ? window.NooshCart.getCart() : [];
    syncVis(initCart);

    document.addEventListener('cartUpdated', e => syncVis(e.detail.cart));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
