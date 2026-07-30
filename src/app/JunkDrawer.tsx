import { Link } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchSpecimens, type SpecimenRow } from "../lib/specimens";

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
  year: number;
  tagline: string;
  blurb: string;
  reason?: string;
  cause: string;
  imageUrl?: string;
  confidential?: boolean;
}

interface Stratum {
  label: string;
  span: string;
  dirt: string;
  specks: string;
  ideas: Specimen[];
}

// Strata are derived from the fetched specimen list — sorted by year
// descending, chunked to <=5 per layer, deepest = oldest. Add a specimen
// with a year (via the editor) and it slots into the right depth on its own.

function rowToSpecimen(row: SpecimenRow): Specimen {
  return {
    no: row.no,
    name: row.name,
    year: row.year,
    tagline: row.tagline,
    blurb: row.blurb,
    reason: row.reason ?? undefined,
    cause: row.cause,
    imageUrl: row.image_url ?? undefined,
    confidential: row.confidential,
  };
}

const MAX_PER_LAYER = 5;
// Named/toned from shallow to deep — reused/clamped if there end up being more layers than names.
const STRATUM_LOOKS = [
  { label: "Topsoil", dirt: "#a8946b", specks: "#8e7950" },
  { label: "Subsoil", dirt: "#977f56", specks: "#7c6841" },
  { label: "Deep Bed", dirt: "#8f7a52", specks: "#75613d" },
  { label: "Bedrock", dirt: "#75603c", specks: "#5c4a2c" },
];

function buildStrata(ideas: Specimen[]): Stratum[] {
  const sorted = [...ideas].sort((a, b) => b.year - a.year);
  const numLayers = Math.max(1, Math.ceil(sorted.length / MAX_PER_LAYER));
  const bucketSize = Math.ceil(sorted.length / numLayers);
  const strata: Stratum[] = [];
  for (let i = 0; i < numLayers; i++) {
    const chunk = sorted.slice(i * bucketSize, (i + 1) * bucketSize);
    if (!chunk.length) continue;
    const lookIdx = numLayers === 1 ? 0 : Math.round((i * (STRATUM_LOOKS.length - 1)) / (numLayers - 1));
    const look = STRATUM_LOOKS[Math.min(lookIdx, STRATUM_LOOKS.length - 1)];
    const years = chunk.map((c) => c.year);
    strata.push({
      label: i === numLayers - 1 ? "Bedrock" : look.label,
      span: `${Math.min(...years)}–${Math.max(...years)}`,
      dirt: look.dirt,
      specks: look.specks,
      ideas: chunk,
    });
  }
  return strata;
}

const SHAPES = [
  { w: 150, h: 120, r: "14% 5% 18% 7%/9% 16% 6% 19%" },
  { w: 118, h: 104, r: "38% 19% 33% 24%/23% 37% 20% 35%" },
  { w: 88, h: 84, r: "57% 41% 49% 53%/43% 62% 38% 57%" },
];
const BONE = ["#e9dfc7", "#efe6d2", "#e3d8bd", "#eae0c9"];
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
  const [specimens, setSpecimens] = useState<Specimen[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [era, setEra] = useState(0);
  const [layout, setLayout] = useState<LaidOutSpecimen[]>([]);
  const [exposed, setExposed] = useState<number[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [dims, setDims] = useState({ w: 1200, h: 600 });
  const [found, setFound] = useState<Set<string>>(new Set());
  const [dragPos, setDragPos] = useState<Record<number, { x: number; y: number }>>({});

  useEffect(() => {
    let cancelled = false;
    fetchSpecimens()
      .then((rows) => {
        if (!cancelled) setSpecimens(rows.map(rowToSpecimen));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load specimens.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const STRATA = useMemo(() => buildStrata(specimens ?? []), [specimens]);
  const TOTAL_IDEAS = specimens?.length ?? 0;

  const digRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const cleared = useRef<Set<string>>(new Set());
  const painting = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef<{ i: number; startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);

  function buildLayout(eraIdx: number, w: number, h: number) {
    const ideas = STRATA[eraIdx].ideas;
    const rnd = prng((eraIdx + 3) * 7717);
    const cols = Math.max(2, Math.min(4, Math.floor(w / 280)));
    const rows = Math.ceil(ideas.length / cols);
    const cw = w / cols;
    const ch = h / rows;
    // Shuffle which grid slot each specimen lands in — otherwise every stratum
    // reads as the same row/col pattern with a bit of jitter, which looked
    // suspiciously identical from one layer to the next.
    const slots = Array.from({ length: cols * rows }, (_, k) => k);
    for (let k = slots.length - 1; k > 0; k--) {
      const j = Math.floor(rnd() * (k + 1));
      [slots[k], slots[j]] = [slots[j], slots[k]];
    }
    // Shapes were tuned for ~9 specimens in one bed — scale up when a stratum has fewer,
    // so a 4-5 idea layer doesn't look lost in all that empty dirt.
    const scale = Math.min(1.5, Math.sqrt(9 / ideas.length));
    const next: LaidOutSpecimen[] = ideas.map((sp, i) => {
      const base = SHAPES[i % SHAPES.length];
      const sw = Math.round(base.w * scale);
      const sh = Math.round(base.h * scale);
      const slot = slots[i];
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      const x = Math.round(Math.max(16, Math.min(w - sw - 16, col * cw + (cw - sw) / 2 + (rnd() - 0.5) * cw * 0.55)));
      const y = Math.round(Math.max(14, Math.min(h - sh - 14, row * ch + (ch - sh) / 2 + (rnd() - 0.5) * ch * 0.55)));
      return { ...sp, i, x, y, w: sw, h: sh, r: base.r, tone: BONE[i % BONE.length], rot: (rnd() - 0.5) * 26, icon: i % FOSSIL_ICONS.length };
    });
    cleared.current = new Set();
    setLayout(next);
    setExposed([]);
    setDragPos({});
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
      ctx.fillStyle = s > 0.62 ? "rgba(255,250,232,.3)" : s > 0.3 ? E.specks : "rgba(46,36,22,.4)";
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

  function fossilDown(sp: LaidOutSpecimen, e: React.PointerEvent) {
    e.stopPropagation();
    const off = dragPos[sp.i] ?? { x: 0, y: 0 };
    dragging.current = { i: sp.i, startX: e.clientX, startY: e.clientY, origX: off.x, origY: off.y, moved: false };
  }

  useEffect(() => {
    function onFossilMove(e: PointerEvent) {
      const d = dragging.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.moved && Math.hypot(dx, dy) > 4) d.moved = true;
      const sp = layout.find((s) => s.i === d.i);
      if (!sp) return;
      const nx = Math.max(-sp.x, Math.min(dims.w - sp.w - sp.x, d.origX + dx));
      const ny = Math.max(-sp.y, Math.min(dims.h - sp.h - sp.y, d.origY + dy));
      setDragPos((prev) => ({ ...prev, [d.i]: { x: nx, y: ny } }));
    }
    function onFossilUp() {
      const d = dragging.current;
      if (!d) return;
      dragging.current = null;
      if (!d.moved) setOpenId(d.i);
    }
    window.addEventListener("pointermove", onFossilMove);
    window.addEventListener("pointerup", onFossilUp);
    return () => {
      window.removeEventListener("pointermove", onFossilMove);
      window.removeEventListener("pointerup", onFossilUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, dims]);

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

  useEffect(() => {
    if (!started) return;
    function onKey(e: KeyboardEvent) {
      if (openId !== null) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goEra(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        goEra(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, openId, era]);

  return (
    <main style={{ background: PAPER }}>
      <style>{`
        @font-face { font-family: 'Sentient'; src: url('/fonts/sentient/Sentient-Variable.woff2') format('woff2'); font-weight: 200 700; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Sentient'; src: url('/fonts/sentient/Sentient-VariableItalic.woff2') format('woff2'); font-weight: 200 700; font-style: italic; font-display: swap; }
      `}</style>

      {specimens === null ? (
        <div className="flex items-center justify-center px-6" style={{ minHeight: "100dvh" }}>
          <p style={{ fontFamily: LABEL_FONT, fontSize: 13, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase" }}>
            {loadError ? `Couldn't load the dig site — ${loadError}` : "Surveying the site…"}
          </p>
        </div>
      ) : !started ? (
        <div className="flex items-center justify-center px-6 py-24" style={{ minHeight: "100dvh" }}>
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

            <div className="mt-8 w-full" style={{ border: `1px solid ${INK}` }}>
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ background: "#6E8C58" }}
              >
                <span style={{ fontFamily: DISPLAY_FONT, fontSize: 15, color: "#fbf6e6" }}>2026 · surface</span>
              </div>
              {STRATA.map((s, idx) => (
                <div
                  key={s.label + idx}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    background: s.dirt,
                    borderBottom: idx < STRATA.length - 1 ? "1px solid rgba(43,35,24,.35)" : "none",
                  }}
                >
                  <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.16em", color: idx > 1 ? PAPER : INK }}>
                    {s.span}
                  </span>
                  <span
                    className="uppercase"
                    style={{ fontFamily: DISPLAY_FONT, fontSize: 15, letterSpacing: "0.14em", color: idx > 1 ? PAPER : INK }}
                  >
                    {s.label}
                  </span>
                  <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.12em", color: idx > 1 ? PAPER : INK }}>
                    {s.ideas.length} specimens
                  </span>
                </div>
              ))}
            </div>

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
        <div className="relative w-full" style={{ height: "100dvh", overflow: "hidden" }}>
          {/* top bar */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between gap-3 px-4 sm:px-8"
            style={{ height: 70, background: PAPER, borderBottom: `1px solid ${BORDER}`, zIndex: 60 }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="truncate"
                style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(14px, 4.2vw, 19px)", letterSpacing: "0.06em", textTransform: "uppercase", color: INK }}
              >
                The Idea Bed
              </span>
              <div className="flex items-center gap-2 min-w-0" style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.1em", color: MUTED }}>
                <Link to="/" className="hover:opacity-70 transition-opacity uppercase shrink-0" style={{ letterSpacing: "0.14em" }}>
                  ← surface
                </Link>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline truncate">SITE SURVEY · IDEAS NOT PURSUED</span>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-8 shrink-0">
              <div className="flex flex-col items-end gap-0.5">
                <span className="hidden sm:inline" style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: MUTED }}>STRATUM</span>
                <span style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(12px, 3.2vw, 16px)", letterSpacing: "0.04em", color: INK, whiteSpace: "nowrap" }}>
                  {STRATA[era].label} <span className="hidden sm:inline" style={{ fontSize: 13, color: MUTED }}>({STRATA[era].span})</span>
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: MUTED }}>RECOVERED</span>
                <span style={{ fontFamily: LABEL_FONT, fontSize: 16, color: INK }}>
                  {found.size} / {TOTAL_IDEAS}
                </span>
              </div>
              <span className="sm:hidden" style={{ fontFamily: LABEL_FONT, fontSize: 13, color: INK, whiteSpace: "nowrap" }}>
                {found.size}/{TOTAL_IDEAS}
              </span>
            </div>
          </div>

          {/* dig area */}
          <div ref={digRef} className="absolute left-0 right-0" style={{ top: 70, bottom: 60, overflow: "hidden" }}>
            <div
              className="absolute inset-0"
              style={{
                background: STRATA[era].dirt,
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
                  opacity: exposed.includes(sp.i) ? 0.25 : 1,
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
                const off = dragPos[i] ?? { x: 0, y: 0 };
                const isDragging = dragging.current?.i === i;
                return (
                  <div
                    key={i}
                    onPointerDown={(e) => fossilDown(sp, e)}
                    style={{
                      position: "absolute",
                      left: sp.x + off.x,
                      top: sp.y + off.y,
                      width: sp.w,
                      height: sp.h + 30,
                      zIndex: isDragging ? 40 : 30,
                      cursor: isDragging ? "grabbing" : "grab",
                      touchAction: "none",
                    }}
                  >
                    <div
                      style={{
                        width: sp.w,
                        height: sp.h,
                        position: "relative",
                        borderRadius: sp.r,
                        backgroundColor: sp.tone,
                        transform: `rotate(${sp.rot}deg)`,
                        boxShadow: isDragging ? "0 14px 26px rgba(43,35,24,.35)" : "0 4px 10px rgba(43,35,24,.2)",
                        transition: "box-shadow .15s",
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
                        pointerEvents: "none",
                      }}
                    >
                      {sp.confidential ? "🔒 " : ""}
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
                <div style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.2em", color: MUTED }}>
                  SPECIMEN {open.no} · {open.year}
                </div>
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
                {open.confidential ? (
                  <div className="relative mt-6">
                    <div style={{ filter: "blur(7px)", userSelect: "none", pointerEvents: "none" }}>
                      {open.imageUrl && (
                        <div style={{ border: `1px solid ${BORDER}` }}>
                          <img src={open.imageUrl} alt={open.name} style={{ width: "100%", display: "block" }} />
                        </div>
                      )}
                      <div className="mt-5" style={{ fontFamily: DISPLAY_FONT, fontSize: 20, lineHeight: 1.5, color: "#3a3122" }}>
                        {open.blurb}
                      </div>
                      {open.reason && (
                        <div className="mt-4" style={{ fontFamily: DISPLAY_FONT, fontSize: 18, lineHeight: 1.5, color: "#6b5c40" }}>
                          {open.reason}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        style={{
                          border: `2px solid ${RUST}`,
                          outline: `1px solid ${RUST}`,
                          outlineOffset: "3px",
                          color: RUST,
                          padding: "10px 24px 8px",
                          fontFamily: LABEL_FONT,
                          letterSpacing: "0.2em",
                          transform: "rotate(-7deg)",
                          background: "rgba(244,236,218,.72)",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 19, textTransform: "uppercase" }}>Confidential</div>
                        <div style={{ fontSize: 10, letterSpacing: "0.16em", marginTop: 3, textTransform: "uppercase" }}>
                          Specimen {open.no} · access restricted
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {open.imageUrl && (
                      <div className="mt-6" style={{ border: `1px solid ${BORDER}` }}>
                        <img src={open.imageUrl} alt={open.name} style={{ width: "100%", display: "block" }} />
                      </div>
                    )}
                    <div className="mt-5" style={{ fontFamily: DISPLAY_FONT, fontSize: 20, lineHeight: 1.5, color: "#3a3122" }}>
                      {open.blurb}
                    </div>
                    {open.reason && (
                      <div className="mt-4" style={{ fontFamily: DISPLAY_FONT, fontSize: 18, lineHeight: 1.5, color: "#6b5c40" }}>
                        {open.reason}
                      </div>
                    )}
                  </>
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
