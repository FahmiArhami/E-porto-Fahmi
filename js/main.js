/**
 * E-PORTFOLIO MAHASISWA PPG
 * main.js — Semua interaktivitas website
 *
 * Modul:
 *  1. Navbar — sticky scroll + hamburger + drawer
 *  2. Scroll animations — fade-up / fade-in via IntersectionObserver
 *  3. Accordion — refleksi mata kuliah
 *  4. Gallery filter — dokumentasi PPG
 *  5. Lightbox — buka/tutup, prev/next, keyboard
 *  6. Smooth scroll — anchor link (#)
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITIES
  ============================================================ */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     1. NAVBAR — STICKY + HAMBURGER + DRAWER
  ============================================================ */
  function initNavbar() {
    const navbar   = qs('#navbar');
    const toggle   = qs('#navToggle');
    const drawer   = qs('#navDrawer');
    if (!navbar) return;

    // ── Sticky / scrolled class ────────────────────────────────
    const onScroll = () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // ── Hamburger toggle ──────────────────────────────────────
    if (!toggle || !drawer) return;

    const openDrawer = () => {
      toggle.classList.add('open');
      drawer.classList.add('open');
      drawer.style.display = 'flex';
      toggle.setAttribute('aria-expanded', 'true');
      // Focus first link for accessibility
      const firstLink = qs('.navbar__link', drawer);
      if (firstLink) firstLink.focus();
    };

    const closeDrawer = () => {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      // Hide after transition
      drawer.addEventListener('transitionend', function handler() {
        if (!drawer.classList.contains('open')) {
          drawer.style.display = 'none';
        }
        drawer.removeEventListener('transitionend', handler);
      });
    };

    const isDrawerOpen = () => drawer.classList.contains('open');

    toggle.addEventListener('click', () => {
      isDrawerOpen() ? closeDrawer() : openDrawer();
    });

    // Close drawer when a link is clicked
    qsa('.navbar__link', drawer).forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Close drawer on outside click
    document.addEventListener('click', (e) => {
      if (isDrawerOpen() && !navbar.contains(e.target) && !drawer.contains(e.target)) {
        closeDrawer();
      }
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDrawerOpen()) {
        closeDrawer();
        toggle.focus();
      }
    });

    // Hide drawer on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isDrawerOpen()) {
        closeDrawer();
      }
    });
  }

  /* ============================================================
     2. SCROLL ANIMATIONS — IntersectionObserver
  ============================================================ */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      qsa('.fade-up, .fade-in').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    qsa('.fade-up, .fade-in').forEach(el => observer.observe(el));
  }

  /* ============================================================
     3. ACCORDION — Refleksi Mata Kuliah
  ============================================================ */
  function initAccordion() {
    // Run after DOM is fully built (including dynamically added items)
    const accordionItems = qsa('.accordion-item');
    if (!accordionItems.length) return;

    accordionItems.forEach(item => {
      const trigger = qs('.accordion-trigger', item);
      const body    = qs('.accordion-body',    item);
      if (!trigger || !body) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all siblings in the same accordion list
        const parentAccordion = item.closest('.accordion');
        if (parentAccordion) {
          qsa('.accordion-item.open', parentAccordion).forEach(openItem => {
            if (openItem !== item) {
              closeAccordionItem(openItem);
            }
          });
        }

        // Toggle current
        if (isOpen) {
          closeAccordionItem(item);
        } else {
          openAccordionItem(item);
        }
      });

      // Keyboard support
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  }

  function openAccordionItem(item) {
    const body    = qs('.accordion-body',    item);
    const inner   = qs('.accordion-body__inner', item);
    const trigger = qs('.accordion-trigger', item);
    if (!body || !inner) return;

    item.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    body.style.height = inner.scrollHeight + 'px';
  }

  function closeAccordionItem(item) {
    const body    = qs('.accordion-body',    item);
    const trigger = qs('.accordion-trigger', item);
    if (!body) return;

    item.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    body.style.height = '0';
  }

  // Re-run accordion init after a short delay to catch dynamically rendered items
  function initAccordionDelayed() {
    setTimeout(initAccordion, 100);
  }

  /* ============================================================
     4. GALLERY FILTER — Dokumentasi PPG
  ============================================================ */
  function initGalleryFilter() {
    const filterBtns = qsa('.filter-btn');
    const galleryGrid = qs('#gallery-grid');
    const emptyState  = qs('#gallery-empty');

    // Selalu init click handler lightbox, filter button opsional
    if (galleryGrid) {
      setTimeout(initGalleryItems, 150);
    }

    if (!filterBtns.length || !galleryGrid) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.dataset.filter;
        const items  = qsa('.gallery-item', galleryGrid);
        let visibleCount = 0;

        items.forEach((item, idx) => {
          const cat = item.dataset.category || '';
          const show = filter === 'semua' || cat === filter;

          if (show) {
            item.classList.remove('hidden');
            // Stagger re-appear
            item.style.animationDelay = (idx * 0.04) + 's';
            visibleCount++;
          } else {
            item.classList.add('hidden');
          }
        });

        // Empty state
        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      });
    });

    // Init click handlers on gallery items (for lightbox)
    initGalleryItems();
  }

  /* ============================================================
     5. LIGHTBOX
  ============================================================ */
  let lightboxData    = [];  // visible items only
  let lightboxIndex   = 0;

  function initGalleryItems() {
    const galleryGrid = qs('#gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (!item || item.classList.contains('hidden')) return;
      openLightbox(parseInt(item.dataset.index, 10));
    });

    // Keyboard open
    galleryGrid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.gallery-item');
        if (!item || item.classList.contains('hidden')) return;
        e.preventDefault();
        openLightbox(parseInt(item.dataset.index, 10));
      }
    });
  }

  function openLightbox(dataIndex) {
    const lightbox = qs('#lightbox');
    if (!lightbox || !DATA || !DATA.dokumentasi) return;

    // Build visible items list based on current filter
    const visibleItems = qsa('.gallery-item:not(.hidden)', qs('#gallery-grid'));
    lightboxData = visibleItems.map(el => ({
      dataIdx: parseInt(el.dataset.index, 10),
      item:    DATA.dokumentasi[parseInt(el.dataset.index, 10)],
    }));

    // Find position of clicked item in the visible list
    const pos = lightboxData.findIndex(d => d.dataIdx === dataIndex);
    lightboxIndex = pos >= 0 ? pos : 0;

    renderLightbox(lightboxIndex);

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button
    const closeBtn = qs('#lb-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    const lightbox = qs('#lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderLightbox(idx) {
    if (!lightboxData.length) return;
    const entry = lightboxData[idx];
    if (!entry) return;
    const item = entry.item;

    // Image / placeholder
    const imgContainer = qs('#lb-img-container');
    if (imgContainer) {
      const isPlaceholder = !item.foto || item.foto.includes('[');
      if (isPlaceholder) {
        imgContainer.innerHTML = `
          <div style="width:300px; height:300px; display:flex; align-items:center;
                      justify-content:center; color:rgba(255,255,255,0.3); font-size:3rem;">
            📷
          </div>
        `;
      } else {
        imgContainer.innerHTML = `
          <img
            src="${item.foto}"
            alt="${item.judul || 'Dokumentasi PPG'}"
          />
        `;
      }
    }

    // Text info
    const setEl = (id, val, fallback) => {
      const el = qs('#' + id);
      if (el) el.textContent = (val && !val.includes('[')) ? val : (fallback || '');
    };

    setEl('lb-category', item.kategori, 'Dokumentasi PPG');
    setEl('lb-title',    item.judul,    '[ Judul Kegiatan ]');
    setEl('lb-tanggal',  item.tanggal,  '');
    setEl('lb-lokasi',   item.lokasi,   '');
    setEl('lb-desc',     item.deskripsi,'');

    // Hide meta rows if empty
    const tanggalWrap = qs('#lb-tanggal-wrap');
    const lokasiWrap  = qs('#lb-lokasi-wrap');
    if (tanggalWrap) tanggalWrap.style.display = (item.tanggal && !item.tanggal.includes('[')) ? '' : 'none';
    if (lokasiWrap)  lokasiWrap.style.display  = (item.lokasi  && !item.lokasi.includes('['))  ? '' : 'none';

    // Counter
    const counter = qs('#lb-counter');
    if (counter) counter.textContent = (idx + 1) + ' / ' + lightboxData.length;
  }

  function prevLightbox() {
    if (!lightboxData.length) return;
    lightboxIndex = (lightboxIndex - 1 + lightboxData.length) % lightboxData.length;
    renderLightbox(lightboxIndex);
  }

  function nextLightbox() {
    if (!lightboxData.length) return;
    lightboxIndex = (lightboxIndex + 1) % lightboxData.length;
    renderLightbox(lightboxIndex);
  }

  function initLightboxControls() {
    const lightbox = qs('#lightbox');
    const closeBtn = qs('#lb-close');
    const prevBtn  = qs('#lb-prev');
    const nextBtn  = qs('#lb-next');
    if (!lightbox) return;

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn)  prevBtn.addEventListener('click',  prevLightbox);
    if (nextBtn)  nextBtn.addEventListener('click',  nextLightbox);

    // Click backdrop to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevLightbox();
          break;
        case 'ArrowRight':
          nextLightbox();
          break;
      }
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchStartY = 0;

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      // Only register horizontal swipe if it's dominant axis
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? nextLightbox() : prevLightbox();
      }
    }, { passive: true });
  }

  /* ============================================================
     6. SMOOTH SCROLL — untuk anchor links (#)
  ============================================================ */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navbarH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '70',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navbarH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }

  /* ============================================================
     7. ACTIVE NAV LINK — highlight berdasarkan halaman aktif
  ============================================================ */
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    qsa('.navbar__link').forEach(link => {
      const href = (link.getAttribute('href') || '').split('/').pop();
      if (href === currentPath) {
        link.classList.add('active');
      } else if (currentPath === '' && href === 'index.html') {
        link.classList.add('active');
      }
    });
  }

  /* ============================================================
     8. ACCORDION HEIGHT UPDATE ON RESIZE
  ============================================================ */
  function initAccordionResize() {
    window.addEventListener('resize', () => {
      qsa('.accordion-item.open').forEach(item => {
        const body  = qs('.accordion-body',     item);
        const inner = qs('.accordion-body__inner', item);
        if (body && inner) {
          body.style.height = inner.scrollHeight + 'px';
        }
      });
    });
  }

  /* ============================================================
     INIT — DOMContentLoaded
  ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollAnimations();
    initSmoothScroll();
    initActiveNav();
    initLightboxControls();

    // Accordion & gallery need a tick because content is built
    // by inline scripts on refleksi.html and dokumentasi.html
    initAccordionDelayed();
    initGalleryFilter();
    initAccordionResize();

    // Re-observe scroll animations after dynamic content is added
    setTimeout(initScrollAnimations, 150);
  });

})();
