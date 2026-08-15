// ===== CTN ART — main.js =====
// Principe de robustesse : le contenu du site ne doit JAMAIS dépendre du JS
// pour être visible. Le JS n'ajoute que des améliorations (animations, nav
// mobile, carrousel). Chaque bloc est isolé dans son propre try/catch pour
// qu'une erreur sur une fonctionnalité ne bloque jamais les autres.

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav ---- */
  try {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
      });
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
    }
  } catch (e) { console.error('nav init failed', e); }

  /* ---- Footer year ---- */
  try {
    document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());
  } catch (e) { console.error('footer year failed', e); }

  /* ---- Scroll reveal ---- */
  try {
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('in'));
    }
  } catch (e) {
    console.error('reveal init failed', e);
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---- Gallery filters ---- */
  try {
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
      const buttons = filterBar.querySelectorAll('.filter-btn');
      const coverflow = document.querySelector('.gallery-coverflow');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.filter;

          if (coverflow && typeof coverflow.cfSetItems === 'function') {
            const all = Array.from(coverflow.querySelectorAll('.cf-item'));
            const filtered = cat === 'all' ? all : all.filter(item => item.dataset.cat === cat);
            coverflow.cfSetItems(filtered);
          } else {
            const items = document.querySelectorAll('.gallery-item');
            items.forEach(item => {
              const show = cat === 'all' || item.dataset.cat === cat;
              item.style.display = show ? '' : 'none';
            });
          }
        });
      });
    }
  } catch (e) { console.error('gallery filters failed', e); }

  /* ---- Coverflow carousel(s) — CMS-managed ones load their content first ---- */
  try {
    document.querySelectorAll('.coverflow').forEach(root => {
      if (root.dataset.cmsSrc) {
        initCmsCoverflow(root);
      } else {
        initCoverflow(root);
      }
    });
  } catch (e) { console.error('coverflow init failed', e); }

  /* ---- Style library grid (CMS-managed) ---- */
  try { initLibraryGrid(); } catch (e) { console.error('library grid init failed', e); }

  /* ---- Team flip cards + modal ---- */
  try { initTeamModal(); } catch (e) { console.error('team modal failed', e); }

  /* ---- Testimonials: load content, then loop-marquee, then wire clicks ---- */
  try {
    initTestimonialsCms().then(() => {
      initTestimonialsMarquee();
      initTestimonials();
    });
  } catch (e) { console.error('testimonials failed', e); initTestimonials(); }

  /* ---- Social follow popup (street style, one per session) ---- */
  try { initSocialPopup(); } catch (e) { console.error('social popup failed', e); }

  /* ---- Floating pill header + back-to-top progress ring on scroll ---- */
  try { initScrollEffects(); } catch (e) { console.error('scroll effects failed', e); }

  /* ---- Gallery lightbox (split reveal) ---- */
  try { initGalleryLightbox(); } catch (e) { console.error('lightbox init failed', e); }

  function initCoverflow(root) {
    const track = root.querySelector('.coverflow-track');
    const allItems = Array.from(root.querySelectorAll('.cf-item'));
    const dotsWrap = root.parentElement.querySelector('.cf-dots');
    const prevBtn = root.querySelector('.cf-nav.prev');
    const nextBtn = root.querySelector('.cf-nav.next');
    let items = allItems;
    let n = items.length;
    let center = 0;
    let autoplayTimer = null;

    function rebuildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      items.forEach((_, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Aller à l'image ${i + 1}`);
        b.addEventListener('click', () => { goTo(i); resetAutoplay(); });
        dotsWrap.appendChild(b);
      });
    }

    function render() {
      allItems.forEach(item => { item.style.display = items.includes(item) ? '' : 'none'; });
      items.forEach((item, i) => {
        let offset = i - center;
        if (offset > n / 2) offset -= n;
        if (offset < -n / 2) offset += n;

        const abs = Math.abs(offset);
        let tx, scale, rot, z, opacity;
        const spread = Math.min(root.clientWidth * 0.19, 230);

        if (abs > 2) {
          tx = offset < 0 ? -spread * 2.4 : spread * 2.4;
          scale = 0.55; rot = offset < 0 ? 28 : -28; z = 0; opacity = 0;
        } else {
          tx = offset * spread;
          scale = offset === 0 ? 1 : 0.72;
          rot = offset * -18;
          z = 100 - abs * 10;
          opacity = offset === 0 ? 1 : 0.6;
        }

        item.style.transform = `translate(-50%,-50%) translateX(${tx}px) scale(${scale}) rotateY(${rot}deg)`;
        item.style.zIndex = z;
        item.style.opacity = opacity;
        item.classList.toggle('is-center', offset === 0);
        item.tabIndex = offset === 0 ? -1 : 0;
      });
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === center));
      }
    }

    function goTo(i) {
      if (!n) return;
      center = ((i % n) + n) % n;
      render();
    }
    function next() { goTo(center + 1); }
    function prevFn() { goTo(center - 1); }

    function bindItemEvents() {
      items.forEach((item, i) => {
        item.onclick = () => {
          if (i !== center) { goTo(i); resetAutoplay(); }
          else if (typeof root.onCenterClick === 'function') { root.onCenterClick(item, i); }
        };
        item.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (i !== center) { goTo(i); resetAutoplay(); }
            else if (typeof root.onCenterClick === 'function') { root.onCenterClick(item, i); }
          }
        };
      });
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevFn(); resetAutoplay(); });

    // Swipe support
    let startX = null;
    root.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) dx < 0 ? next() : prevFn();
      startX = null;
      resetAutoplay();
    });

    // Keyboard arrows when carousel focused
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
      if (e.key === 'ArrowLeft') { prevFn(); resetAutoplay(); }
    });

    function startAutoplay() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!root.dataset.noAutoplay) autoplayTimer = setInterval(next, 4200);
    }
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }
    root.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    root.addEventListener('mouseleave', () => startAutoplay());

    // Public API: allow filtering the item set from outside (gallery filters)
    root.cfSetItems = function (filtered) {
      items = filtered.length ? filtered : allItems;
      n = items.length;
      center = 0;
      rebuildDots();
      bindItemEvents();
      render();
    };
    root.cfGetItems = function () { return items; };
    root.cfGoTo = function (i) { goTo(i); resetAutoplay(); };

    rebuildDots();
    bindItemEvents();
    render();
    startAutoplay();
  }

  /* ================= TEAM MODAL ================= */
  function initTeamModal() {
    const cards = document.querySelectorAll('.team-flip-card');
    if (!cards.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'team-modal-overlay';
    overlay.innerHTML = `
      <div class="team-modal" role="dialog" aria-modal="true">
        <button class="team-modal-close" aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="team-modal-photo"><img alt=""></div>
        <div class="team-modal-details">
          <p class="team-modal-role"></p>
          <h3 class="team-modal-name"></h3>
          <div class="team-modal-bio"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const modalImg = overlay.querySelector('.team-modal-photo img');
    const modalRole = overlay.querySelector('.team-modal-role');
    const modalName = overlay.querySelector('.team-modal-name');
    const modalBio = overlay.querySelector('.team-modal-bio');
    const closeBtn = overlay.querySelector('.team-modal-close');

    function openModal(card) {
      modalImg.src = card.dataset.photo || '';
      modalImg.alt = card.dataset.name || '';
      modalRole.textContent = card.dataset.role || '';
      modalName.textContent = card.dataset.name || '';
      modalBio.innerHTML = (card.dataset.bio || '')
        .split('|').map(p => `<p>${p}</p>`).join('');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('is-spinning')) return;
        card.classList.add('is-spinning');
        setTimeout(() => card.classList.remove('is-spinning'), 820);
        setTimeout(() => openModal(card), 260);
      });
    });
  }

  /* ================= GALLERY LIGHTBOX (split reveal) ================= */
  function initGalleryLightbox() {
    const gallery = document.querySelector('.gallery-coverflow');
    if (!gallery) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <div class="lightbox-stage">
        <img class="lightbox-base" alt="">
        <div class="lightbox-half left"><img alt=""></div>
        <div class="lightbox-half right"><img alt=""></div>
        <p class="lightbox-caption"></p>
      </div>
      <button class="lightbox-close" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <button class="lightbox-nav prev" aria-label="Précédent"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <button class="lightbox-nav next" aria-label="Suivant"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
    `;
    document.body.appendChild(overlay);

    const base = overlay.querySelector('.lightbox-base');
    const halfLeftImg = overlay.querySelector('.lightbox-half.left img');
    const halfRightImg = overlay.querySelector('.lightbox-half.right img');
    const caption = overlay.querySelector('.lightbox-caption');
    let current = 0;

    function activeItems() {
      return typeof gallery.cfGetItems === 'function' ? gallery.cfGetItems() : Array.from(gallery.querySelectorAll('.cf-item'));
    }

    function setImage(i) {
      const list = activeItems();
      if (!list.length) return;
      current = ((i % list.length) + list.length) % list.length;
      const img = list[current].querySelector('img');
      const src = img.src;
      base.src = src; base.alt = img.alt;
      halfLeftImg.src = src;
      halfRightImg.src = src;
      caption.textContent = img.alt || '';
    }

    function open(i) {
      setImage(i);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-nav.prev').addEventListener('click', () => {
      setImage(current - 1);
      if (typeof gallery.cfGoTo === 'function') gallery.cfGoTo(current);
    });
    overlay.querySelector('.lightbox-nav.next').addEventListener('click', () => {
      setImage(current + 1);
      if (typeof gallery.cfGoTo === 'function') gallery.cfGoTo(current);
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setImage(current + 1);
      if (e.key === 'ArrowLeft') setImage(current - 1);
    });

    // Registered with the coverflow: called when the already-centered item is clicked
    gallery.onCenterClick = (item) => {
      const list = activeItems();
      open(list.indexOf(item));
    };
  }

  /* ================= CMS CONTENT (Decap CMS / admin panel) =================
     These fetch the JSON files that the /admin panel edits. Everything is
     wrapped so that if a file is missing, empty, or the fetch fails, the
     page simply keeps whatever static content is already in the HTML —
     nothing ever breaks or disappears because of this. */

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (s) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]
    ));
  }

  async function fetchJSON(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  }

  async function initCmsCoverflow(root) {
    const src = root.dataset.cmsSrc;
    try {
      const data = await fetchJSON(src);
      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length) {
        const track = root.querySelector('.coverflow-track');
        track.innerHTML = items.map(it => `
          <div class="cf-item"${it.category ? ` data-cat="${escapeHtml(it.category)}"` : ''}>
            <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.alt || it.label || '')}">
            ${it.label ? `<span class="cf-label">${escapeHtml(it.label)}</span>` : ''}
          </div>`).join('');
      }
      // If items is empty, we simply leave the static HTML already in the page.
    } catch (e) {
      console.error('CMS coverflow content unavailable, showing default content', e);
    }
    initCoverflow(root);
  }

  async function initLibraryGrid() {
    const grid = document.getElementById('library-grid');
    const emptyMsg = document.getElementById('library-empty');
    const filterBar = document.getElementById('library-filters');
    if (!grid) return;
    try {
      const data = await fetchJSON('content/library.json');

      // "batches" = bulk add (one category, many images at once) — the
      // recommended way from the admin panel now. "items" = older/advanced
      // one-image-at-a-time entries. Both are supported and merged so
      // nothing already published gets lost.
      const flatItems = Array.isArray(data.items) ? data.items : [];
      const batches = Array.isArray(data.batches) ? data.batches : [];
      const batchItems = batches.flatMap(b =>
        (Array.isArray(b.images) ? b.images : []).map(imgPath => ({
          image: imgPath,
          category: b.category,
          label: b.label,
          alt: b.label,
        }))
      );
      const items = [...batchItems, ...flatItems];
      if (!items.length) return; // keep the "coming soon" static message

      grid.innerHTML = items.map(it => {
        const ext = (it.image.split('.').pop() || 'jpg').split(/[?#]/)[0];
        const slug = ((it.label || it.category || 'ctn-art') + '')
          .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `
        <div class="gallery-item" data-cat="${escapeHtml(it.category || '')}">
          <img src="${escapeHtml(it.image)}" alt="${escapeHtml(it.alt || it.label || '')}">
          <a class="download-btn" href="${escapeHtml(it.image)}" download="ctn-art-${slug || 'style'}.${ext}" aria-label="Télécharger cette image" title="Télécharger" onclick="event.stopPropagation()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>
          </a>
          ${it.label ? `<div class="gallery-caption"><span class="tag-mini">${escapeHtml(it.label)}</span></div>` : ''}
        </div>`;
      }).join('');
      if (emptyMsg) emptyMsg.remove();

      if (filterBar) {
        filterBar.style.display = '';
        const buttons = filterBar.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.filter;
            grid.querySelectorAll('.gallery-item').forEach(item => {
              item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
            });
          });
        });
      }
    } catch (e) {
      console.error('Library content unavailable', e);
    }
  }

  async function initTestimonialsCms() {
    const track = document.getElementById('testimonials-track');
    if (!track || !track.dataset.cmsSrc) return;
    try {
      const data = await fetchJSON(track.dataset.cmsSrc);
      const items = Array.isArray(data.items) ? data.items : [];
      if (!items.length) return; // keep the cards already in the HTML

      track.innerHTML = items.map(it => `
        <button class="testimonial-card" data-avatar-color="${escapeHtml(it.color || 'terracotta')}" data-name="${escapeHtml(it.name)}" data-quote="${escapeHtml(it.quote)}">
          <span class="testimonial-avatar">${escapeHtml(it.avatar || (it.name || '?').charAt(0))}</span>
          <p class="testimonial-excerpt">« ${escapeHtml((it.quote || '').slice(0, 90))}${(it.quote || '').length > 90 ? '…' : ''} »</p>
          <span class="testimonial-name">${escapeHtml(it.name)}</span>
        </button>`).join('');
    } catch (e) {
      console.error('Testimonials content unavailable, showing default reviews', e);
    }
  }

  function initTestimonialsMarquee() {
    const viewport = document.querySelector('.testimonials-scroll');
    const track = document.getElementById('testimonials-track');
    if (!viewport || !track) return;

    // Duplicate the set once so the loop (translateX -50%) is seamless.
    const originalCards = Array.from(track.children);
    if (!originalCards.length) return;
    originalCards.forEach(card => track.appendChild(card.cloneNode(true)));

    // Keep it readable/clickable: pause the drift on hover and touch.
    const pause = () => track.classList.add('paused');
    const resume = () => track.classList.remove('paused');
    viewport.addEventListener('mouseenter', pause);
    viewport.addEventListener('mouseleave', resume);
    viewport.addEventListener('touchstart', pause, { passive: true });
    viewport.addEventListener('touchend', () => setTimeout(resume, 1500), { passive: true });
  }

  /* ================= TESTIMONIALS (pop-out modal, spin close) ================= */
  function initTestimonials() {
    const cards = document.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'testimonial-modal-overlay';
    overlay.innerHTML = `
      <div class="testimonial-modal" role="dialog" aria-modal="true">
        <button class="testimonial-modal-close" aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <span class="testimonial-avatar"></span>
        <p></p>
        <span class="testimonial-name"></span>
      </div>`;
    document.body.appendChild(overlay);

    const avatar = overlay.querySelector('.testimonial-avatar');
    const quote = overlay.querySelector('p');
    const name = overlay.querySelector('.testimonial-name');
    const closeBtn = overlay.querySelector('.testimonial-modal-close');
    let closeTimer = null;

    function open(card) {
      avatar.textContent = card.querySelector('.testimonial-avatar').textContent;
      quote.textContent = `« ${card.dataset.quote} »`;
      name.textContent = card.dataset.name || '';
      overlay.classList.remove('closing');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      clearTimeout(closeTimer);
      overlay.classList.add('closing');
      closeTimer = setTimeout(() => {
        overlay.classList.remove('open', 'closing');
        document.body.style.overflow = '';
      }, 480);
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });

    cards.forEach(card => card.addEventListener('click', () => open(card)));
  }

  /* ================= SOCIAL FOLLOW POPUPS (street style, sequenced) =================
     Schedule: first popup at 10s after the visit starts (any page), then one
     platform every 13s until all have shown, then a 70s pause before the
     whole sequence loops again. Timing is stored in sessionStorage so it
     keeps flowing correctly even as the visitor moves between pages. */
  function initSocialPopup() {
    const PLATFORMS = [
      {
        key: 'snap',
        url: 'https://www.snapchat.com/add/itsctnart',
        color: '#FFFC00',
        text: 'Ayy t\'es pas encore abonné à notre <span>Snap</span> ? Ça coûte rien my gee, fais le par ici 👇',
        cta: 'Ajouter sur Snap',
        icon: '<svg viewBox="0 0 24 24" fill="#111"><path d="M12 2c2.9 0 4.9 2.2 4.9 5v2c0 .3.3.6.9.9.6.3 1.4.4 1.4 1 0 .5-.9.9-1.7 1.1-.2 0-.3.2-.2.5.1.5.4 1.2.8 1.6.5.5 1.3.6 1.3 1s-.9.7-1.9.9c-.2 0-.3.2-.4.5-.1.3-.2.7-.4.9-.2.3-.7.2-1.3.1-.6-.1-1.3-.3-2.1 0-.7.3-1.2.9-2.3.9s-1.6-.6-2.3-.9c-.8-.3-1.5-.1-2.1 0-.6.1-1.1.2-1.3-.1-.2-.2-.3-.6-.4-.9-.1-.3-.2-.5-.4-.5-1-.2-1.9-.5-1.9-.9s.8-.5 1.3-1c.4-.4.7-1.1.8-1.6.1-.3 0-.5-.2-.5-.8-.2-1.7-.6-1.7-1.1 0-.6.8-.7 1.4-1 .6-.3.9-.6.9-.9V7c0-2.8 2-5 4.9-5z"/></svg>',
      },
      {
        key: 'insta',
        url: 'https://www.instagram.com/itsctnart',
        color: '#E1306C',
        text: 'Yo, on est aussi sur <span>Insta</span> 📸 tu traînes où sinon ? Viens voir nos dernières créations par ici 👇',
        cta: 'Suivre sur Instagram',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
      },
      {
        key: 'tiktok',
        url: 'https://www.tiktok.com/@itsctnart',
        color: '#000000',
        text: 'Tu scroll TikTok toute la journée et t\'as toujours pas vu nos vidéos ? 🎵 Corrige ça direct 👇',
        cta: 'Suivre sur TikTok',
        icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M14 3c.4 2 1.9 3.5 4 3.8v2.6c-1.4 0-2.8-.4-4-1.2v6.3a5.3 5.3 0 1 1-4.6-5.3v2.7a2.6 2.6 0 1 0 2 2.6V3z"/></svg>',
      },
      {
        key: 'x',
        url: 'https://x.com/itsctnart',
        color: '#1D9BF0',
        text: 'Frérot t\'es sur <span>X</span> toi aussi ? On y balance des trucs de temps en temps, viens traîner par ici 👇',
        cta: 'Suivre sur X',
        icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M3 3l7.5 9.3L3.4 21h2.5l6-6.7 4.6 6.7H21l-7.8-9.9L20.4 3h-2.5l-5.6 6.2L7.6 3H3z"/></svg>',
      },
      {
        key: 'facebook',
        url: 'https://www.facebook.com/itsctnart',
        color: '#1877F2',
        text: 'Eh on est sur <span>Facebook</span> aussi tu sais ? 📘 Passe voir la page, ça fait plaisir 👇',
        cta: 'Suivre sur Facebook',
        icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12"/></svg>',
      },
    ];

    const POSITIONS = [
      { top: '90px', left: '24px' },
      { top: '90px', right: '24px' },
      { bottom: '110px', right: '20px' },
      { bottom: '110px', left: '20px' },
      { top: '140px', left: '50%', extraStyle: 'transform:translateX(-50%) translateY(-16px) scale(.92) rotate(-2deg);' },
    ];

    const N = PLATFORMS.length;
    const FIRST_DELAY = 10000; // first popup, 10s after the visit starts
    const GAP = 13000;         // 13s between each of the 5 popups
    const REST = 70000;        // pause after the full cycle before looping
    const AUTO_HIDE = 9000;    // a popup hides itself after 9s if ignored

    function showPopup(index) {
      const platform = PLATFORMS[((index % N) + N) % N];
      const pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];

      const popup = document.createElement('div');
      popup.className = 'social-popup';
      Object.keys(pos).forEach(k => { if (k !== 'extraStyle') popup.style[k] = pos[k]; });
      if (pos.extraStyle) popup.style.cssText += pos.extraStyle;
      popup.innerHTML = `
        <button class="social-popup-close" aria-label="Fermer">✕</button>
        <div class="social-popup-icon" style="background:${platform.color};">${platform.icon}</div>
        <p>${platform.text}</p>
        <a href="${platform.url}" class="btn" target="_blank" rel="noopener">${platform.cta}</a>
      `;
      document.body.appendChild(popup);

      let hideTimer;
      function dismiss() {
        popup.classList.remove('show');
        clearTimeout(hideTimer);
        setTimeout(() => popup.remove(), 400);
        document.removeEventListener('click', outsideClick);
      }
      function outsideClick(e) {
        if (!popup.contains(e.target)) dismiss();
      }

      requestAnimationFrame(() => {
        popup.classList.add('show');
        setTimeout(() => document.addEventListener('click', outsideClick), 50);
      });
      hideTimer = setTimeout(dismiss, AUTO_HIDE);

      popup.querySelector('.social-popup-close').addEventListener('click', dismiss);
      popup.querySelector('a.btn').addEventListener('click', dismiss);

      // Persist + schedule the next popup in the sequence right away, so the
      // timing keeps flowing correctly even if the visitor changes page.
      const nextIndex = (index + 1) % N;
      const nextDelay = nextIndex === 0 ? REST : GAP;
      sessionStorage.setItem('ctnart_popup_next_index', String(nextIndex));
      sessionStorage.setItem('ctnart_popup_next_time', String(Date.now() + nextDelay));
      setTimeout(() => showPopup(nextIndex), nextDelay);
    }

    // Resume where the session left off (works the same on every page).
    let nextIndex = parseInt(sessionStorage.getItem('ctnart_popup_next_index'), 10);
    let nextTime = parseInt(sessionStorage.getItem('ctnart_popup_next_time'), 10);

    if (isNaN(nextIndex) || isNaN(nextTime)) {
      nextIndex = 0;
      nextTime = Date.now() + FIRST_DELAY;
      sessionStorage.setItem('ctnart_popup_next_index', String(nextIndex));
      sessionStorage.setItem('ctnart_popup_next_time', String(nextTime));
    }

    const delay = Math.max(0, nextTime - Date.now());
    setTimeout(() => showPopup(nextIndex), delay);
  }

  /* ================= SCROLL EFFECTS: floating header + back-to-top ring ================= */
  function initScrollEffects() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    // Build the back-to-top button (circular scroll-progress ring, brand color)
    const R = 24; // matches the 54px button, ~3px stroke inset
    const CIRC = 2 * Math.PI * R;
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Remonter en haut de la page');
    btn.innerHTML = `
      <svg class="ring" viewBox="0 0 54 54">
        <circle class="ring-track" cx="27" cy="27" r="${R}"></circle>
        <circle class="ring-fill" cx="27" cy="27" r="${R}"
          stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"></circle>
      </svg>
      <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>`;
    document.body.appendChild(btn);
    const ringFill = btn.querySelector('.ring-fill');

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Neon color cycling for the header ring — flickers randomly between
    // orange, green and red, like a little neon sign.
    const NEON_COLORS = ['var(--terracotta)', 'var(--neon-green)', 'var(--neon-red)'];
    function flickerNeon() {
      const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
      document.documentElement.style.setProperty('--neon', color);
    }
    flickerNeon();
    setInterval(flickerNeon, 1700);

    let ticking = false;
    function update() {
      ticking = false;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

      header.classList.toggle('is-scrolled', scrollY > 80);
      btn.classList.toggle('show', scrollY > 320);
      ringFill.style.strokeDashoffset = String(CIRC * (1 - pct));
      // Same percentage drives the neon ring around the floating pill header,
      // so both progress indicators stay perfectly in sync.
      document.documentElement.style.setProperty('--scroll-pct', String(pct));
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

});
