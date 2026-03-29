/**
 * gen-exercise-pictures.mjs
 * Generuje SVG ilustrace fází cviků — styl vyplněné siluety (silné zaoblené linie).
 * Každá fáze = tmavá karta s popiskem.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EX_ROOT = path.join(__dirname, '..', 'pictures', 'exercises');

const COL = { e: '#5b9fd4', m: '#c5e86d', h: '#e8943a', x: '#ff5c5c' };
const TIERS = ['e', 'm', 'h', 'x'];
const CW = 300, CH = 220;
const PHASE_LABELS = ['VÝCHOZÍ', 'PRŮBĚH', 'ZÁVĚR'];
const GY = 170; // ground y (feet touch here in standing poses)
const FIG = '#1c2240'; // dark navy silhouette colour (all tiers)
const BG  = '#edf0f8'; // light background

// ── SVG primitives ────────────────────────────────────────────────
const lm = (x1,y1,x2,y2,c,w) =>
  `<line x1="${Math.round(x1)}" y1="${Math.round(y1)}" x2="${Math.round(x2)}" y2="${Math.round(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ci = (cx,cy,r,c) =>
  `<circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="${r}" fill="${c}"/>`;
const pa = (d,c,op) =>
  `<path d="${d}" fill="${c}"${op?' opacity="'+op+'"':''}/>`;
const tx = (x,y,content,fill,size,weight,anchor,ls) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor||'middle'}" fill="${fill}" font-family="'Segoe UI',system-ui,sans-serif" font-size="${size}" font-weight="${weight||'400'}"${ls?` letter-spacing="${ls}"`:''}>${content}</text>`;

// ── Limb widths ───────────────────────────────────────────────────
const LW = { torso:18, hip:20, ul:16, ll:13, ua:13, fa:11, ft:9 };

// ── Ponytail ──────────────────────────────────────────────────────
function hair(hx,hy,hr,right,c) {
  // Profile ponytail going to the back of head
  const d = right ? -1 : 1; // direction of "back"
  const bx = hx + d*(hr+1), by = hy - 4;
  return pa(
    `M${bx} ${by} C${bx+d*6} ${by-14} ${bx+d*14} ${by-6} ${bx+d*10} ${by+10} ` +
    `C${bx+d*6} ${by+8} ${bx+d*1} ${by+4} ${bx} ${by}Z`,
    c
  );
}

// ── Foot ──────────────────────────────────────────────────────────
function ft(x,y,right,c,w=LW.ft) {
  const d = right ? 1 : -1;
  return lm(x-d*3, y+1, x+d*14, y+1, c, w);
}

// ── Card wrapper ──────────────────────────────────────────────────
// accent = tier color; used for bottom strip + label text
function card(inner, accent, ph, slug) {
  const label = PHASE_LABELS[ph-1];
  const sub   = phaseNote(slug, ph);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW} ${CH}" fill="none" aria-hidden="true">
<rect width="${CW}" height="${CH}" fill="${BG}"/>
<rect x="0" y="${CH-44}" width="${CW}" height="44" fill="${accent}" opacity="0.08"/>
<line x1="0" y1="${CH-44}" x2="${CW}" y2="${CH-44}" stroke="${accent}" stroke-width="1.5" opacity="0.3"/>
${inner}
${tx(CW/2, CH-24, label, accent, '13', '700', 'middle', '0.1em')}
${tx(CW/2, CH-9, sub, '#8090b0', '8.5', '400', 'middle')}
</svg>`;
}

function phaseNote(slug, ph) {
  if (ph === 1) return 'výchozí poloha';
  if (ph === 2) {
    if (/kliky/.test(slug))  return 'klidné tempo · dívej se dolů';
    if (/drep|squat/.test(slug)) return 'kolena nad špičkami · záda rovná';
    if (/lunge|revlung/.test(slug)) return 'přední koleno nad kotníkem';
    if (/bridge|onebridge/.test(slug)) return 'stlač hýždě · pauza nahoře';
    if (/plank|elplank/.test(slug)) return 'zpevni střed · záda rovná';
    if (/march|knee/.test(slug)) return 'koleno do výšky · rytmus';
    if (/jack/.test(slug)) return 'plynulý pohyb · bez výskoku';
    if (/fold/.test(slug)) return 'výdech · jemné protažení';
    if (/cat/.test(slug)) return 'výdech · zakulaťte záda';
    if (/super|bird/.test(slug)) return 'zpevni střed · pomalu';
    if (/side/.test(slug)) return 'boky nahoru · tělo rovné';
    if (/wall/.test(slug)) return 'stehna rovnoběžná · záda na zdi';
    if (/calf/.test(slug)) return 'plný výpon · pauza nahoře';
    if (/bfly/.test(slug)) return 'jemný tlak kolen dolů';
    if (/twist/.test(slug)) return 'otočení z hrudníku';
    if (/pigeon/.test(slug)) return 'hluboký výdech do protažení';
    return 'kontrolovaně';
  }
  if (/kliky|plank/.test(slug)) return 'výdech · zpevni střed';
  if (/cat/.test(slug)) return 'nádech · prohnutí';
  return 'kontrolovaný návrat';
}

// ── Main figure draw ──────────────────────────────────────────────
/**
 * drawFig – nakreslí siluetu z kloubů.
 * j: objekt s klouby (každý [x,y] nebo null)
 *   hd  head center
 *   sh  shoulder
 *   hp  hip
 *   kf  front/near knee    af  front ankle
 *   kb  back/far knee      ab  back ankle
 *   ef  front elbow        wf  front wrist
 *   eb  back elbow         wb  back wrist
 *   right: bool (facing right, default true)
 *   noFoot: bool (skip foot lines, for horizontal poses)
 */
function drawFig(j, c) {
  const p = [];
  const R = j.right !== false;
  const hr = 13;

  // back arm (behind everything)
  if (j.eb) {
    p.push(lm(j.sh[0],j.sh[1], j.eb[0],j.eb[1], c, LW.ua-2));
    if (j.wb) p.push(lm(j.eb[0],j.eb[1], j.wb[0],j.wb[1], c, LW.fa-2));
  }
  // back leg
  if (j.kb) {
    p.push(lm(j.hp[0],j.hp[1], j.kb[0],j.kb[1], c, LW.ul-2));
    if (j.ab) {
      p.push(lm(j.kb[0],j.kb[1], j.ab[0],j.ab[1], c, LW.ll-2));
      if (!j.noFoot) p.push(ft(j.ab[0],j.ab[1],R,c,LW.ft-1));
    }
  }
  // torso (hip-shoulder)
  p.push(lm(j.sh[0],j.sh[1], j.hp[0],j.hp[1], c, LW.torso));
  // front leg
  if (j.kf) {
    p.push(lm(j.hp[0],j.hp[1], j.kf[0],j.kf[1], c, LW.ul));
    if (j.af) {
      p.push(lm(j.kf[0],j.kf[1], j.af[0],j.af[1], c, LW.ll));
      if (!j.noFoot) p.push(ft(j.af[0],j.af[1],R,c));
    }
  }
  // front arm
  if (j.ef) {
    p.push(lm(j.sh[0],j.sh[1], j.ef[0],j.ef[1], c, LW.ua));
    if (j.wf) p.push(lm(j.ef[0],j.ef[1], j.wf[0],j.wf[1], c, LW.fa));
  }
  // head & hair
  p.push(hair(j.hd[0],j.hd[1],hr,R,c));
  p.push(ci(j.hd[0],j.hd[1],hr,c));

  return p.join('');
}

// ── Pose helpers ──────────────────────────────────────────────────

// Standing, profile (facing right), center x = cx
function pStand(cx=148) {
  return {
    hd:[cx,22], sh:[cx,52], hp:[cx,102],
    kf:[cx+5,140], af:[cx+6,GY],
    kb:[cx-5,138], ab:[cx-6,GY],
    ef:[cx+14,80], wf:[cx+16,108],
    eb:[cx-12,78], wb:[cx-14,106]
  };
}

// Squat deep (profile)
function pSquatDeep(cx=148) {
  return {
    hd:[cx-6,46], sh:[cx-8,74], hp:[cx,132],
    kf:[cx+30,144], af:[cx+12,GY],
    kb:[cx-28,140], ab:[cx-10,GY],
    ef:[cx+36,110], wf:[cx+52,114],
    eb:[cx-34,108], wb:[cx-50,112]
  };
}

// Squat mid (profile)
function pSquatMid(cx=148) {
  return {
    hd:[cx-2,34], sh:[cx-3,62], hp:[cx,116],
    kf:[cx+18,148], af:[cx+9,GY],
    kb:[cx-16,146], ab:[cx-8,GY],
    ef:[cx+20,90], wf:[cx+30,114],
    eb:[cx-18,88], wb:[cx-28,112]
  };
}

// Lunge forward deep (profile)
function pLungeFwd(cx=150) {
  return {
    hd:[cx,24], sh:[cx-2,54], hp:[cx-8,102],
    kf:[cx+44,124], af:[cx+20,GY],
    kb:[cx-46,148], ab:[cx-62,GY],
    ef:[cx+10,82], wf:[cx+14,110],
    eb:[cx-10,80], wb:[cx-14,108]
  };
}

// Lunge step light (phase 1/3 lunge)
function pLungeLight(cx=150) {
  return {
    hd:[cx,22], sh:[cx,54], hp:[cx-2,102],
    kf:[cx+20,142], af:[cx+10,GY],
    kb:[cx-22,138], ab:[cx-24,GY],
    ef:[cx+12,82], wf:[cx+14,110],
    eb:[cx-10,80], wb:[cx-12,108]
  };
}

// Reverse lunge deep (profile, facing right, step back)
function pRevLunge(cx=150) {
  return {
    hd:[cx,24], sh:[cx+2,54], hp:[cx+6,102],
    kf:[cx-16,128], af:[cx-2,GY],
    kb:[cx+48,148], ab:[cx+62,GY],
    ef:[cx-10,82], wf:[cx-14,110],
    eb:[cx+10,80], wb:[cx+14,108]
  };
}

// March (one knee up)
function pMarchKneeUp(cx=148) {
  return {
    hd:[cx,22], sh:[cx,52], hp:[cx,102],
    kf:[cx+6,80], af:[cx+8,104],    // front leg UP
    kb:[cx-4,140], ab:[cx-4,GY],    // back leg on ground
    ef:[cx-12,76], wf:[cx-14,56],   // arms swing
    eb:[cx+14,80], wb:[cx+16,108]
  };
}

// High knee other side
function pMarchKneeUp2(cx=148) {
  return {
    hd:[cx,22], sh:[cx,52], hp:[cx,102],
    kf:[cx+4,140], af:[cx+4,GY],
    kb:[cx-6,80], ab:[cx-8,104],   // back leg UP
    ef:[cx+12,76], wf:[cx+14,56],
    eb:[cx-14,80], wb:[cx-16,108]
  };
}

// Jumping jack CLOSED (≈ standing)
function pJackClose(cx=148) { return pStand(cx); }

// Jumping jack OPEN – front view (symmetric)
function pJackOpen(cx=150) {
  return {
    hd:[cx,22], sh:[cx,52], hp:[cx,102],
    kf:[cx+26,144], af:[cx+30,GY],   // legs apart
    kb:[cx-26,142], ab:[cx-30,GY],
    ef:[cx+28,30], wf:[cx+34,12],    // arms UP
    eb:[cx-28,30], wb:[cx-34,12],
    right: true
  };
}

// Side step – step to right
function pSideStep(cx=158) {
  return {
    hd:[cx,22], sh:[cx,52], hp:[cx,102],
    kf:[cx+22,142], af:[cx+28,GY],
    kb:[cx-4,140], ab:[cx-4,GY],
    ef:[cx+10,82], wf:[cx+12,110],
    eb:[cx-8,80], wb:[cx-10,108]
  };
}

// ── HORIZONTAL / FLOOR POSES ──────────────────────────────────────
// For these the body axis is roughly horizontal.
// Coordinates are still in card space (300×212).

// High plank, facing left (head right, feet left)
function pPlankHigh() {
  return {
    hd:[244,50], sh:[222,64], hp:[150,80],
    kf:[116,94], af:[78,106],
    kb:[112,98], ab:[74,110],
    ef:[222,90], wf:[220,108],   // arms straight down
    eb:[224,94], wb:[222,112],
    right:false, noFoot:true
  };
}
// Push-up LOW (elbows bent, body lower)
function pPlankLow() {
  return {
    hd:[240,60], sh:[216,80], hp:[150,84],
    kf:[116,96], af:[78,106],
    kb:[112,100], ab:[74,110],
    ef:[198,90], wf:[186,108],   // elbows bent
    eb:[200,94], wb:[188,112],
    right:false, noFoot:true
  };
}
// Knee plank (easier variant – tier e)
function pKneePlank() {
  return {
    hd:[232,50], sh:[212,64], hp:[156,76],
    kf:[136,80], af:null,   // knees on ground, no ankle/foot shown
    kb:[132,84], ab:null,
    ef:[212,90], wf:[210,108],
    eb:[214,94], wb:[212,112],
    right:false, noFoot:true
  };
}
// Elbow plank
function pElbowPlank() {
  return {
    hd:[244,50], sh:[222,64], hp:[150,80],
    kf:[116,94], af:[78,106],
    kb:[112,98], ab:[74,110],
    ef:[204,92], wf:[190,102],   // forearm on ground
    eb:[206,96], wb:[192,106],
    right:false, noFoot:true
  };
}

// Glute bridge FLAT (lying on back, head left, feet right)
function pBridgeFlat() {
  return {
    hd:[34,86], sh:[58,90], hp:[128,86],
    kf:[164,92], af:[192,92],
    kb:[162,96], ab:[190,96],
    ef:[58,76], wf:[80,70],
    eb:[60,80], wb:[82,74],
    right:true, noFoot:true
  };
}
// Glute bridge UP
function pBridgeUp() {
  return {
    hd:[34,90], sh:[60,96], hp:[126,52],  // hip raised!
    kf:[162,88], af:[190,94],
    kb:[160,92], ab:[188,98],
    ef:[62,84], wf:[84,78],
    eb:[64,88], wb:[86,82],
    right:true, noFoot:true
  };
}
// Single leg bridge UP
function pBridgeOneLeg() {
  return {
    hd:[34,90], sh:[60,96], hp:[124,52],
    kf:[160,88], af:[188,94],   // support leg
    kb:[136,30], ab:[158,16],   // lifted leg extended up
    ef:[62,84], wf:[84,78],
    eb:[64,88], wb:[86,82],
    right:true, noFoot:true
  };
}

// Superman DOWN (lying face down, head right, arms up-front)
function pSupermanDown() {
  return {
    hd:[232,80], sh:[208,86], hp:[130,84],
    kf:[90,90], af:[54,96],
    kb:[88,94], ab:[52,100],
    ef:[230,72], wf:[250,62],   // arms along floor
    eb:[232,76], wb:[252,66],
    right:false, noFoot:true
  };
}
// Superman UP
function pSupermanUp() {
  return {
    hd:[234,74], sh:[208,82], hp:[130,84],
    kf:[90,80], af:[54,74],  // legs raised
    kb:[88,84], ab:[52,78],
    ef:[232,64], wf:[252,52], // arms raised
    eb:[234,68], wb:[254,56],
    right:false, noFoot:true
  };
}

// Four-point kneeling (cat/cow/bird start), facing left
function pFourPoint() {
  return {
    hd:[226,70], sh:[202,84], hp:[122,80],
    kf:[84,96], af:null,
    kb:[80,100], ab:null,
    ef:[202,110], wf:[202,130],
    eb:[204,114], wb:[204,134],
    right:false, noFoot:true
  };
}
// Cat (back arched up)
function pCat() {
  return {
    hd:[224,84], sh:[200,100], hp:[120,88],  // spine curves UP
    kf:[82,100], af:null,
    kb:[78,104], ab:null,
    ef:[200,118], wf:[200,138],
    eb:[202,122], wb:[202,142],
    right:false, noFoot:true
  };
}
// Cow (back dips down)
function pCow() {
  return {
    hd:[228,66], sh:[202,80], hp:[122,94],  // spine curves DOWN
    kf:[84,98], af:null,
    kb:[80,102], ab:null,
    ef:[202,106], wf:[202,126],
    eb:[204,110], wb:[204,130],
    right:false, noFoot:true
  };
}
// Bird-dog (opposite arm+leg extended)
function pBirdDog() {
  return {
    hd:[224,72], sh:[200,86], hp:[120,82],
    kf:[82,96], af:null,   // support knee
    kb:[158,58], ab:[186,42],  // lifted back leg
    ef:[174,60], wf:[154,46],  // lifted front arm
    eb:[200,108], wb:[200,128],  // support arm
    right:false, noFoot:true
  };
}

// Side plank (on forearm, facing left)
function pSidePlank() {
  return {
    hd:[232,48], sh:[208,66], hp:[132,98],
    kf:[96,114], af:[60,128],
    kb:[92,106], ab:[56,120],
    ef:[210,86], wf:[208,108],  // top arm roughly vertical
    eb:[178,88], wb:[162,100],  // bottom arm to ground
    right:false, noFoot:true
  };
}

// ── SEATED POSES ──────────────────────────────────────────────────
// Seated figure: butt on ground, legs in front/to sides

// Seated upright
function pSeated(cx=148) {
  return {
    hd:[cx,50], sh:[cx,80], hp:[cx,122],
    kf:[cx+14,150], af:[cx+30,160],
    kb:[cx-14,148], ab:[cx-30,158],
    ef:[cx+6,100], wf:[cx+8,122],
    eb:[cx-6,100], wb:[cx-8,122],
    noFoot:true
  };
}
// Butterfly (knees out, feet in)
function pButterfly(cx=148) {
  return {
    hd:[cx,50], sh:[cx,82], hp:[cx,122],
    kf:[cx+44,142], af:[cx+24,152],
    kb:[cx-44,140], ab:[cx-24,150],
    ef:[cx+6,102], wf:[cx+8,122],
    eb:[cx-6,102], wb:[cx-8,122],
    noFoot:true
  };
}
// Seated twist (rotate to one side)
function pSeatedTwist(cx=148) {
  return {
    hd:[cx+8,50], sh:[cx+4,82], hp:[cx,122],
    kf:[cx+14,150], af:[cx+30,160],
    kb:[cx-14,148], ab:[cx-30,158],
    ef:[cx-14,86], wf:[cx-28,100],
    eb:[cx+18,86], wb:[cx+30,100],
    noFoot:true
  };
}
// Forward fold standing
function pFoldStand(cx=148) {
  return {
    hd:[cx+12,116], sh:[cx+6,94], hp:[cx,68],  // body bent down
    kf:[cx+6,140], af:[cx+8,GY],
    kb:[cx-4,138], ab:[cx-6,GY],
    ef:[cx+12,116], wf:[cx+14,136],
    eb:[cx+2,116], wb:[cx+4,136]
  };
}
// Pigeon pose (seated, one leg bent, one extended)
function pPigeon(cx=148) {
  return {
    hd:[cx,50], sh:[cx-4,82], hp:[cx,118],
    kf:[cx+56,128], af:[cx+26,138],
    kb:[cx-28,122], ab:[cx-60,126],
    ef:[cx+4,100], wf:[cx+6,122],
    eb:[cx-4,100], wb:[cx-6,122],
    noFoot:true
  };
}
// Wall sit (facing right, thighs horizontal, calves vertical)
function pWallSit(cx=148) {
  return {
    hd:[cx,22], sh:[cx,52], hp:[cx,102],
    kf:[cx+54,102], af:[cx+54,GY],
    kb:[cx-54,102], ab:[cx-54,GY],
    ef:[cx+6,80], wf:[cx+8,108],
    eb:[cx-6,80], wb:[cx-8,108]
  };
}
// Calf raise (on tiptoe)
function pTiptoe(cx=148) {
  return {
    hd:[cx,16], sh:[cx,46], hp:[cx,96],
    kf:[cx+4,132], af:[cx+6,GY-18],   // on toes!
    kb:[cx-4,130], ab:[cx-6,GY-16],
    ef:[cx+10,74], wf:[cx+12,100],
    eb:[cx-8,72], wb:[cx-10,100]
  };
}

// ── SLUG → POSE MAPPING ───────────────────────────────────────────
function poseFor(slug, ph, tier) {
  switch(slug) {

    case 'e-ct-kliky':
      if (tier === 'e') {
        if (ph === 1) return pKneePlank();
        if (ph === 2) return pPlankLow();
        return pKneePlank();
      }
      if (ph === 1) return pPlankHigh();
      if (ph === 2) return pPlankLow();
      return pPlankHigh();

    case 'e-ct-drep':
    case 'e-ka-squat':
    case 'e-le-squat':
      if (ph === 1) return pStand();
      if (ph === 2) return pSquatDeep();
      return pSquatMid();

    case 'e-ct-bridge':
    case 'e-co-bridge2':
      if (ph === 1) return pBridgeFlat();
      if (ph === 2) return pBridgeUp();
      return pBridgeFlat();

    case 'e-ct-lunge':
      if (ph === 1) return pStand();
      if (ph === 2) return pLungeFwd();
      return pLungeLight();

    case 'e-ct-plank':
      return pPlankHigh();

    case 'e-co-elplank':
      return pElbowPlank();

    case 'e-ka-march':
      if (ph === 1) return pStand();
      if (ph === 2) return pMarchKneeUp();
      return { ...pMarchKneeUp(), hd:[148,22] };  // slight variation

    case 'e-ka-jack':
      if (ph === 1) return pJackClose();
      if (ph === 2) return pJackOpen();
      return pJackClose();

    case 'e-ka-knee':
      if (ph === 1) return pStand();
      if (ph === 2) return pMarchKneeUp();
      return pMarchKneeUp2();

    case 'e-ka-side':
      if (ph === 1) return pStand();
      if (ph === 2) return pSideStep();
      return pStand(162);

    case 'e-mo-fold':
      if (ph === 1) return pStand();
      if (ph === 2) return pFoldStand();
      return pFoldStand();

    case 'e-mo-bfly':
      if (ph === 1) return pSeated();
      if (ph === 2) return pButterfly();
      return pButterfly();

    case 'e-mo-cat':
      if (ph === 1) return pFourPoint();
      if (ph === 2) return pCat();
      return pCow();

    case 'e-mo-twist':
      if (ph === 1) return pSeated();
      if (ph === 2) return pSeatedTwist();
      return { ...pSeatedTwist(), hd:[138,50] };  // mirror twist

    case 'e-mo-pigeon':
      if (ph === 1) return pFourPoint();
      if (ph === 2) return pPigeon();
      return pPigeon();

    case 'e-co-super':
      if (ph === 1) return pSupermanDown();
      if (ph === 2) return pSupermanUp();
      return pSupermanDown();

    case 'e-co-bird':
      if (ph === 1) return pFourPoint();
      if (ph === 2) return pBirdDog();
      return pFourPoint();

    case 'e-co-side':
      return pSidePlank();

    case 'e-le-revlung':
      if (ph === 1) return pStand();
      if (ph === 2) return pRevLunge();
      return pLungeLight();

    case 'e-le-onebridge':
      if (ph === 1) return pBridgeFlat();
      if (ph === 2) return pBridgeOneLeg();
      return pBridgeFlat();

    case 'e-le-wall':
      return pWallSit();

    case 'e-le-calf':
      if (ph === 1) return pStand();
      if (ph === 2) return pTiptoe();
      return pStand();

    default:
      return pStand();
  }
}

// ── Build SVG ─────────────────────────────────────────────────────
// Figure always uses dark FIG colour; accent used for card decoration only.
function bySlug(slug, _accentUnused, ph, tier) {
  const j = poseFor(slug, ph, tier);
  return drawFig(j, FIG);
}

// ── Write files ───────────────────────────────────────────────────
const SLUGS = [
  'e-ct-kliky','e-ct-drep','e-ct-bridge','e-ct-lunge','e-ct-plank',
  'e-ka-march','e-ka-jack','e-ka-knee','e-ka-side','e-ka-squat',
  'e-mo-fold','e-mo-bfly','e-mo-cat','e-mo-twist','e-mo-pigeon',
  'e-co-elplank','e-co-super','e-co-bird','e-co-side','e-co-bridge2',
  'e-le-squat','e-le-revlung','e-le-onebridge','e-le-wall','e-le-calf'
];

function writeAll() {
  for (const slug of SLUGS) {
    for (const tier of TIERS) {
      const color = COL[tier];
      const dir = path.join(EX_ROOT, slug, tier);
      fs.mkdirSync(dir, { recursive: true });
      for (let ph = 1; ph <= 3; ph++) {
        const inner = bySlug(slug, color, ph, tier);
        const svg = card(inner, color, ph, slug);
        fs.writeFileSync(path.join(dir, `phase-${ph}.svg`), svg, 'utf8');
      }
    }
    // Copy tier 'm' as default root files
    const mDir = path.join(EX_ROOT, slug, 'm');
    for (let ph = 1; ph <= 3; ph++) {
      const src = fs.readFileSync(path.join(mDir, `phase-${ph}.svg`), 'utf8');
      fs.writeFileSync(path.join(EX_ROOT, slug, `phase-${ph}.svg`), src, 'utf8');
    }
  }
  console.log(`OK: ${SLUGS.length} cviků × ${TIERS.length} tiers × 3 fáze`);
}

writeAll();
