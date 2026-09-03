/**
 * SAKURA PETALS — Animasi Kelopak Bunga Sakura
 * ─────────────────────────────────────────────────────────────
 * Kelopak sakura berjatuhan dengan warna bervariasi,
 * ukuran berbeda, dan gerakan yang natural.
 */
(function () {
  'use strict';

  const PETAL_COUNT = 18;

  /* Warna sakura — dari putih ke merah muda tua */
  const COLORS = [
    '#FFB7C5', /* sakura klasik */
    '#FF91A8', /* pink cerah */
    '#FFC0CB', /* pink muda */
    '#FF6B8A', /* pink tua */
    '#FFD5DE', /* blush lembut */
    '#FFADC0', /* mid pink */
    '#FF85A1', /* vivid pink */
    '#FFF0F3', /* putih pink */
  ];

  /* SVG kelopak sakura — bentuk organik alami */
  function petalSVG(color, size) {
    const r = Math.floor(Math.random() * 3); /* 3 variasi bentuk */

    if (r === 0) {
      /* Kelopak bulat telur */
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
        <ellipse cx="20" cy="22" rx="10" ry="14" fill="${color}" opacity="0.88"/>
        <ellipse cx="20" cy="22" rx="6" ry="9" fill="${color}" opacity="0.4"/>
        <line x1="20" y1="8" x2="20" y2="36" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      </svg>`;
    } else if (r === 1) {
      /* Kelopak lebar dengan lekukan atas */
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
        <path d="M20 6 C10 6, 4 14, 4 22 C4 30, 10 36, 20 36 C30 36, 36 30, 36 22 C36 14, 30 6, 20 6Z"
          fill="${color}" opacity="0.85"/>
        <path d="M20 6 C16 12, 16 18, 20 24 C24 18, 24 12, 20 6Z"
          fill="rgba(255,255,255,0.3)"/>
      </svg>`;
    } else {
      /* Kelopak asimetris — lebih natural */
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
        <path d="M20 5 C12 8, 5 16, 7 25 C9 33, 16 38, 22 37 C29 35, 35 27, 34 19 C33 11, 27 3, 20 5Z"
          fill="${color}" opacity="0.87"/>
        <path d="M20 5 C17 14, 16 22, 20 32 C23 22, 24 13, 20 5Z"
          fill="rgba(255,255,255,0.28)"/>
      </svg>`;
    }
  }

  function createPetal() {
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.position   = 'absolute';
    el.style.top        = '-60px';
    el.style.pointerEvents = 'none';
    el.style.userSelect = 'none';
    el.style.willChange = 'transform';

    /* Posisi horizontal acak */
    el.style.left = (Math.random() * 100) + 'vw';

    /* Ukuran bervariasi — depth effect */
    const size = 14 + Math.floor(Math.random() * 20); /* 14–33px */

    /* Warna acak dari palette */
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    /* SVG kelopak */
    el.innerHTML = petalSVG(color, size);

    /* Drop shadow lembut agar terlihat di background apapun */
    el.style.filter = `drop-shadow(0 1px 3px rgba(180, 60, 90, 0.25))`;

    /* Durasi jatuh: 7–18 detik */
    const fallDur  = 7  + Math.random() * 11;
    /* Durasi ayun: 2–5 detik */
    const swayDur  = 2  + Math.random() * 3;
    /* Durasi rotasi: 3–8 detik */
    const rotateDur = 3 + Math.random() * 5;

    el.style.animationName            = 'petal-fall, petal-sway, petal-rotate';
    el.style.animationDuration        = `${fallDur}s, ${swayDur}s, ${rotateDur}s`;
    el.style.animationTimingFunction  = 'linear, ease-in-out, linear';
    el.style.animationIterationCount  = 'infinite, infinite, infinite';
    el.style.animationDelay           = `-${Math.random() * fallDur}s, 0s, 0s`;

    return el;
  }

  function injectCSS() {
    if (document.getElementById('sakura-css')) return;
    const style = document.createElement('style');
    style.id = 'sakura-css';
    style.textContent = `
      #sakura-container {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      }

      @keyframes petal-fall {
        0%   { top: -60px;   opacity: 0; }
        5%   { opacity: 1; }
        90%  { opacity: 0.85; }
        100% { top: 110vh;   opacity: 0; }
      }

      @keyframes petal-sway {
        0%   { margin-left:  0px; }
        25%  { margin-left:  35px; }
        75%  { margin-left: -28px; }
        100% { margin-left:  0px; }
      }

      @keyframes petal-rotate {
        0%   { transform: rotate(0deg)   scale(1); }
        50%  { transform: rotate(180deg) scale(0.9); }
        100% { transform: rotate(360deg) scale(1); }
      }

      @media (prefers-reduced-motion: reduce) {
        #sakura-container { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function resetPetal(el) {
    el.style.left  = (Math.random() * 100) + 'vw';
    const fallDur  = 7  + Math.random() * 11;
    const swayDur  = 2  + Math.random() * 3;
    const rotateDur = 3 + Math.random() * 5;
    el.style.animationDuration = `${fallDur}s, ${swayDur}s, ${rotateDur}s`;
    el.style.animationDelay    = '0s, 0s, 0s';
  }

  function init() {
    injectCSS();

    const container = document.createElement('div');
    container.id = 'sakura-container';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    for (let i = 0; i < PETAL_COUNT; i++) {
      container.appendChild(createPetal());
    }

    /* Recycle kelopak yang sudah keluar layar */
    setInterval(function () {
      container.querySelectorAll('div').forEach(function (p) {
        const rect = p.getBoundingClientRect();
        if (rect.top > window.innerHeight + 70) {
          resetPetal(p);
        }
      });
    }, 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
