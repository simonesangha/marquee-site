/* White Canvas Events UK — shared site behaviour.
   Loaded on every page. Every block below checks the relevant element
   exists before wiring it up, so pages that don't have (e.g.) a gallery
   or services carousel simply skip that block instead of throwing. */

document.addEventListener('DOMContentLoaded', function () {

  // ── Scroll fade-ins ─────────────────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ── Mobile nav toggle ───────────────────────────────────────────
  window.toggleMenu = function () {
    const links = document.querySelector('.nav-links');
    const cta   = document.querySelector('.nav-cta');
    if (!links || !cta) return;
    const open = links.style.display === 'flex';
    if (open) { links.style.cssText = ''; cta.style.cssText = ''; }
    else {
      links.style.cssText = 'display:flex;flex-direction:column;position:fixed;top:80px;left:0;width:100%;background:rgba(247,241,232,0.98);padding:2rem;gap:1.5rem;box-shadow:0 8px 24px rgba(0,0,0,0.08);z-index:99;';
      cta.style.cssText   = 'display:block;position:fixed;top:calc(80px + 10rem);left:0;width:100%;text-align:center;background:var(--gold);color:#fff;padding:1rem;z-index:99;';
    }
  };

  // ── Services carousel (homepage only) ──────────────────────────
  const svcOuter = document.getElementById('svcOuter');
  if (svcOuter) {
    let svcIdx = 0;
    const svcRender = function () {
      const track   = document.getElementById('svcTrack');
      const cards   = Array.from(track.querySelectorAll('.svc'));
      const perView = window.innerWidth < 640 ? 1 : 2;
      const pages   = Math.ceil(cards.length / perView);
      const w       = svcOuter.offsetWidth;
      svcIdx = Math.min(svcIdx, pages - 1);
      cards.forEach(c => { c.style.flex = `0 0 ${w / perView}px`; c.style.width = `${w / perView}px`; });
      track.style.transform = `translateX(-${svcIdx * w}px)`;
      const prevBtn = document.getElementById('svcPrev');
      const nextBtn = document.getElementById('svcNext');
      if (prevBtn) prevBtn.disabled = svcIdx === 0;
      if (nextBtn) nextBtn.disabled = svcIdx >= pages - 1;
      document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === svcIdx));
    };
    window.svcStep = function (dir) { const pages = window.innerWidth < 640 ? 4 : 2; svcIdx = Math.max(0, Math.min(pages - 1, svcIdx + dir)); svcRender(); };
    window.svcGo   = function (i) { svcIdx = i; svcRender(); };
    window.addEventListener('resize', () => { svcIdx = 0; svcRender(); });
    svcRender();
  }

  // ── FAQ accordion (any page) ───────────────────────────────────
  window.toggleFaq = function (btn) {
    const body = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-trigger').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      if (b.nextElementSibling) b.nextElementSibling.style.maxHeight = null;
    });
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  };

  // ── Contact form photo upload zone (any page with the form) ───
  const uploadZone = document.getElementById('uploadZone');
  const photoInput = document.getElementById('photos');
  const uploadCount = document.getElementById('uploadCount');
  if (uploadZone && photoInput && uploadCount) {
    let selectedFiles = [];
    const mergeFiles = function (incoming) {
      incoming.forEach(f => { if (selectedFiles.length < 10 && !selectedFiles.find(s => s.name === f.name && s.size === f.size)) selectedFiles.push(f); });
      const dt = new DataTransfer(); selectedFiles.forEach(f => dt.items.add(f)); photoInput.files = dt.files;
      uploadCount.style.display = selectedFiles.length ? 'inline' : 'none';
      uploadCount.textContent = selectedFiles.length === 1 ? '1 photo added' : `${selectedFiles.length} photos added`;
    };
    photoInput.addEventListener('change', () => mergeFiles(Array.from(photoInput.files)));
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('drag-over'); mergeFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))); });
  }

  // ── Testimonials carousel (any page that includes it) ─────────
  const testiSlides = document.querySelectorAll('.testi-slide');
  if (testiSlides.length) {
    let testiIdx = 0;
    const testiDots = document.querySelectorAll('.testi-dot');
    const testiGo = function (i) {
      testiSlides[testiIdx].classList.remove('active'); if (testiDots[testiIdx]) testiDots[testiIdx].classList.remove('active');
      testiIdx = i;
      testiSlides[testiIdx].classList.add('active'); if (testiDots[testiIdx]) testiDots[testiIdx].classList.add('active');
      const prevBtn = document.getElementById('testiPrev');
      const nextBtn = document.getElementById('testiNext');
      if (prevBtn) prevBtn.disabled = testiIdx === 0;
      if (nextBtn) nextBtn.disabled = testiIdx === testiSlides.length - 1;
    };
    window.testiGo = testiGo;
    window.testiStep = function (dir) { testiGo(Math.max(0, Math.min(testiSlides.length - 1, testiIdx + dir))); };
    testiGo(0);
    setInterval(() => window.testiStep(testiIdx === testiSlides.length - 1 ? -(testiSlides.length - 1) : 1), 6000);
  }

  // ── Gallery carousel + lightbox (any page that includes it) ───
  const gTrackEl = document.getElementById('gTrack');
  if (gTrackEl) {
    const track   = gTrackEl;
    const slides  = Array.from(track.querySelectorAll('.gslide'));
    const thumbs  = document.getElementById('gThumbs');
    const counter = document.getElementById('gCounter');
    const playBtn = document.getElementById('gPlayBtn');
    const playIcon = document.getElementById('gPlayIcon');
    const stage   = document.querySelector('.gcarousel-stage');
    const total   = slides.length;
    let idx = 0;
    let playing = true;
    let timer = null;

    slides.forEach((slide, i) => {
      const img = slide.querySelector('img');
      const t = document.createElement('div');
      t.className = 'gthumb' + (i === 0 ? ' active' : '');
      t.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy" />`;
      t.addEventListener('click', () => { gGo(i); gRestartAutoplay(); });
      thumbs.appendChild(t);
    });
    const thumbEls = Array.from(thumbs.querySelectorAll('.gthumb'));

    function render() {
      track.style.transform = `translateX(-${idx * 100}%)`;
      counter.textContent = `${idx + 1} / ${total}`;
      thumbEls.forEach((t, i) => t.classList.toggle('active', i === idx));
      const activeThumb = thumbEls[idx];
      if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    function gGo(i) { idx = ((i % total) + total) % total; render(); }
    function gStep(dir) { gGo(idx + dir); }
    window.gGo = gGo;
    window.gStep = gStep;

    function gStartAutoplay() { timer = setInterval(() => gStep(1), 4500); }
    function gStopAutoplay() { clearInterval(timer); }
    function gRestartAutoplay() { if (playing) { gStopAutoplay(); gStartAutoplay(); } }

    window.gTogglePlay = function () {
      playing = !playing;
      if (playing) {
        gStartAutoplay();
        playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        playBtn.setAttribute('aria-label', 'Pause automatic slideshow');
      } else {
        gStopAutoplay();
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        playBtn.setAttribute('aria-label', 'Play automatic slideshow');
      }
    };

    stage.addEventListener('mouseenter', gStopAutoplay);
    stage.addEventListener('mouseleave', () => { if (playing) gStartAutoplay(); });

    slides.forEach((slide, i) => slide.addEventListener('click', () => gLightboxOpen(i)));

    const lightbox   = document.getElementById('gLightbox');
    const lbImg      = document.getElementById('gLightboxImg');
    const lbCounter  = document.getElementById('gLightboxCounter');
    let lbIdx = 0;

    window.gLightboxOpen = function (i) {
      lbIdx = i;
      lbImg.src = slides[lbIdx].querySelector('img').src;
      lbImg.alt = slides[lbIdx].querySelector('img').alt;
      lbCounter.textContent = `${lbIdx + 1} / ${total}`;
      lightbox.classList.add('open');
      gStopAutoplay();
      document.body.style.overflow = 'hidden';
    };
    window.gLightboxClose = function () {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (playing) gStartAutoplay();
    };
    window.gLightboxStep = function (dir) {
      lbIdx = ((lbIdx + dir) % total + total) % total;
      lbImg.src = slides[lbIdx].querySelector('img').src;
      lbImg.alt = slides[lbIdx].querySelector('img').alt;
      lbCounter.textContent = `${lbIdx + 1} / ${total}`;
      gGo(lbIdx);
    };
    lightbox.addEventListener('click', e => { if (e.target === lightbox) window.gLightboxClose(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') window.gLightboxClose();
      if (e.key === 'ArrowRight') window.gLightboxStep(1);
      if (e.key === 'ArrowLeft') window.gLightboxStep(-1);
    });

    let touchX = null;
    stage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) { gStep(dx < 0 ? 1 : -1); gRestartAutoplay(); }
      touchX = null;
    });

    render();
    gStartAutoplay();
  }

  // ── Sticky CTA bar (any page with a #hero to watch) ────────────
  const stickyCta = document.getElementById('stickyCta');
  const heroEl    = document.getElementById('hero');
  if (stickyCta && heroEl) {
    const stickyObs = new IntersectionObserver(([e]) => { stickyCta.classList.toggle('visible', !e.isIntersecting); }, { threshold: 0 });
    stickyObs.observe(heroEl);
  }

  // ── Netlify CMS identity redirect (any page) ───────────────────
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => { if (!user) { window.netlifyIdentity.on("login", () => { document.location.href = "/admin/"; }); } });
  }

  // ── Cookie consent + GA (any page) ─────────────────────────────
  window.enableGA = function () { if (window.gtag) gtag('config', 'G-W1EBPB2N87'); };
  if (window.cookieconsent) {
    window.cookieconsent.initialise({
      palette: { popup: { background: "#000000", text: "#f5f0e6" }, button: { background: "#d4af37", text: "#000000" } },
      theme: "classic", type: "opt-in", position: "bottom",
      content: { message: "We use cookies to improve your browsing experience and analyse traffic.", allow: "Accept", deny: "Reject", link: "Privacy Policy", href: "/privacy-policy.html" },
      onInitialise: function (status) { if (status == cookieconsent.status.allow) window.enableGA(); },
      onStatusChange: function (status) { if (status == cookieconsent.status.allow) window.enableGA(); }
    });
  }

});
