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

const P = (d, s, w = 2.5) =>
  `<path d="${d}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const C = (cx, cy, r, s, w = 2) => `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${s}" stroke-width="${w}"/>`;
const F = (cx, cy, s) => `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${s}"/>`;

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
<rect width="200" height="120" fill="#141414"/>
<line x1="10" y1="108" x2="190" y2="108" stroke="#2a2a2a" stroke-width="2"/>
${body}
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
  return [
    C(60, 22, 7, stroke),
    P('M60 29 L60 50', stroke),
    P('M60 50 L52 92', stroke),
    P('M60 50 L68 92', stroke),
    P('M60 34 L48 40', stroke),
    P('M60 34 L72 40', stroke),
    F(52, 92, stroke),
    F(68, 92, stroke)
  ].join('');
}

const GY = 108;
const SW = 3.2;

/** Výpad vpřed — profil, podlaha y=GY */
function lungeForward(s, ph) {
  if (ph === 1) {
    return [
      C(88, 26, 8, s, 2.2),
      P(`M88 34 L86 58`, s, SW),
      P(`M86 58 L76 ${GY}`, s, SW),
      P(`M86 58 L100 ${GY}`, s, SW),
      P(`M88 40 L74 48`, s, SW - 0.6),
      P(`M88 40 L96 44`, s, SW - 0.6),
      F(76, GY, s),
      F(100, GY, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(102, 28, 8, s, 2.2),
      P(`M102 36 L96 54`, s, SW),
      P(`M96 54 L122 70 L138 ${GY}`, s, SW),
      P(`M96 54 L74 78 L64 ${GY}`, s, SW),
      P(`M100 42 L86 50`, s, SW - 0.6),
      P(`M102 42 L110 46`, s, SW - 0.6),
      F(64, GY, s),
      F(138, GY, s)
    ].join('');
  }
  return [
    C(92, 26, 8, s, 2.2),
    P(`M92 34 L90 58`, s, SW),
    P(`M90 58 L82 ${GY}`, s, SW),
    P(`M90 58 L104 ${GY}`, s, SW),
    P(`M92 40 L80 48`, s, SW - 0.6),
    P(`M92 40 L100 44`, s, SW - 0.6),
    F(82, GY, s),
    F(104, GY, s)
  ].join('');
}

/** Výpad vzad */
function lungeReverse(s, ph) {
  if (ph === 1) {
    return [
      C(108, 26, 8, s, 2.2),
      P(`M108 34 L106 58`, s, SW),
      P(`M106 58 L100 ${GY}`, s, SW),
      P(`M106 58 L116 ${GY}`, s, SW),
      P(`M108 40 L96 46`, s, SW - 0.6),
      P(`M108 40 L118 44`, s, SW - 0.6),
      F(100, GY, s),
      F(116, GY, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(98, 28, 8, s, 2.2),
      P(`M98 36 L102 54`, s, SW),
      P(`M102 54 L118 ${GY}`, s, SW),
      P(`M102 54 L68 74 L58 ${GY}`, s, SW),
      P(`M100 42 L90 48`, s, SW - 0.6),
      P(`M98 42 L108 46`, s, SW - 0.6),
      F(58, GY, s),
      F(118, GY, s)
    ].join('');
  }
  return [
    C(104, 26, 8, s, 2.2),
    P(`M104 34 L104 58`, s, SW),
    P(`M104 58 L96 ${GY}`, s, SW),
    P(`M104 58 L114 ${GY}`, s, SW),
    P(`M104 40 L94 46`, s, SW - 0.6),
    P(`M104 40 L114 44`, s, SW - 0.6),
    F(96, GY, s),
    F(114, GY, s)
  ].join('');
}

function squat(s, ph, oneLegHint) {
  const cx = 100;
  if (ph === 1) {
    let extra = '';
    if (oneLegHint) {
      extra = P(`M${cx} 52 L112 88`, s, SW - 0.8) + F(112, 88, s);
    }
    return (
      [
        C(cx, 22, 8, s, 2.2),
        P(`M${cx} 30 L${cx} 52`, s, SW),
        P(`M${cx} 52 L86 ${GY}`, s, SW),
        P(`M${cx} 52 L114 ${GY}`, s, SW),
        P(`M${cx} 36 L84 44`, s, SW - 0.6),
        P(`M${cx} 36 L116 44`, s, SW - 0.6),
        F(86, GY, s),
        F(114, GY, s)
      ].join('') + extra
    );
  }
  if (ph === 2) {
    return [
      C(cx, 34, 8, s, 2.2),
      P(`M${cx} 42 L${cx} 70`, s, SW),
      P(`M${cx} 70 L82 86 L78 ${GY}`, s, SW),
      P(`M${cx} 70 L118 86 L122 ${GY}`, s, SW),
      P(`M${cx} 48 L78 60`, s, SW - 0.6),
      P(`M${cx} 48 L122 60`, s, SW - 0.6),
      F(78, GY, s),
      F(122, GY, s)
    ].join('');
  }
  return [
    C(cx, 28, 8, s, 2.2),
    P(`M${cx} 36 L${cx} 58`, s, SW),
    P(`M${cx} 58 L88 90 L90 ${GY}`, s, SW),
    P(`M${cx} 58 L112 90 L110 ${GY}`, s, SW),
    P(`M${cx} 42 L82 52`, s, SW - 0.6),
    P(`M${cx} 42 L118 52`, s, SW - 0.6),
    F(90, GY, s),
    F(110, GY, s)
  ].join('');
}

/**
 * Kliky — profil z boku, jasná fáze nahoře / dole / nahoru.
 * Úroveň e: kliky s koleny na zemi (návod odpovídá lehké variantě).
 */
function pushup(s, ph, tier) {
  const knee = tier === 'e';
  const w = SW;
  if (knee) {
    if (ph === 1) {
      return [
        C(54, 40, 8, s, 2.2),
        P(`M54 48 L70 60 L104 74`, s, w),
        P(`M70 60 L50 ${GY}`, s, w),
        P(`M70 60 L74 ${GY}`, s, w),
        P(`M104 74 L116 ${GY}`, s, w),
        P(`M104 74 L130 ${GY}`, s, w),
        F(50, GY, s),
        F(74, GY, s),
        F(116, GY, s),
        F(130, GY, s)
      ].join('');
    }
    if (ph === 2) {
      return [
        C(58, 50, 8, s, 2.2),
        P(`M58 58 L72 72 L100 80`, s, w),
        P(`M72 72 L48 ${GY}`, s, w),
        P(`M72 72 L76 ${GY}`, s, w),
        P(`M100 80 L114 ${GY}`, s, w),
        P(`M100 80 L128 ${GY}`, s, w),
        F(48, GY, s),
        F(76, GY, s),
        F(114, GY, s),
        F(128, GY, s)
      ].join('');
    }
    return [
      C(56, 44, 8, s, 2.2),
      P(`M56 52 L70 64 L102 76`, s, w),
      P(`M70 64 L50 ${GY}`, s, w),
      P(`M70 64 L74 ${GY}`, s, w),
      P(`M102 76 L116 ${GY}`, s, w),
      P(`M102 76 L130 ${GY}`, s, w),
      F(50, GY, s),
      F(74, GY, s),
      F(116, GY, s),
      F(130, GY, s)
    ].join('');
  }
  if (ph === 1) {
    return [
      C(44, 34, 8, s, 2.2),
      P(`M44 42 L60 54 L102 64 L138 76 L168 ${GY}`, s, w),
      P(`M60 54 L46 ${GY}`, s, w),
      P(`M60 54 L74 ${GY}`, s, w),
      F(46, GY, s),
      F(74, GY, s),
      F(168, GY, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(52, 48, 8, s, 2.2),
      P(`M52 56 L64 72 L96 76 L130 84 L162 ${GY}`, s, w),
      P(`M64 72 L44 ${GY}`, s, w),
      P(`M64 72 L80 ${GY}`, s, w),
      F(44, GY, s),
      F(80, GY, s),
      F(162, GY, s)
    ].join('');
  }
  return [
    C(48, 38, 8, s, 2.2),
    P(`M48 46 L58 58 L100 66 L136 78 L166 ${GY}`, s, w),
    P(`M58 58 L46 ${GY}`, s, w),
    P(`M58 58 L72 ${GY}`, s, w),
    F(46, GY, s),
    F(72, GY, s),
    F(166, GY, s)
  ].join('');
}

function plankHigh(s, ph, tier) {
  const knee = tier === 'e';
  const w = SW;
  if (knee) {
    if (ph === 1) {
      return [
        C(52, 36, 8, s, 2.2),
        P(`M52 44 L68 56 L108 66`, s, w),
        P(`M68 56 L48 ${GY}`, s, w),
        P(`M68 56 L74 ${GY}`, s, w),
        P(`M108 66 L120 ${GY}`, s, w),
        P(`M108 66 L134 ${GY}`, s, w),
        F(48, GY, s),
        F(74, GY, s),
        F(120, GY, s),
        F(134, GY, s)
      ].join('');
    }
    if (ph === 2) {
      return [
        C(54, 38, 8, s, 2.2),
        P(`M54 46 L70 58 L110 68`, s, 2.6),
        P(`M70 58 L50 ${GY}`, s, w),
        P(`M70 58 L76 ${GY}`, s, w),
        P(`M110 68 L122 ${GY}`, s, w),
        P(`M110 68 L136 ${GY}`, s, w),
        F(50, GY, s),
        F(76, GY, s),
        F(122, GY, s),
        F(136, GY, s)
      ].join('');
    }
    return plankHigh(s, 1, tier);
  }
  if (ph === 1) {
    return [
      C(42, 32, 8, s, 2.2),
      P(`M42 40 L58 50 L104 60 L142 72 L172 ${GY}`, s, w),
      P(`M58 50 L46 ${GY}`, s, w),
      P(`M58 50 L72 ${GY}`, s, w),
      F(46, GY, s),
      F(72, GY, s),
      F(172, GY, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(44, 34, 8, s, 2.2),
      P(`M44 42 L60 52 L106 62 L144 74 L174 ${GY}`, s, 2.7),
      P(`M60 52 L48 ${GY}`, s, w),
      P(`M60 52 L74 ${GY}`, s, w),
      F(48, GY, s),
      F(74, GY, s),
      F(174, GY, s)
    ].join('');
  }
  return plankHigh(s, 1, tier);
}

function plankElbow(s, ph, tier) {
  const knee = tier === 'e';
  const w = SW;
  const ely = GY - 4;
  if (knee) {
    if (ph === 1) {
      return [
        C(56, 34, 8, s, 2.2),
        P(`M56 42 L74 54 L110 64`, s, w),
        P(`M74 54 L62 ${ely} L54 ${GY}`, s, w),
        P(`M74 54 L70 ${ely} L78 ${GY}`, s, w),
        P(`M110 64 L122 ${GY}`, s, w),
        P(`M110 64 L136 ${GY}`, s, w),
        F(54, GY, s),
        F(78, GY, s),
        F(122, GY, s),
        F(136, GY, s)
      ].join('');
    }
    if (ph === 2) {
      return [
        C(58, 36, 8, s, 2.2),
        P(`M58 44 L76 56 L112 66`, s, w),
        P(`M76 56 L64 ${ely} L56 ${GY}`, s, w),
        P(`M76 56 L72 ${ely} L80 ${GY}`, s, w),
        P(`M112 66 L124 ${GY}`, s, w),
        P(`M112 66 L138 ${GY}`, s, w),
        F(56, GY, s),
        F(80, GY, s),
        F(124, GY, s),
        F(138, GY, s)
      ].join('');
    }
    return plankElbow(s, 1, tier);
  }
  if (ph === 1) {
    return [
      C(48, 30, 8, s, 2.2),
      P(`M48 38 L68 48 L108 58 L148 70 L172 ${GY}`, s, w),
      P(`M68 48 L58 ${ely} L50 ${GY}`, s, w),
      P(`M68 48 L64 ${ely} L76 ${GY}`, s, w),
      F(50, GY, s),
      F(76, GY, s),
      F(172, GY, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(50, 32, 8, s, 2.2),
      P(`M50 40 L70 50 L110 60 L150 72 L174 ${GY}`, s, w),
      P(`M70 50 L60 ${ely} L52 ${GY}`, s, w),
      P(`M70 50 L66 ${ely} L78 ${GY}`, s, w),
      F(52, GY, s),
      F(78, GY, s),
      F(174, GY, s)
    ].join('');
  }
  return plankElbow(s, 1, tier);
}

function gluteBridge(s, ph, singleLegAccent) {
  const w = SW - 0.2;
  const legLift = singleLegAccent ? P(`M78 56 L96 34 L114 46`, s, w - 0.6) : '';
  if (ph === 1) {
    return [
      C(172, 44, 8, s, 2.2),
      P(`M172 52 L124 58 L76 62`, s, w),
      P(`M76 62 L56 ${GY}`, s, w),
      P(`M76 62 L94 ${GY}`, s, w),
      F(56, GY, s),
      F(94, GY, s),
      legLift
    ].join('');
  }
  if (ph === 2) {
    return [
      C(170, 34, 8, s, 2.2),
      P(`M170 42 L126 48 L80 52`, s, w),
      P(`M80 52 L58 ${GY}`, s, w),
      P(`M80 52 L98 ${GY}`, s, w),
      F(58, GY, s),
      F(98, GY, s),
      singleLegAccent ? P(`M80 52 L104 30 L122 42`, s, w - 0.6) : ''
    ].join('');
  }
  return [
    C(172, 32, 8, s, 2.2),
    P(`M172 40 L128 46 L82 50`, s, w),
    P(`M82 50 L60 ${GY}`, s, w),
    P(`M82 50 L100 ${GY}`, s, w),
    F(60, GY, s),
    F(100, GY, s)
  ].join('');
}

function oneLegBridge(s, ph) {
  const w = SW - 0.2;
  if (ph === 1) {
    return [
      C(172, 44, 8, s, 2.2),
      P(`M172 52 L124 58 L76 62`, s, w),
      P(`M76 62 L56 ${GY}`, s, w),
      P(`M76 62 L94 ${GY}`, s, w),
      P(`M76 62 L108 38 L124 50`, s, w - 0.6),
      F(56, GY, s),
      F(94, GY, s),
      F(124, 50, s)
    ].join('');
  }
  if (ph === 2) {
    return [
      C(168, 32, 8, s, 2.2),
      P(`M168 40 L122 46 L78 50`, s, w),
      P(`M78 50 L58 ${GY}`, s, w),
      P(`M78 50 L96 ${GY}`, s, w),
      P(`M78 50 L110 28 L128 40`, s, w - 0.6),
      F(58, GY, s),
      F(96, GY, s),
      F(128, 40, s)
    ].join('');
  }
  return oneLegBridge(s, 1);
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
