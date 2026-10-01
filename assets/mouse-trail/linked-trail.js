(() => {
  function setup() {
    const slide = document.getElementById('image-trail-slide');
    const stage = slide?.querySelector('.linked-intro-stage');
    if (!stage) return;
    const cards = [...stage.querySelectorAll('.linked-image')];
    const images = (window.mouseTrailImages || []).map(src => {
      const image = new Image();
      image.src = src;
      return image;
    });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let last = null, lastTime = 0, nextCard = 0, nextImage = cards.length;
    function reset() {
      last = null;
      lastTime = 0;
      cards.forEach(card => { card.style.left = ''; card.style.top = ''; });
    }
    stage.addEventListener('pointermove', event => {
      if (Reveal.getCurrentSlide() !== slide || Reveal.isOverview() ||
          event.pointerType !== 'mouse' || reduced.matches ||
          event.target.closest('a') || stage.contains(document.activeElement)) return;
      const rect = stage.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      if (last && Math.hypot(x - last.x, y - last.y) < 110) return;
      if (performance.now() - lastTime < 120) return;
      const card = cards[nextCard++ % cards.length];
      const box = card.getBoundingClientRect();
      // Keep the full link and label inside the viewport, including at the edges.
      card.style.left = `${Math.max(0, Math.min(rect.width - box.width, x - box.width / 2)) / rect.width * 100}%`;
      card.style.top = `${Math.max(0, Math.min(rect.height - box.height, y - box.height / 2)) / rect.height * 100}%`;
      for (let attempt = 0; attempt < images.length; attempt++) {
        const image = images[nextImage++ % images.length];
        if (image.complete && image.naturalWidth) {
          card.querySelector('img').src = image.src;
          break;
        }
      }
      last = { x, y };
      lastTime = performance.now();
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { last = null; });
    Reveal.on('slidechanged', reset);
    window.addEventListener('resize', reset);
    reduced.addEventListener('change', reset);
  }
  if (Reveal.isReady()) setup();
  else Reveal.on('ready', setup);
})();
