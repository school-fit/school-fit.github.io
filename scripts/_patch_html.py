"""Replace the exercise-phase section in index.html with the new carousel approach."""
import re

NEW_BLOCK = r"""function renderExercisePhaseRow(slug, tierDir) {
  if (!slug) return '';
  const td = tierDir || 'm';
  const srcs = [1,2,3].map(n =>
    exerciseAssetUrl('pictures/exercises/' + slug + '/' + td + '/phase-' + n + '.svg'));
  const labs = EXERCISE_PHASE_LABELS;
  const slides = srcs.map((src, i) =>
    '<div class="pv-slide' + (i===0?' pv-active':'') + '">' +
    '<img src="' + src + '" alt="' + labs[i] + '" loading="lazy" decoding="async"' +
    ' data-slug="' + slug + '" data-n="' + (i+1) + '" data-td="' + td + '"' +
    " onerror=\"pvImgFallback(this)\"" +
    ' onclick="event.stopPropagation();pvOpenLightbox(this)">' +
    '</div>'
  ).join('');
  const dots = [0,1,2].map(i =>
    '<span class="pv-dot' + (i===0?' pv-on':'') + '"' +
    " onclick=\"event.stopPropagation();phaseGo(this.closest('.pv-wrap')," + i + ')"></span>'
  ).join('');
  const labelSpans = labs.map((l,i) =>
    '<span class="pv-phlabel' + (i===0?' pv-on':'') + '">' + l + '</span>'
  ).join('');
  return (
    '<div class="pv-wrap" data-slug="' + slug + '" data-td="' + td + '" data-ph="0"' +
    ' onclick="event.stopPropagation()" role="group" aria-label="Faze cviku">' +
    '<p class="pv-err" role="status">Ilustrace se nenactely &mdash; zkus obnovit stranku.</p>' +
    '<div class="pv-track">' + slides + '</div>' +
    '<div class="pv-controls">' +
    '<button class="pv-btn pv-prev" aria-label="Predchozi faze"' +
    " onclick=\"event.stopPropagation();phaseNav(this.closest('.pv-wrap'),-1)\">&#8249;</button>" +
    '<div class="pv-center"><div class="pv-dots">' + dots + '</div>' +
    '<div class="pv-label">' + labelSpans + '</div></div>' +
    '<button class="pv-btn pv-next" aria-label="Dalsi faze"' +
    " onclick=\"event.stopPropagation();phaseNav(this.closest('.pv-wrap'),1)\">&#8250;</button>" +
    '</div>' +
    '</div>'
  );
}

window.phaseNav = function(wrap, dir) {
  if (!wrap) return;
  phaseGo(wrap, ((+(wrap.dataset.ph) || 0) + dir + 3) % 3);
};

window.phaseGo = function(wrap, idx) {
  if (!wrap) return;
  wrap.dataset.ph = idx;
  wrap.querySelectorAll('.pv-slide').forEach(function(s,i)   { s.classList.toggle('pv-active',  i===idx); });
  wrap.querySelectorAll('.pv-dot').forEach(function(d,i)     { d.classList.toggle('pv-on',      i===idx); });
  wrap.querySelectorAll('.pv-phlabel').forEach(function(l,i) { l.classList.toggle('pv-on',      i===idx); });
};

(function() {
  var tx0 = 0, ty0 = 0;
  document.addEventListener('touchstart', function(e) {
    var w = e.target.closest('.pv-wrap');
    if (!w) return;
    tx0 = e.touches[0].clientX;
    ty0 = e.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchend', function(e) {
    var w = e.target.closest('.pv-wrap');
    if (!w) return;
    var dx = e.changedTouches[0].clientX - tx0;
    var dy = e.changedTouches[0].clientY - ty0;
    if (Math.abs(dx) < 36 || Math.abs(dy) > Math.abs(dx) * 1.2) return;
    phaseNav(w, dx < 0 ? 1 : -1);
  }, {passive:true});
})();

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var lb = document.getElementById('exercisePhaseLightbox');
    if (lb && lb.classList.contains('active')) closeExercisePhaseLightbox();
    return;
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    var w = document.activeElement && document.activeElement.closest('.pv-wrap');
    if (!w) w = document.querySelector('.pv-wrap:focus-within');
    if (w) phaseNav(w, e.key === 'ArrowRight' ? 1 : -1);
  }
});

window.pvImgFallback = function(img) {
  var slug = img.dataset.slug, n = img.dataset.n;
  var step = +(img.dataset.fs || 0);
  var chain = [
    exerciseAssetUrl('pictures/exercises/' + slug + '/phase-' + n + '.svg'),
    exerciseAssetUrl('pictures/exercises/' + slug + '/m/phase-' + n + '.svg')
  ];
  if (step >= chain.length) {
    var wrap = img.closest('.pv-wrap');
    if (wrap) wrap.classList.add('pv-wrap-err');
    return;
  }
  img.dataset.fs = step + 1;
  img.src = chain[step];
};

function finalizeExercisePhaseImages() {
  document.querySelectorAll('.pv-wrap[data-slug]').forEach(function(wrap) {
    var slug = wrap.dataset.slug, td = wrap.dataset.td || 'm';
    var ok   = function() { wrap.classList.remove('pv-wrap-err'); };
    var fail = function() { wrap.classList.add('pv-wrap-err'); };
    var probe = new Image();
    probe.onload = ok;
    probe.onerror = function() {
      var p2 = new Image();
      p2.onload = ok; p2.onerror = fail;
      p2.src = exerciseAssetUrl('pictures/exercises/' + slug + '/phase-1.svg');
    };
    probe.src = exerciseAssetUrl('pictures/exercises/' + slug + '/' + td + '/phase-1.svg');
  });
}

window.pvOpenLightbox = function(img) {
  if (!img || !img.src) return;
  var lb   = document.getElementById('exercisePhaseLightbox');
  var full = document.getElementById('exercisePhaseLightboxImg');
  var cap  = document.getElementById('exercisePhaseLightboxCap');
  if (!lb || !full) return;
  lb._wrap = img.closest('.pv-wrap') || null;
  full.src = img.src;
  if (cap) cap.textContent = img.alt || '';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeExercisePhaseLightbox = function() {
  var lb   = document.getElementById('exercisePhaseLightbox');
  var full = document.getElementById('exercisePhaseLightboxImg');
  if (lb) { lb.classList.remove('active'); lb._wrap = null; }
  if (full) full.src = '';
  document.body.style.overflow = '';
};

window.lbNav = function(dir) {
  var lb   = document.getElementById('exercisePhaseLightbox');
  var full = document.getElementById('exercisePhaseLightboxImg');
  var cap  = document.getElementById('exercisePhaseLightboxCap');
  var wrap = lb && lb._wrap;
  if (!wrap || !full) return;
  phaseNav(wrap, dir);
  var active = wrap.querySelector('.pv-slide.pv-active img');
  if (active) { full.src = active.src; if (cap) cap.textContent = active.alt || ''; }
};

window.openExercisePhaseLightbox = window.pvOpenLightbox;"""

with open('../index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function renderExercisePhaseRow')
end   = content.find('\n\n// hash PIN')

if start == -1 or end == -1:
    raise RuntimeError('Markers not found! start=%d end=%d' % (start, end))

new_content = content[:start] + NEW_BLOCK + content[end:]

with open('../index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('OK – patched index.html. New length:', len(new_content))
