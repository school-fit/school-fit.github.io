/**
 * Generuje pictures/exercises/{slug}/{e|m|h|x}/phase-{1..3}.svg
 * a kopii úrovně „m“ do pictures/exercises/{slug}/phase-*.svg
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EX_ROOT = path.join(__dirname, '..', 'pictures', 'exercises');

const COL = { e: '#5b9fd4', m: '#c5e86d', h: '#e8943a', x: '#ff5c5c' };
const TIERS = ['e', 'm', 'h', 'x'];

const GY = 108;
const LINE_W = 2.05;
const JR = 2.5;

const P = (d, s, w = LINE_W) =>
  `<path d="${d}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** Hlava — jen obrys (jako ve vzoru) */
const H = (cx, cy, r, s) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${s}" stroke-width="1.85" fill="none" opacity="0.98"/>`;
const C = H;
/** Kloub / koncový bod */
const J = (cx, cy, s) => `<circle cx="${cx}" cy="${cy}" r="${JR}" fill="${s}"/>`;
const F = J;

function jointsFrom(points, s) {
  const seen = new Set();
  const parts = [];
  for (const pt of points) {
    if (!pt) continue;
    const [x, y] = pt;
    const k = `${x},${y}`;
    if (seen.has(k)) continue;
    seen.add(k);
    parts.push(J(x, y, s));
  }
  return parts.join('');
}

function poly(pts, s, w = LINE_W) {
  if (!pts || pts.length < 2) return '';
  const sw = Math.round(w * 100) / 100;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]} ${pts[i][1]}`;
  return P(d, s, sw);
}

/** Spodní okraj hlavy (spoj krku od obrysu, ne od středu kruhu) */
function chin(h, r = 7.5) {
  return [h[0], h[1] + r];
}

const NATIVE_SLUGS = new Set([
  'e-ct-kliky',
  'e-ct-lunge',
  'e-le-revlung',
  'e-ct-drep',
  'e-ka-squat',
  'e-le-squat',
  'e-ct-plank',
  'e-co-elplank',
  'e-ct-bridge',
  'e-co-bridge2',
  'e-le-onebridge'
]);

/** Staré souřadnice (120×100) — zmenšený scale, ať nohy sedí u podlahy y=108 */
function legacyWrap(inner) {
  return `<g transform="translate(34,4) scale(1.12)">${inner}</g>`;
}

function wrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none" aria-hidden="true">
<defs>
  <filter id="sfGlow" x="-35%" y="-35%" width="170%" height="170%">
    <feGaussianBlur stdDeviation="0.5" result="b"/>
    <feMerge>
      <feMergeNode in="b"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
<rect width="200" height="120" fill="#141414"/>
<line x1="8" y1="${GY}" x2="192" y2="${GY}" stroke="#4a5570" stroke-width="1.2" opacity="0.45"/>
<g filter="url(#sfGlow)">${body}</g>
</svg>`;
}

/** phase: 1 | 2 | 3 ; tier: e|m|h|x */
function bySlug(slug, stroke, phase, tier) {
  let inner;
  switch (slug) {
    case 'e-ct-lunge':
      inner = lungeForward(stroke, phase);
      break;
    case 'e-le-revlung':
      inner = lungeReverse(stroke, phase);
      break;
    case 'e-ct-drep':
    case 'e-ka-squat':
    case 'e-le-squat':
      inner = squat(stroke, phase, slug === 'e-le-squat');
      break;
    case 'e-ct-kliky':
      inner = pushup(stroke, phase, tier);
      break;
    case 'e-ct-plank':
      inner = plankHigh(stroke, phase, tier);
      break;
    case 'e-co-elplank':
      inner = plankElbow(stroke, phase, tier);
      break;
    case 'e-ct-bridge':
    case 'e-co-bridge2':
      inner = gluteBridge(stroke, phase, slug === 'e-co-bridge2');
      break;
    case 'e-le-onebridge':
      inner = oneLegBridge(stroke, phase);
      break;
    case 'e-ka-march':
      inner = marchInPlace(stroke, phase);
      break;
    case 'e-ka-jack':
      inner = jumpingJack(stroke, phase);
      break;
    case 'e-ka-knee':
      inner = highKnees(stroke, phase);
      break;
    case 'e-ka-side':
      inner = sideStep(stroke, phase);
      break;
    case 'e-mo-fold':
      inner = forwardFold(stroke, phase);
      break;
    case 'e-mo-bfly':
      inner = butterfly(stroke, phase);
      break;
    case 'e-mo-cat':
      inner = catCow(stroke, phase);
      break;
    case 'e-mo-twist':
      inner = seatedTwist(stroke, phase);
      break;
    case 'e-mo-pigeon':
      inner = pigeon(stroke, phase);
      break;
    case 'e-co-super':
      inner = superman(stroke, phase);
      break;
    case 'e-co-bird':
      inner = birdDog(stroke, phase);
      break;
    case 'e-co-side':
      inner = sidePlank(stroke, phase);
      break;
    case 'e-le-wall':
      inner = wallSit(stroke, phase);
      break;
    case 'e-le-calf':
      inner = calfRaise(stroke, phase);
      break;
    default:
      inner = neutralStand(stroke);
  }
  if (NATIVE_SLUGS.has(slug)) return inner;
  return legacyWrap(inner);
}

function neutralStand(stroke) {
  const cx = 100;
  const hip = [cx, 52];
  const sh = [cx, 36];
  const nk = [cx, 28];
  const hd = [cx, 18];
  const fl = [88, GY];
  const fr = [112, GY];
  return [
    H(hd[0], hd[1], 7.5, stroke),
    poly([chin(hd), nk, sh, hip], stroke),
    poly([hip, fl], stroke),
    poly([hip, fr], stroke),
    poly([sh, [78, 42]], stroke),
    poly([sh, [122, 42]], stroke),
    jointsFrom([nk, sh, hip, fl, fr, [78, 42], [122, 42], chin(hd)], stroke)
  ].join('');
}

/**
 * Výpad vpřed — výhradně profil z boku (jedna „viditelná“ noha vpředu + vzadu),
 * fáze 2: pokrčená kolena ~90° vpředu, zadní koleno nízko.
 */
function lungeForward(s, ph) {
  const w = LINE_W + 0.1;
  if (ph === 1) {
    const head = [82, 24];
    const neck = [84, 36];
    const hip = [88, 54];
    const fk = [92, 72];
    const ff = [98, GY];
    const bk = [82, 76];
    const bf = [76, GY];
    return [
      H(head[0], head[1], 7.5, s),
      poly([chin(head), neck, hip], s, w),
      poly([hip, fk, ff], s, w),
      poly([hip, bk, bf], s, w),
      poly([neck, [74, 44]], s, w),
      poly([neck, [92, 42]], s, w),
      jointsFrom([neck, hip, fk, ff, bk, bf, [74, 44], [92, 42]], s)
    ].join('');
  }
  if (ph === 2) {
    const head = [102, 26];
    const neck = [98, 38];
    const hip = [86, 56];
    const fk = [118, 78];
    const ff = [128, GY];
    const bk = [72, 88];
    const bf = [56, GY];
    return [
      H(head[0], head[1], 7.5, s),
      poly([chin(head), neck, hip], s, w),
      poly([hip, fk, ff], s, w),
      poly([hip, bk, bf], s, w),
      poly([neck, [86, 46]], s, w),
      poly([neck, [104, 44]], s, w),
      jointsFrom([neck, hip, fk, ff, bk, bf, [86, 46], [104, 44]], s)
    ].join('');
  }
  const head = [88, 24];
  const neck = [86, 36];
  const hip = [88, 54];
  const fk = [94, 74];
  const ff = [100, GY];
  const bk = [80, 78];
  const bf = [74, GY];
  return [
    H(head[0], head[1], 7.5, s),
    poly([chin(head), neck, hip], s, w),
    poly([hip, fk, ff], s, w),
    poly([hip, bk, bf], s, w),
    poly([neck, [76, 44]], s, w),
    poly([neck, [94, 42]], s, w),
    jointsFrom([neck, hip, fk, ff, bk, bf, [76, 44], [94, 42]], s)
  ].join('');
}

/** Výpad vzad — zadní noha dlouhá vzadu, přední pod kyčlí */
function lungeReverse(s, ph) {
  const w = LINE_W + 0.1;
  if (ph === 1) {
    const head = [92, 24];
    const neck = [90, 36];
    const hip = [94, 54];
    const ff = [102, GY];
    const bf = [86, GY];
    return [
      H(head[0], head[1], 7.5, s),
      poly([chin(head), neck, hip], s, w),
      poly([hip, [98, 72], ff], s, w),
      poly([hip, [90, 74], bf], s, w),
      poly([neck, [82, 44], [78, 50]], s, w),
      poly([neck, [100, 42]], s, w),
      jointsFrom([neck, hip, [98, 72], ff, [90, 74], bf, [82, 44], [78, 50], [100, 42]], s)
    ].join('');
  }
  if (ph === 2) {
    const head = [88, 26];
    const neck = [90, 38];
    const hip = [98, 56];
    const fk = [108, 76];
    const ff = [118, GY];
    const bk = [78, 82];
    const bf = [52, GY];
    return [
      H(head[0], head[1], 7.5, s),
      poly([chin(head), neck, hip], s, w),
      poly([hip, fk, ff], s, w),
      poly([hip, bk, bf], s, w),
      poly([neck, [84, 48]], s, w),
      poly([neck, [102, 46]], s, w),
      jointsFrom([neck, hip, fk, ff, bk, bf, [84, 48], [102, 46]], s)
    ].join('');
  }
  return lungeReverse(s, 1);
}

function squat(s, ph, oneLegHint) {
  const cx = 100;
  const w = LINE_W + 0.1;
  if (ph === 1) {
    const hd = [cx, 20];
    const sh = [cx, 34];
    const hip = [cx, 50];
    const fl = [86, GY];
    const fr = [114, GY];
    let g = [
      H(hd[0], hd[1], 7.5, s),
      poly([chin(hd), sh, hip], s, w),
      poly([hip, fl], s, w),
      poly([hip, fr], s, w),
      poly([sh, [82, 40]], s, w),
      poly([sh, [118, 40]], s, w),
      jointsFrom([sh, hip, fl, fr, [82, 40], [118, 40]], s)
    ].join('');
    if (oneLegHint) {
      g += poly([hip, [112, 82], [112, GY]], s, w) + J(112, GY, s);
    }
    return g;
  }
  if (ph === 2) {
    const hd = [cx, 32];
    const sh = [cx, 44];
    const hip = [cx, 68];
    const kl = [82, 84];
    const kr = [118, 84];
    const fl = [78, GY];
    const fr = [122, GY];
    return [
      H(hd[0], hd[1], 7.5, s),
      poly([chin(hd), sh, hip], s, w),
      poly([hip, kl, fl], s, w),
      poly([hip, kr, fr], s, w),
      poly([sh, [78, 56]], s, w),
      poly([sh, [122, 56]], s, w),
      jointsFrom([sh, hip, kl, kr, fl, fr, [78, 56], [122, 56]], s)
    ].join('');
  }
  const hd = [cx, 26];
  const sh = [cx, 38];
  const hip = [cx, 58];
  const kl = [86, 88];
  const kr = [114, 88];
  const fl = [82, GY];
  const fr = [118, GY];
  return [
    H(hd[0], hd[1], 7.5, s),
    poly([chin(hd), sh, hip], s, w),
    poly([hip, kl, fl], s, w),
    poly([hip, kr, fr], s, w),
    poly([sh, [80, 50]], s, w),
    poly([sh, [120, 50]], s, w),
    jointsFrom([sh, hip, kl, kr, fl, fr, [80, 50], [120, 50]], s)
  ].join('');
}

/** Kliky — profil; e = kolena na zemi, tělo v přímce ramen–kolena. */
function pushup(s, ph, tier) {
  const w = LINE_W + 0.15;
  const knee = tier === 'e';
  if (knee) {
    const base = (yHead, ySh, yHip) => {
      const head = [48, yHead];
      const sh = [62, ySh];
      const hip = [102, yHip];
      const kl = [112, GY];
      const kr = [128, GY];
      const el = [54, 88];
      const er = [58, 90];
      const wl = [46, GY];
      const wr = [60, GY];
      return [
        H(head[0], head[1], 7, s),
        poly([chin(head, 7), sh, hip], s, w),
        poly([hip, kl], s, w),
        poly([hip, kr], s, w),
        poly([sh, el, wl], s, w),
        poly([sh, er, wr], s, w),
        jointsFrom([sh, hip, kl, kr, el, er, wl, wr], s)
      ].join('');
    };
    if (ph === 1) return base(36, 54, 70);
    if (ph === 2) return base(46, 64, 74);
    return base(40, 58, 72);
  }
  const full = (yHead, shY, hipY, kneeY, elY, erY) => {
    const head = [40, yHead];
    const sh = [58, shY];
    const hip = [98, hipY];
    const knee = [132, kneeY];
    const foot = [168, GY];
    const wl = [44, GY];
    const wr = [58, GY];
    return [
      H(head[0], head[1], 7, s),
      poly([chin(head, 7), sh, hip, knee, foot], s, w),
      poly([sh, [50, elY], wl], s, w),
      poly([sh, [56, erY], wr], s, w),
      jointsFrom([sh, hip, knee, foot, [50, elY], [56, erY], wl, wr], s)
    ].join('');
  };
  if (ph === 1) return full(34, 62, 64, 68, 88, 90);
  if (ph === 2) return full(44, 68, 68, 72, 82, 84);
  return full(38, 64, 65, 69, 86, 88);
}

/** Prkno na dlaních — ramena–paty v jedné „lince“, ne „pejskoviště“. */
function plankHigh(s, ph, tier) {
  const w = LINE_W + 0.15;
  const knee = tier === 'e';
  const straightLine = (hipY, kneeY, sag) => {
    const head = [36, 46];
    const chin = [36, 53.5];
    const neck = [48, 56];
    const sh = [60, 62];
    const hip = [104, hipY];
    const knee = [138, kneeY];
    const ankle = [172, GY];
    const wl = [46, GY];
    const wr = [58, GY];
    const el = [52, 86];
    const er = [56, 88];
    const body = sag
      ? poly([neck, sh, hip], s, w) + poly([hip, knee, ankle], s, w)
      : poly([neck, sh, hip, knee, ankle], s, w);
    return [
      H(head[0], head[1], 7.5, s),
      poly([chin, neck], s, w),
      body,
      poly([sh, el, wl], s, w),
      poly([sh, er, wr], s, w),
      jointsFrom([neck, sh, hip, knee, ankle, el, er, wl, wr], s)
    ].join('');
  };
  if (knee) {
    const head = [44, 40];
    const neck = [52, 50];
    const sh = [64, 58];
    const hip = [108, 68];
    const kl = [116, GY];
    const kr = [130, GY];
    const wl = [50, GY];
    const wr = [66, GY];
    const el = [56, 84];
    const er = [60, 86];
    if (ph === 2) {
      return [
        H(head[0], head[1], 7, s),
        poly([chin(head, 7), neck, sh, hip], s, w),
        poly([hip, kl], s, w),
        poly([hip, kr], s, w),
        poly([sh, el, wl], s, w),
        poly([sh, er, wr], s, w),
        jointsFrom([neck, sh, hip, kl, kr, el, er, wl, wr], s)
      ].join('');
    }
    return [
      H(head[0], head[1], 7, s),
      poly([chin(head, 7), neck, sh, hip], s, w),
      poly([hip, kl], s, w),
      poly([hip, kr], s, w),
      poly([sh, el, wl], s, w),
      poly([sh, er, wr], s, w),
      jointsFrom([neck, sh, hip, kl, kr, el, er, wl, wr], s)
    ].join('');
  }
  if (ph === 1 || ph === 3) return straightLine(63, 66, false);
  return straightLine(74, 70, true);
}

function plankElbow(s, ph, tier) {
  const w = LINE_W + 0.15;
  const ely = GY - 2;
  const knee = tier === 'e';
  const elbowPlank = (hipY, knY, headY) => {
    const head = [40, headY];
    const neck = [50, headY + 12];
    const sh = [62, neck[1] + 8];
    const hip = [102, hipY];
    const knee = [136, knY];
    const ankle = [168, GY];
    return [
      H(head[0], head[1], 7.5, s),
      poly([chin(head), neck, sh, hip, knee, ankle], s, w),
      poly([sh, [54, ely], [48, GY]], s, w),
      poly([sh, [58, ely], [62, GY]], s, w),
      jointsFrom([neck, sh, hip, knee, ankle, [54, ely], [48, GY], [58, ely], [62, GY]], s)
    ].join('');
  };
  if (knee) {
    const head = [46, 38];
    const neck = [54, 48];
    const sh = [66, 58];
    const hip = [110, 68];
    const kl = [118, GY];
    const kr = [132, GY];
    if (ph === 2) {
      return [
        H(head[0], head[1], 7, s),
        poly([chin(head, 7), neck, sh, hip], s, w),
        poly([hip, kl], s, w),
        poly([hip, kr], s, w),
        poly([sh, [58, ely], [52, GY]], s, w),
        poly([sh, [62, ely], [66, GY]], s, w),
        jointsFrom([neck, sh, hip, kl, kr, [58, ely], [52, GY], [62, ely], [66, GY]], s)
      ].join('');
    }
    return [
      H(head[0], head[1], 7, s),
      poly([chin(head, 7), neck, sh, hip], s, w),
      poly([hip, kl], s, w),
      poly([hip, kr], s, w),
      poly([sh, [58, ely], [52, GY]], s, w),
      poly([sh, [62, ely], [66, GY]], s, w),
      jointsFrom([neck, sh, hip, kl, kr, [58, ely], [52, GY], [62, ely], [66, GY]], s)
    ].join('');
  }
  if (ph === 1 || ph === 3) return elbowPlank(62, 66, 34);
  return elbowPlank(70, 68, 36);
}

function gluteBridge(s, ph, singleLegAccent) {
  const w = LINE_W + 0.1;
  const head = [168, 42];
  const shoulder = [138, 52];
  const hipD = ph === 2 ? [88, 48] : ph === 3 ? [90, 46] : [88, 58];
  const kneeL = [72, 72];
  const kneeR = [92, 72];
  const footL = [62, GY];
  const footR = [98, GY];
  const lift = singleLegAccent ? poly([hipD, [102, 28], [118, 40]], s, w) + J(118, 40, s) : '';
  return [
    H(head[0], head[1], 7.5, s),
    poly([chin(head), shoulder, hipD], s, w),
    poly([hipD, kneeL, footL], s, w),
    poly([hipD, kneeR, footR], s, w),
    lift,
    jointsFrom([shoulder, hipD, kneeL, kneeR, footL, footR], s)
  ].join('');
}

function oneLegBridge(s, ph) {
  const w = LINE_W + 0.1;
  const head = [166, 40];
  const shoulder = [136, 50];
  const hip = ph === 2 ? [86, 44] : [88, 56];
  const kL = [70, 72];
  const kR = [92, 72];
  const fL = [60, GY];
  const fR = [98, GY];
  const lift = poly([hip, [104, 26], [122, 38]], s, w);
  return [
    H(head[0], head[1], 7.5, s),
    poly([chin(head), shoulder, hip], s, w),
    poly([hip, kL, fL], s, w),
    poly([hip, kR, fR], s, w),
    lift,
    jointsFrom([shoulder, hip, kL, kR, fL, fR, [104, 26], [122, 38]], s)
  ].join('');
}

function marchInPlace(s, ph) {
  if (ph === 1) {
    return [
      C(60, 20, 7, s),
      P('M60 27 L60 46', s),
      P('M60 46 L54 92', s),
      P('M60 46 L66 92', s),
      P('M60 32 L50 40', s),
      P('M60 32 L70 38', s),
      F(54, 92, s),
      F(66, 92, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 20, 7, s),
      P('M60 27 L62 46', s),
      P('M62 46 L56 92', s),
      P('M62 46 L68 58 L72 72', s),
      P('M60 32 L48 38', s),
      P('M60 32 L72 36', s),
      F(56, 92, s),
      F(72, 72, s)
    ].join('');
  }
  return [
    C(60, 20, 7, s),
    P('M60 27 L58 46', s),
    P('M58 46 L52 58 L50 72', s),
    P('M58 46 L64 92', s),
    P('M60 32 L48 40', s),
    P('M60 32 L70 38', s),
    F(50, 72, s),
    F(64, 92, s)
  ].join('');
}

function jumpingJack(s, ph) {
  if (ph === 1) {
    return [
      C(60, 22, 7, s),
      P('M60 29 L60 48', s),
      P('M60 48 L56 92', s),
      P('M60 48 L64 92', s),
      P('M60 34 L52 44', s),
      P('M60 34 L68 44', s),
      F(56, 92, s),
      F(64, 92, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 20, 7, s),
      P('M60 27 L60 46', s),
      P('M60 46 L48 88', s),
      P('M60 46 L72 88', s),
      P('M60 32 L42 18', s),
      P('M60 32 L78 18', s),
      F(48, 88, s),
      F(72, 88, s)
    ].join('');
  }
  return jumpingJack(s, 1);
}

/** Kolena výš — výraznější než klidný pochod */
function highKnees(s, ph) {
  if (ph === 1) {
    return [
      C(60, 20, 7, s),
      P('M60 27 L60 46', s),
      P('M60 46 L56 92', s),
      P('M60 46 L64 92', s),
      P('M60 32 L50 38', s),
      P('M60 32 L70 36', s),
      F(56, 92, s),
      F(64, 92, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 18, 7, s),
      P('M60 25 L62 44', s),
      P('M62 44 L58 92', s),
      P('M62 44 L66 48 L70 32', s),
      P('M60 30 L48 34', s),
      P('M60 30 L74 36', s),
      F(58, 92, s),
      F(70, 32, s)
    ].join('');
  }
  return [
    C(60, 18, 7, s),
    P('M60 25 L58 44', s),
    P('M58 44 L52 32', s),
    P('M58 44 L62 92', s),
    P('M60 30 L48 36', s),
    P('M60 30 L72 34', s),
    F(52, 32, s),
    F(62, 92, s)
  ].join('');
}

function sideStep(s, ph) {
  if (ph === 1) {
    return [
      C(50, 22, 7, s),
      P('M50 29 L52 48', s),
      P('M52 48 L48 92', s),
      P('M52 48 L58 92', s),
      P('M50 34 L40 40', s),
      P('M50 34 L58 38', s),
      F(48, 92, s),
      F(58, 92, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 22, 7, s),
      P('M60 29 L60 48', s),
      P('M60 48 L54 92', s),
      P('M60 48 L68 88', s),
      P('M60 34 L48 40', s),
      P('M60 34 L72 38', s),
      F(54, 92, s),
      F(68, 88, s)
    ].join('');
  }
  return [
    C(72, 22, 7, s),
    P('M72 29 L70 48', s),
    P('M70 48 L66 92', s),
    P('M70 48 L76 92', s),
    P('M72 34 L62 40', s),
    P('M72 34 L80 38', s),
    F(66, 92, s),
    F(76, 92, s)
  ].join('');
}

function forwardFold(s, ph) {
  if (ph === 1) {
    return [
      C(60, 18, 7, s),
      P('M60 25 L60 44', s),
      P('M60 44 L56 92', s),
      P('M60 44 L64 92', s),
      P('M60 30 L50 36', s),
      P('M60 30 L70 36', s),
      F(56, 92, s),
      F(64, 92, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 28, 7, s),
      P('M60 35 L58 50 L54 68', s),
      P('M54 68 L52 92', s),
      P('M54 68 L62 92', s),
      P('M58 42 L50 58', s),
      P('M58 42 L64 56', s),
      F(52, 92, s),
      F(62, 92, s)
    ].join('');
  }
  return [
    C(62, 48, 7, s),
    P('M62 55 L60 62 L58 72', s),
    P('M58 72 L54 92', s),
    P('M58 72 L64 92', s),
    P('M60 60 L52 78', s),
    P('M60 60 L66 76', s),
    F(54, 92, s),
    F(64, 92, s)
  ].join('');
}

function butterfly(s, ph) {
  if (ph === 1) {
    return [
      C(60, 28, 7, s),
      P('M60 35 L60 52', s),
      P('M60 52 L48 72 L44 88', s),
      P('M60 52 L72 72 L76 88', s),
      P('M60 40 L50 48', s),
      P('M60 40 L70 48', s),
      F(44, 88, s),
      F(76, 88, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 28, 7, s),
      P('M60 35 L60 50', s),
      P('M60 50 L46 68 L40 86', s),
      P('M60 50 L74 68 L80 86', s),
      P('M60 40 L48 46', s),
      P('M60 40 L72 46', s),
      P('M52 68 L68 68', s, 2),
      F(40, 86, s),
      F(80, 86, s)
    ].join('');
  }
  return [
    C(60, 28, 7, s),
    P('M60 35 L60 51', s),
    P('M60 51 L47 70 L42 86', s),
    P('M60 51 L73 70 L78 86', s),
    P('M60 40 L49 47', s),
    P('M60 40 L71 47', s),
    F(42, 86, s),
    F(78, 86, s)
  ].join('');
}

function catCow(s, ph) {
  if (ph === 1) {
    return [
      C(70, 38, 6, s),
      P('M70 44 L58 48 L46 50', s),
      P('M46 50 L42 72', s),
      P('M46 50 L52 72', s),
      P('M58 48 L54 72', s),
      P('M58 48 L62 72', s),
      F(42, 72, s),
      F(52, 72, s),
      F(54, 72, s),
      F(62, 72, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(68, 40, 6, s),
      P('M68 46 L56 44 L44 46', s),
      P('M44 46 L40 72', s),
      P('M44 46 L50 72', s),
      P('M56 44 L52 72', s),
      P('M56 44 L60 72', s),
      F(40, 72, s),
      F(50, 72, s),
      F(52, 72, s),
      F(60, 72, s)
    ].join('');
  }
  return [
    C(72, 36, 6, s),
    P('M72 42 L60 50 L48 52', s),
    P('M48 52 L42 72', s),
    P('M48 52 L54 72', s),
    P('M60 50 L56 72', s),
    P('M60 50 L64 72', s),
    F(42, 72, s),
    F(54, 72, s),
    F(56, 72, s),
    F(64, 72, s)
  ].join('');
}

function seatedTwist(s, ph) {
  if (ph === 1) {
    return [
      C(60, 26, 7, s),
      P('M60 33 L60 50', s),
      P('M60 50 L52 88', s),
      P('M60 50 L68 88', s),
      P('M60 40 L48 46', s),
      P('M60 40 L72 46', s),
      F(52, 88, s),
      F(68, 88, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(56, 26, 7, s),
      P('M56 33 L58 50', s),
      P('M58 50 L50 88', s),
      P('M58 50 L66 88', s),
      P('M56 40 L44 44 L36 50', s),
      P('M56 40 L68 42', s),
      F(50, 88, s),
      F(66, 88, s)
    ].join('');
  }
  return [
    C(64, 26, 7, s),
    P('M64 33 L62 50', s),
    P('M62 50 L54 88', s),
    P('M62 50 L70 88', s),
    P('M64 40 L72 44 L80 50', s),
    P('M64 40 L52 42', s),
    F(54, 88, s),
    F(70, 88, s)
  ].join('');
}

function pigeon(s, ph) {
  if (ph === 1) {
    return [
      C(72, 32, 6, s),
      P('M72 38 L58 46 L48 50', s),
      P('M48 50 L46 72', s),
      P('M48 50 L56 72', s),
      P('M58 46 L52 72', s),
      P('M58 46 L62 72', s),
      F(46, 72, s),
      F(56, 72, s),
      F(52, 72, s),
      F(62, 72, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(70, 34, 6, s),
      P('M70 40 L56 48 L50 54', s),
      P('M50 54 L48 72', s),
      P('M50 54 L58 72', s),
      P('M56 48 L54 72', s),
      P('M56 48 L64 70 L70 88', s),
      F(48, 72, s),
      F(58, 72, s),
      F(54, 72, s),
      F(70, 88, s)
    ].join('');
  }
  return [
    C(68, 30, 6, s),
    P('M68 36 L54 44 L46 50', s),
    P('M46 50 L44 72', s),
    P('M46 50 L54 72', s),
    P('M54 44 L50 72', s),
    P('M54 44 L62 68 L68 86', s),
    F(44, 72, s),
    F(54, 72, s),
    F(50, 72, s),
    F(68, 86, s)
  ].join('');
}

function superman(s, ph) {
  if (ph === 1) {
    return [
      C(60, 42, 6, s),
      P('M60 48 L60 58', s),
      P('M60 58 L52 72', s),
      P('M60 58 L68 72', s),
      P('M60 52 L48 54', s),
      P('M60 52 L72 54', s),
      F(52, 72, s),
      F(68, 72, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 38, 6, s),
      P('M60 44 L60 56', s),
      P('M60 56 L48 70', s),
      P('M60 56 L72 70', s),
      P('M60 48 L38 46', s),
      P('M60 48 L82 46', s),
      F(48, 70, s),
      F(72, 70, s)
    ].join('');
  }
  return superman(s, 1);
}

function birdDog(s, ph) {
  if (ph === 1) {
    return catCow(s, 1);
  }
  if (ph === 2) {
    return [
      C(70, 38, 6, s),
      P('M70 44 L58 48 L46 50', s),
      P('M46 50 L42 72', s),
      P('M46 50 L52 72', s),
      P('M58 48 L54 72', s),
      P('M58 48 L62 72', s),
      P('M70 44 L82 36', s, 2),
      P('M46 50 L34 58', s, 2),
      F(42, 72, s),
      F(52, 72, s),
      F(54, 72, s),
      F(62, 72, s),
      F(82, 36, s),
      F(34, 58, s)
    ].join('');
  }
  return [
    C(70, 38, 6, s),
    P('M70 44 L58 48 L46 50', s),
    P('M46 50 L42 72', s),
    P('M46 50 L52 72', s),
    P('M58 48 L54 72', s),
    P('M58 48 L62 72', s),
    P('M70 44 L80 40', s, 2),
    P('M46 50 L38 62', s, 2),
    F(42, 72, s),
    F(52, 72, s),
    F(54, 72, s),
    F(62, 72, s),
    F(80, 40, s),
    F(38, 62, s)
  ].join('');
}

function sidePlank(s, ph) {
  if (ph === 1) {
    return [
      C(48, 52, 6, s),
      P('M48 58 L56 56 L68 58 L78 62', s),
      P('M56 56 L54 72', s),
      P('M68 58 L72 72', s),
      P('M56 52 L50 48', s, 2),
      F(54, 72, s),
      F(72, 72, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(46, 48, 6, s),
      P('M46 54 L58 50 L72 52 L84 56', s),
      P('M58 50 L56 72', s),
      P('M72 52 L74 72', s),
      P('M58 48 L52 42', s, 2),
      F(56, 72, s),
      F(74, 72, s)
    ].join('');
  }
  return sidePlank(s, 1);
}

function wallSit(s, ph) {
  if (ph === 1) {
    return [
      P('M18 30 L18 92', s, 3),
      C(56, 28, 7, s),
      P('M56 35 L58 52', s),
      P('M58 52 L52 78', s),
      P('M58 52 L66 78', s),
      P('M56 40 L48 48', s),
      P('M56 40 L66 46', s),
      F(52, 78, s),
      F(66, 78, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      P('M18 30 L18 92', s, 3),
      C(58, 32, 7, s),
      P('M58 39 L60 54', s),
      P('M60 54 L50 78', s),
      P('M60 54 L70 78', s),
      P('M58 44 L46 52', s),
      P('M58 44 L68 50', s),
      F(50, 78, s),
      F(70, 78, s)
    ].join('');
  }
  return wallSit(s, 1);
}

function calfRaise(s, ph) {
  if (ph === 1) {
    return [
      C(60, 18, 7, s),
      P('M60 25 L60 44', s),
      P('M60 44 L56 88', s),
      P('M60 44 L64 88', s),
      P('M60 30 L52 38', s),
      P('M60 30 L68 38', s),
      F(56, 88, s),
      F(64, 88, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(60, 14, 7, s),
      P('M60 21 L60 40', s),
      P('M60 40 L56 84', s),
      P('M60 40 L64 84', s),
      P('M56 84 L56 90', s, 2),
      P('M64 84 L64 90', s, 2),
      P('M60 26 L52 32', s),
      P('M60 26 L68 32', s),
      F(56, 90, s),
      F(64, 90, s)
    ].join('');
  }
  return calfRaise(s, 1);
}

const SLUGS = [
  'e-ct-kliky',
  'e-ct-drep',
  'e-ct-bridge',
  'e-ct-lunge',
  'e-ct-plank',
  'e-ka-march',
  'e-ka-jack',
  'e-ka-knee',
  'e-ka-side',
  'e-ka-squat',
  'e-mo-fold',
  'e-mo-bfly',
  'e-mo-cat',
  'e-mo-twist',
  'e-mo-pigeon',
  'e-co-elplank',
  'e-co-super',
  'e-co-bird',
  'e-co-side',
  'e-co-bridge2',
  'e-le-squat',
  'e-le-revlung',
  'e-le-onebridge',
  'e-le-wall',
  'e-le-calf'
];

function writeAll() {
  for (const slug of SLUGS) {
    for (const tier of TIERS) {
      const stroke = COL[tier];
      const dir = path.join(EX_ROOT, slug, tier);
      fs.mkdirSync(dir, { recursive: true });
      for (let ph = 1; ph <= 3; ph++) {
        const body = bySlug(slug, stroke, ph, tier);
        fs.writeFileSync(path.join(dir, `phase-${ph}.svg`), wrap(body), 'utf8');
      }
    }
    const mDir = path.join(EX_ROOT, slug, 'm');
    for (let ph = 1; ph <= 3; ph++) {
      const src = fs.readFileSync(path.join(mDir, `phase-${ph}.svg`), 'utf8');
      fs.writeFileSync(path.join(EX_ROOT, slug, `phase-${ph}.svg`), src, 'utf8');
    }
  }
  console.log(`OK: ${SLUGS.length} cviků × ${TIERS.length} úrovní × 3 fáze + kořenové kopie (m)`);
}

writeAll();
