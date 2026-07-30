import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";

// ─── The Idea Bed — a dig site, not a drawer ───────────────────────────────────
// Field archaeology: a dirt canvas painted over buried "fossils" (trashed
// ideas), brushed away by dragging. Museum specimen labels, typewriter field
// data, real dirt. No cozy crayon here.

const INK = "#2b2318";
const PAPER = "#efe6d2";
const BORDER = "#c3b291";
const MUTED = "#8a7a5c";
const RUST = "#a4522c";

const DISPLAY_FONT = "'Sentient', Georgia, serif";
const LABEL_FONT = "'Comico', sans-serif";

interface Specimen {
  no: string;
  name: string;
  tagline: string;
  blurb: string;
  reason?: string;
  cause: string;
}

interface Stratum {
  label: string;
  span: string;
  dirt: string;
  specks: string;
  ideas: Specimen[];
}

const STRATA: Stratum[] = [
  {
    label: "Topsoil",
    span: "recent",
    dirt: "#a8946b",
    specks: "#8e7950",
    ideas: [
      {
        no: "FD-01",
        name: "Critically Endangered",
        tagline: "a zoo where the rarest thing in it is basically a lottery ticket",
        blurb: "Every animal capped at exactly how many are left in the wild. 30 polar bears left on Earth? Then exactly 30 people, ever, get to own one in-game. No restock, no \"come back next season.\" Real money goes to real conservation, so the rarer (read: more expensive) the animal, the more good it's actually doing.",
        reason: "Got as far as a Figma mockup before I killed it, because I already know myself, and I would commit several ethically grey acts to get a saber-toothed tiger into MY zoo.",
        cause: "TRASHED FOR MY OWN PROTECTION",
      },
      {
        no: "FD-02",
        name: "Sorted",
        tagline: "point, scan, get told where your trash actually belongs",
        blurb: "Scan a barcode, get told what's recyclable in your bin and where the rest needs to go. Built on the very reasonable idea that shame doesn't work on anyone standing alone in their kitchen at 11pm sorting yoghurt tubs.",
        reason: "Never left the napkin sketch stage, because other people already built this, better, first.",
        cause: "NOT SPECIAL",
      },
      {
        no: "FD-03",
        name: "Still Reachable",
        tagline: "a number that's always theirs, no matter what",
        blurb: "Upload a voice message from someone you've lost — touch with, or just lost — and get a number that's permanently theirs. Call it, hear them. Text it, it just sits there. No stranger eventually inheriting the number and going \"sorry, wrong number\" into the void where their voice used to live.",
        reason: "Currently sitting at \"idea in a doc,\" untouched.",
        cause: "UNTOUCHED, STILL POSSIBLE",
      },
      {
        no: "FD-04",
        name: "Sent Anyway",
        tagline: "say the thing. it just never lands",
        blurb: "Text your ex, or anyone gone, into an inbox that never reaches them. Same dumb little rush as hitting send, none of the aftermath. If it was bad enough, order the whole thread printed as a book, delivered with a single match, so the last thing you ever do with it is set it on fire.",
        reason: "Got a working prototype together. The instinct's dead right — grief wants an inbox, closure sometimes wants a bonfire, not a Notes app. But \"$34, ships in 5–7 business days, comes with complimentary matches\" turns something tender into a checkout page, and I couldn't say that out loud with a straight face in a pitch meeting.",
        cause: "TENDER TURNED INTO A CHECKOUT PAGE",
      },
      {
        no: "FD-05",
        name: "At Least Your Plants Answer",
        tagline: "a houseplant that texts you back. rudely",
        blurb: "Soil sensor, hooked to a chatbot that only communicates in plant grievances: \"kind of thirsty,\" \"you're doing too much,\" \"I am not a fern, Kevin, stop misting me.\" Prototyped it on my own windowsill, actually — it's a $40 Bluetooth moisture sensor cosplaying as a personality.",
        reason: "Eventually somebody notices the man behind the curtain.",
        cause: "THE CURTAIN SLIPS EVENTUALLY",
      },
    ],
  },
  {
    label: "Bedrock",
    span: "further down",
    dirt: "#8f7a52",
    specks: "#75613d",
    ideas: [
      {
        no: "FD-06",
        name: "The Alibi",
        tagline: "a believable excuse to leave, on a countdown",
        blurb: "Set a timer before any dinner, date, or work drinks you already regret agreeing to. At zero, it fires off a fake emergency text — one you wrote while sober, so future-you always has a getaway car.",
        reason: "Made it to a clickable prototype. An app whose entire personality is \"helps you lie to people you love\" is a hard pitch at the best of times, and an impossible one at the family dinner you're currently trying to escape. Also: turns out you can just schedule texts now.",
        cause: "TECH ALREADY DID THE CRIME",
      },
      {
        no: "FD-07",
        name: "Group Chat Court",
        tagline: "screenshots in. verdict out",
        blurb: "Submit your side of the dispute — who said they'd bring the speaker, who ghosted the group booking — and total strangers vote guilty or not guilty.",
        reason: "Stayed a thought experiment. Handing the internet a gavel and pointing it at your actual friendships is exactly as bad an idea as it sounds on paper, and we knew that going in. Also Reddit exists. For a reason.",
        cause: "REDDIT ALREADY EXISTS",
      },
      {
        no: "FD-08",
        name: "Paddle Pop Enterprise",
        tagline: "a multi-level conspiracy to corner the frozen stick market, aged 8",
        blurb: "Tried to hack the Paddle Pop prize system by cahoots-ing with a small ring of co-conspirators to artificially inflate demand — get enough kids buying, then swoop in and collect everyone's sticks once the hype had done its job.",
        reason: "Basically ran a demand-side cartel out of a primary school tuckshop.",
        cause: "NO REGRETS, MILD CONCERN",
      },
      {
        no: "FD-09",
        name: "Hollu the Horse and the Pumpkin Pea Patch",
        tagline: "my first published universe. circulation: one photocopier, tops",
        blurb: "A comic. Read way too much Captain Underpants, but was quietly into zines before zines were a thing anyone under 40 had heard of, so really I was just ahead of my time and nobody knew it yet.",
        reason: "Plot, characters, and overall coherence: none of your business.",
        cause: "AHEAD OF ITS TIME, ALLEGEDLY",
      },
      {
        no: "FD-10",
        name: "Actually Tasty",
        tagline: "turns out 4.5 stars just means it offended nobody",
        blurb: "Got sick of walking into 4.5+ star restaurants, cafes, and bakeries and having a genuinely bad time, then spiraling about what was wrong with me. Eventual realisation: taste is subjective, and a 5-star average usually just means the food is generic enough to never upset anyone. Congratulations to that muffin, it has no personality and neither does your rating system. The idea: 10 menu items, one per vendor, you actually try. You rate how you felt eating each one, and that builds your taste profile — not \"is this objectively good\" but \"will YOU, specifically, enjoy this.\" Then you follow people with matching taste buds, so you stop taking recommendations from people whose mouths clearly work differently to yours.",
        cause: "STILL COOKING",
      },
    ],
  },
];

const TOTAL_IDEAS = STRATA.reduce((n, s) => n + s.ideas.length, 0);

const SHAPES = [
  { w: 150, h: 120, r: "14% 5% 18% 7%/9% 16% 6% 19%" },
  { w: 118, h: 104, r: "38% 19% 33% 24%/23% 37% 20% 35%" },
  { w: 88, h: 84, r: "57% 41% 49% 53%/43% 62% 38% 57%" },
];
const BONE = ["#e9dfc7", "#efe6d2", "#e3d8bd", "#eae0c9"];
const DIRT = "#a8946b";
const SPECKS = "#8e7950";
const CELL = 18;

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface LaidOutSpecimen extends Specimen {
  i: number;
  x: number;
  y: number;
  w: number;
  h: number;
  r: string;
  tone: string;
  rot: number;
  icon: number;
}

// ─── Fossil imprints — what's actually etched into each rock ─────────────────
// Flat single-stroke line art, cycled across specimens. Not literal to the
// idea's content — just varied, so the bed doesn't read as one repeated shape.

const FOSSIL_ICONS = [
  // ammonite spiral
  <path d="M50 50 C50 38 40 34 32 40 C22 47 24 62 36 66 C50 70 62 58 58 44 C54 30 36 24 24 34 C10 46 14 68 32 76" />,
  // fish skeleton
  <>
    <path d="M12 50 Q50 34 88 50" />
    <path d="M20 50 L28 38 M28 50 L36 36 M36 50 L44 36 M44 50 L52 36 M52 50 L60 37 M60 50 L68 38" />
    <path d="M20 50 L28 62 M28 50 L36 64 M36 50 L44 64 M44 50 L52 64 M52 50 L60 63 M60 50 L68 62" />
    <path d="M88 50 L98 40 M88 50 L98 60 M88 50 L94 50" />
  </>,
  // skull / jaw
  <>
    <path d="M20 40 Q20 22 42 20 Q70 18 84 34 Q90 42 82 48 L78 46 Q76 56 64 58 L60 66 L54 58 L46 66 L42 58 Q28 56 24 46 Z" />
    <circle cx="36" cy="34" r="4" />
  </>,
  // three-toed footprint
  <>
    <path d="M50 30 C46 30 44 40 46 50 C48 60 44 68 50 70 C56 68 52 60 54 50 C56 40 54 30 50 30 Z" />
    <path d="M30 42 C26 42 25 50 28 58 C30 64 27 70 32 72 C37 70 34 64 36 58 C38 50 34 42 30 42 Z" />
    <path d="M70 42 C66 42 65 50 68 58 C70 64 67 70 72 72 C77 70 74 64 76 58 C78 50 74 42 70 42 Z" />
  </>,
  // dragonfly
  <>
    <ellipse cx="34" cy="34" rx="20" ry="9" transform="rotate(-25 34 34)" />
    <ellipse cx="66" cy="34" rx="20" ry="9" transform="rotate(25 66 34)" />
    <ellipse cx="34" cy="66" rx="18" ry="8" transform="rotate(20 34 66)" />
    <ellipse cx="66" cy="66" rx="18" ry="8" transform="rotate(-20 66 66)" />
    <path d="M50 22 L50 80" />
    <path d="M44 30 L56 30 M45 40 L55 40 M46 50 L54 50 M46 60 L54 60 M47 70 L53 70" />
  </>,
  // trilobite
  <>
    <path d="M50 18 C34 18 26 28 26 40 L26 62 C26 74 34 82 50 82 C66 82 74 74 74 62 L74 40 C74 28 66 18 50 18 Z" />
    <path d="M50 18 L50 82" />
    <path d="M30 32 L20 26 M30 44 L18 40 M30 56 L18 60 M30 68 L20 74 M70 32 L80 26 M70 44 L82 40 M70 56 L82 60 M70 68 L80 74" />
  </>,
  // fern frond
  <>
    <path d="M50 85 L50 18" />
    <path d="M50 26 L30 18 M50 26 L70 18 M50 36 L28 30 M50 36 L72 30 M50 46 L30 42 M50 46 L70 42 M50 56 L32 54 M50 56 L68 54 M50 66 L34 66 M50 66 L66 66" />
  </>,
];

export default function JunkDrawer() {
  const [started, setStarted] = useState(false);
  const [era, setEra] = useState(0);
  const [layout, setLayout] = useState<LaidOutSpecimen[]>([]);
  const [exposed, setExposed] = useState<number[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [dims, setDims] = useState({ w: 1200, h: 600 });
  const [found, setFound] = useState<Set<string>>(new Set());

  const digRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const cleared = useRef<Set<string>>(new Set());
  const painting = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  function buildLayout(eraIdx: number, w: number, h: number) {
    const ideas = STRATA[eraIdx].ideas;
    const rnd = prng((eraIdx + 3) * 7717);
    const cols = Math.max(2, Math.min(4, Math.floor(w / 280)));
    const rows = Math.ceil(ideas.length / cols);
    const cw = w / cols;
    const ch = h / rows;
    // Shapes were tuned for ~9 specimens in one bed — scale up when a stratum has fewer,
    // so a 4-5 idea layer doesn't look lost in all that empty dirt.
    const scale = Math.min(1.5, Math.sqrt(9 / ideas.length));
    const next: LaidOutSpecimen[] = ideas.map((sp, i) => {
      const base = SHAPES[i % SHAPES.length];
      const sw = Math.round(base.w * scale);
      const sh = Math.round(base.h * scale);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = Math.round(Math.max(16, Math.min(w - sw - 16, col * cw + (cw - sw) / 2 + (rnd() - 0.5) * cw * 0.3)));
      const y = Math.round(Math.max(14, Math.min(h - sh - 14, row * ch + (ch - sh) / 2 + (rnd() - 0.5) * ch * 0.3)));
      return { ...sp, i, x, y, w: sw, h: sh, r: base.r, tone: BONE[i % BONE.length], rot: (rnd() - 0.5) * 26, icon: i % FOSSIL_ICONS.length };
    });
    cleared.current = new Set();
    setLayout(next);
    setExposed([]);
    setTouched(false);
  }

  function paintDirt(eraIdx: number, w: number, h: number) {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const E = STRATA[eraIdx];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = E.dirt;
    ctx.fillRect(0, 0, w, h);
    const rnd = prng((eraIdx + 11) * 3301);
    for (let b = 0; b < 26; b++) {
      const y = rnd() * h;
      const hh = 6 + rnd() * 30;
      ctx.fillStyle = rnd() > 0.5 ? "rgba(255,248,228,.05)" : "rgba(50,40,26,.06)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 40) ctx.lineTo(x, y + Math.sin(x / 110) * 7 + (rnd() - 0.5) * 4);
      ctx.lineTo(w, y + hh);
      for (let x = w; x >= 0; x -= 40) ctx.lineTo(x, y + hh + Math.sin(x / 130) * 6);
      ctx.closePath();
      ctx.fill();
    }
    const n = Math.round((w * h) / 170);
    for (let i = 0; i < n; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const s = rnd();
      ctx.fillStyle = s > 0.62 ? "rgba(255,250,232,.3)" : s > 0.3 ? SPECKS : "rgba(46,36,22,.4)";
      const r = s > 0.94 ? 2.4 : 1.1;
      ctx.fillRect(x, y, r, r);
    }
    for (let i = 0; i < Math.round(w / 26); i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      ctx.strokeStyle = "rgba(46,36,22,.13)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rnd() - 0.5) * 40, y + (rnd() - 0.5) * 20);
      ctx.stroke();
    }
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(40,31,19,.3)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  const eraRef = useRef(0);
  useEffect(() => {
    eraRef.current = era;
  }, [era]);

  function measure(eraIdx: number, force = false) {
    const el = digRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.max(420, Math.round(r.width));
    const h = Math.max(320, Math.round(r.height));
    if (!force && w === dims.w && h === dims.h && layout.length) return;
    setDims({ w, h });
    buildLayout(eraIdx, w, h);
    paintDirt(eraIdx, w, h);
  }

  useEffect(() => {
    if (!started) return;
    measure(era, true);
    const onResize = () => measure(eraRef.current, true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  function brushAt(x: number, y: number) {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const r = 40;
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.55, "rgba(0,0,0,.95)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    const rr = r * 0.72;
    for (let cx = Math.floor((x - rr) / CELL); cx <= Math.floor((x + rr) / CELL); cx++)
      for (let cy = Math.floor((y - rr) / CELL); cy <= Math.floor((y + rr) / CELL); cy++)
        cleared.current.add(cx + "," + cy);
  }

  function checkExposure() {
    const ex: number[] = [];
    layout.forEach((sp) => {
      let tot = 0;
      let hit = 0;
      for (let x = sp.x + 8; x < sp.x + sp.w - 8; x += CELL)
        for (let y = sp.y + 8; y < sp.y + sp.h - 8; y += CELL) {
          tot++;
          if (cleared.current.has(Math.floor(x / CELL) + "," + Math.floor(y / CELL))) hit++;
        }
      if (tot && hit / tot >= 0.6) ex.push(sp.i);
    });
    setExposed((prev) => (ex.length !== prev.length ? ex : prev));
    if (ex.length) {
      setFound((prev) => {
        const next = new Set(prev);
        ex.forEach((i) => next.add(layout[i]?.no ?? eraRef.current + "-" + i));
        return next.size === prev.size ? prev : next;
      });
    }
  }

  function down(e: React.PointerEvent) {
    if (openId !== null) return;
    painting.current = true;
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    last.current = { x, y };
    brushAt(x, y);
    checkExposure();
    if (!touched) setTouched(true);
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const cv = canvasRef.current;
      if (!cv) return;
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      const b = brushRef.current;
      if (b) {
        b.style.transform = "translate(" + x + "px," + y + "px)";
        b.style.opacity = inside && openId === null && started ? "1" : "0";
      }
      if (!painting.current) return;
      const l = last.current || { x, y };
      const d = Math.hypot(x - l.x, y - l.y);
      const steps = Math.max(1, Math.ceil(d / 9));
      for (let s = 1; s <= steps; s++) brushAt(l.x + (x - l.x) * (s / steps), l.y + (y - l.y) * (s / steps));
      last.current = { x, y };
      checkExposure();
    }
    function onUp() {
      painting.current = false;
      last.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, started, layout]);

  function clearAll() {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, dims.w, dims.h);
    for (let cx = 0; cx <= Math.ceil(dims.w / CELL); cx++)
      for (let cy = 0; cy <= Math.ceil(dims.h / CELL); cy++) cleared.current.add(cx + "," + cy);
    setTouched(true);
    checkExposure();
  }

  const open = openId === null ? null : layout.find((s) => s.i === openId) || null;

  function nextSpecimen() {
    if (!exposed.length) return;
    const at = exposed.indexOf(openId ?? -1);
    setOpenId(exposed[(at + 1) % exposed.length]);
  }

  function goEra(delta: number) {
    const next = Math.max(0, Math.min(STRATA.length - 1, era + delta));
    if (next === era) return;
    setEra(next);
    setOpenId(null);
    measure(next, true);
  }

  return (
    <main style={{ background: PAPER }}>
      <style>{`
        @font-face { font-family: 'Sentient'; src: url('/fonts/sentient/Sentient-Variable.woff2') format('woff2'); font-weight: 200 700; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Sentient'; src: url('/fonts/sentient/Sentient-VariableItalic.woff2') format('woff2'); font-weight: 200 700; font-style: italic; font-display: swap; }
      `}</style>

      {!started ? (
        <div className="flex items-center justify-center px-6 py-24" style={{ minHeight: "calc(100vh - 57px)" }}>
          <div className="w-full max-w-2xl flex flex-col items-center text-center">
            <Link
              to="/"
              className="mb-10 text-xs hover:opacity-70 transition-opacity"
              style={{ fontFamily: LABEL_FONT, letterSpacing: "0.18em", color: MUTED, textTransform: "uppercase" }}
            >
              ← back to the surface
            </Link>
            <p style={{ fontFamily: LABEL_FONT, fontSize: 12, letterSpacing: "0.24em", color: MUTED }}>FIELD SEASON 1994 — 2026</p>
            <h1
              className="mt-5 text-5xl sm:text-6xl uppercase"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.03em", color: INK }}
            >
              The Idea Bed
            </h1>
            <p className="mt-4 max-w-md text-lg italic" style={{ fontFamily: DISPLAY_FONT, color: "#6b5c40" }}>
              Ten ideas I abandoned, buried where they fell. Nothing here is labelled. You'll have to brush it off yourself.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="mt-9 cursor-pointer"
              style={{
                border: `1px solid ${INK}`,
                background: INK,
                color: PAPER,
                padding: "13px 34px",
                fontFamily: LABEL_FONT,
                fontSize: 13,
                letterSpacing: "0.2em",
              }}
            >
              BEGIN THE DIG
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full" style={{ height: "calc(100vh - 57px)", overflow: "hidden" }}>
          {/* top bar */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-8"
            style={{ height: 70, background: PAPER, borderBottom: `1px solid ${BORDER}`, zIndex: 60 }}
          >
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="hover:opacity-70 transition-opacity"
                style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase" }}
              >
                ← surface
              </Link>
              <div className="flex flex-col gap-0.5">
                <span style={{ fontFamily: DISPLAY_FONT, fontSize: 19, letterSpacing: "0.1em", textTransform: "uppercase", color: INK }}>
                  The Idea Bed
                </span>
                <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.1em", color: MUTED }}>
                  SITE SURVEY · IDEAS NOT PURSUED
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end gap-0.5">
                <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: MUTED }}>STRATUM</span>
                <span style={{ fontFamily: DISPLAY_FONT, fontSize: 16, letterSpacing: "0.04em", color: INK }}>
                  {STRATA[era].label}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: MUTED }}>RECOVERED</span>
                <span style={{ fontFamily: LABEL_FONT, fontSize: 16, color: INK }}>
                  {found.size} / {TOTAL_IDEAS}
                </span>
              </div>
            </div>
          </div>

          {/* dig area */}
          <div ref={digRef} className="absolute left-0 right-0" style={{ top: 70, bottom: 60, overflow: "hidden" }}>
            <div
              className="absolute inset-0"
              style={{
                background: DIRT,
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, rgba(255,250,232,.16), transparent 55%), repeating-linear-gradient(2deg, rgba(46,36,22,.05) 0 2px, transparent 2px 9px)",
                boxShadow: "inset 0 0 120px rgba(40,31,19,.35)",
                zIndex: 1,
              }}
            />

            {layout.map((sp) => (
              <div
                key={sp.i}
                style={{
                  position: "absolute",
                  left: sp.x,
                  top: sp.y,
                  width: sp.w,
                  height: sp.h,
                  zIndex: 5,
                  transform: `rotate(${sp.rot}deg)`,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    borderRadius: sp.r,
                    backgroundColor: sp.tone,
                  }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="rgba(75,60,38,.62)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: "72%",
                      height: "72%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {FOSSIL_ICONS[sp.icon]}
                  </svg>
                </div>
              </div>
            ))}

            <canvas
              ref={canvasRef}
              onPointerDown={down}
              onDoubleClick={clearAll}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 20, cursor: "none", touchAction: "none" }}
            />

            {openId === null &&
              exposed.map((i) => {
                const sp = layout.find((s) => s.i === i);
                if (!sp) return null;
                return (
                  <div
                    key={i}
                    onClick={() => setOpenId(i)}
                    style={{
                      position: "absolute",
                      left: sp.x,
                      top: sp.y,
                      width: sp.w,
                      height: sp.h + 30,
                      zIndex: 30,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 0,
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        background: INK,
                        color: PAPER,
                        padding: "3px 10px 4px",
                        fontFamily: LABEL_FONT,
                        fontSize: 11,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      {sp.name}
                    </div>
                  </div>
                );
              })}

            <div
              ref={brushRef}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 78,
                height: 78,
                margin: "-39px 0 0 -39px",
                zIndex: 50,
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity .18s",
              }}
            >
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(43,35,24,.28)" }} />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 9,
                  height: 9,
                  margin: "-4.5px 0 0 -4.5px",
                  borderRadius: "50%",
                  background: "rgba(43,35,24,.5)",
                }}
              />
            </div>

            {!touched && (
              <div className="absolute left-0 right-0 text-center pointer-events-none" style={{ bottom: 26, zIndex: 45 }}>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: LABEL_FONT,
                    fontSize: 13,
                    letterSpacing: "0.14em",
                    color: "rgba(239,230,210,.82)",
                    background: "rgba(43,35,24,.34)",
                    padding: "7px 16px",
                  }}
                >
                  DRAG TO BRUSH THE DIRT AWAY · DOUBLE-CLICK TO CLEAR THE PATCH
                </span>
              </div>
            )}
          </div>

          {/* bottom bar */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8"
            style={{ height: 60, background: PAPER, borderTop: `1px solid ${BORDER}`, zIndex: 60 }}
          >
            <span style={{ fontFamily: LABEL_FONT, fontSize: 13, letterSpacing: "0.08em", color: MUTED }}>
              {exposed.length ? "click an exposed specimen to read it" : "brush the dirt · specimens are buried at random"}
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => goEra(-1)}
                disabled={era === 0}
                className="cursor-pointer disabled:cursor-default"
                style={{
                  border: `1px solid ${era > 0 ? INK : BORDER}`,
                  background: "transparent",
                  color: era > 0 ? INK : BORDER,
                  padding: "9px 18px",
                  fontFamily: LABEL_FONT,
                  fontSize: 12,
                  letterSpacing: "0.16em",
                }}
              >
                ↑ SHALLOWER
              </button>
              <button
                onClick={() => goEra(1)}
                disabled={era === STRATA.length - 1}
                className="cursor-pointer disabled:cursor-default"
                style={{
                  border: `1px solid ${era < STRATA.length - 1 ? INK : BORDER}`,
                  background: era < STRATA.length - 1 ? INK : "transparent",
                  color: era < STRATA.length - 1 ? PAPER : BORDER,
                  padding: "9px 18px",
                  fontFamily: LABEL_FONT,
                  fontSize: 12,
                  letterSpacing: "0.16em",
                }}
              >
                DIG DEEPER ↓
              </button>
            </div>
          </div>

          {/* detail card */}
          {open && (
            <div className="absolute inset-0 flex items-center justify-center p-6" style={{ zIndex: 200 }}>
              <div className="absolute inset-0" style={{ background: "rgba(43,35,24,.5)" }} onClick={() => setOpenId(null)} />
              <div
                className="relative overflow-auto"
                style={{
                  width: "min(620px, 94%)",
                  maxHeight: "100%",
                  background: "#f4ecda",
                  border: `1px solid ${INK}`,
                  outline: `5px solid #f4ecda`,
                  boxShadow: "0 26px 60px rgba(43,35,24,.45)",
                  padding: "34px 38px 30px",
                }}
              >
                <div
                  onClick={() => setOpenId(null)}
                  className="absolute cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ top: 16, right: 20, fontFamily: LABEL_FONT, fontSize: 12, letterSpacing: "0.12em", color: MUTED }}
                >
                  RE-BURY ✕
                </div>
                <div style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.2em", color: MUTED }}>SPECIMEN {open.no}</div>
                <div className="mt-3" style={{ fontFamily: DISPLAY_FONT, fontSize: 40, lineHeight: 1.06, color: INK }}>
                  {open.name}
                </div>
                <div className="mt-2 italic" style={{ fontFamily: DISPLAY_FONT, fontSize: 19, color: "#6b5c40" }}>
                  {open.tagline}
                </div>
                <div className="mt-5" style={{ height: 1, background: BORDER }} />
                <div className="mt-5" style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: MUTED }}>
                  CONDITION — crumpled, legible
                </div>
                <div
                  className="mt-6 flex items-center justify-center"
                  style={{
                    height: 160,
                    border: `1px solid ${BORDER}`,
                    background: "repeating-linear-gradient(45deg, #ece2cc 0 8px, #e4d8bd 8px 16px)",
                    fontFamily: LABEL_FONT,
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    color: MUTED,
                  }}
                >
                  PLATE — DROP ILLUSTRATION HERE
                </div>
                <div className="mt-5" style={{ fontFamily: DISPLAY_FONT, fontSize: 20, lineHeight: 1.5, color: "#3a3122" }}>
                  {open.blurb}
                </div>
                {open.reason && (
                  <div className="mt-4" style={{ fontFamily: DISPLAY_FONT, fontSize: 18, lineHeight: 1.5, color: "#6b5c40" }}>
                    {open.reason}
                  </div>
                )}
                <div
                  className="mt-6 pt-4 flex items-center justify-between gap-4"
                  style={{ borderTop: `1px solid ${BORDER}` }}
                >
                  <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: RUST }}>
                    CAUSE OF EXTINCTION — {open.cause}
                  </span>
                  {exposed.length > 1 && (
                    <span
                      onClick={nextSpecimen}
                      className="cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: LABEL_FONT, fontSize: 12, letterSpacing: "0.12em", color: INK }}
                    >
                      NEXT SPECIMEN →
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
