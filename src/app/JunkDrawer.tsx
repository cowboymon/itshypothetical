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

const DISPLAY_FONT = "'Zodiak', Georgia, serif";
const LABEL_FONT = "'Comico', sans-serif";

interface Specimen {
  no: string;
  name: string;
  tagline: string;
  blurb: string;
  reason?: string;
  cause: string;
}

const SPECIMENS: Specimen[] = [
  {
    no: "FD-01",
    name: "Critically Endangered",
    tagline: "a zoo where the rarest animals cost the most",
    blurb: "Every species is capped at exactly how many are left in the real world — if there are 30 vaquita left in the wild, only 30 people on the planet will ever be able to have one in their zoo, ever, full stop. No restock. Buying one sends real money to actual conservation, so the rarer and more expensive the animal, the more it's actually doing.",
    reason: "I don't know how to world build like that.",
    cause: "SCOPE",
  },
  {
    no: "FD-02",
    name: "Sorted",
    tagline: "scan it. we'll tell you where it actually goes",
    blurb: "Point your phone at a barcode and get told exactly what's recyclable in your home bin, and where the rest needs to go instead. Built on the idea that shame is a terrible motivator — nobody's cheering you on in your kitchen at 11pm with no one watching.",
    reason: "\"Tells you where your rubbish goes\" is a feature, not a product.",
    cause: "TOO SMALL TO BE A PRODUCT",
  },
  {
    no: "FD-03",
    name: "Best in Show",
    tagline: "one category. dog poop. public vote",
    blurb: "You photograph the day's offering. So does everyone else. Funniest one wins. There is no further explanation, because there isn't one.",
    reason: "I couldn't find a version of this pitch that didn't end with someone asking me why.",
    cause: "COULDN'T DEFEND IT",
  },
  {
    no: "FD-04",
    name: "Still Reachable",
    tagline: "a number that's always theirs",
    blurb: "Upload a voice message from someone you've lost touch with — or lost — and get a number where it's always waiting: call it to hear them, text it and it just sits there, without some stranger's \"sorry, wrong number\" eventually landing in its place.",
    cause: "STILL VIABLE, HONESTLY",
  },
  {
    no: "FD-05",
    name: "Sent Anyway",
    tagline: "say it. it just never lands",
    blurb: "Text your ex — or anyone you've lost — into an inbox that never reaches them. Same rush as hitting send, none of the reply, none of the reopening a door you closed for a reason. If it was bad enough, you can order a printed book of the whole thread when you're done, delivered with a single match and a little kindling, so the last thing you do with it is burn it.",
    reason: "The emotional insight is real — grief wants somewhere to send words, and closure sometimes wants a fire, not a notes file on your phone — but we don't want to be liable for creating arsonists.",
    cause: "LIABILITY",
  },
];

const SHAPES = [
  { w: 150, h: 120, r: "14% 5% 18% 7%/9% 16% 6% 19%", c: 7 },
  { w: 118, h: 104, r: "38% 19% 33% 24%/23% 37% 20% 35%", c: 10 },
  { w: 88, h: 84, r: "57% 41% 49% 53%/43% 62% 38% 57%", c: 12 },
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
  creases: { top: number; left: number; len: number; rot: number; light: boolean }[];
}

export default function JunkDrawer() {
  const [started, setStarted] = useState(false);
  const [layout, setLayout] = useState<LaidOutSpecimen[]>([]);
  const [exposed, setExposed] = useState<number[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [dims, setDims] = useState({ w: 1200, h: 600 });

  const digRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const cleared = useRef<Set<string>>(new Set());
  const painting = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  function buildLayout(w: number, h: number) {
    const rnd = prng(7717);
    const cols = Math.max(2, Math.min(4, Math.floor(w / 280)));
    const rows = Math.ceil(SPECIMENS.length / cols);
    const cw = w / cols;
    const ch = h / rows;
    const next: LaidOutSpecimen[] = SPECIMENS.map((sp, i) => {
      const s = SHAPES[i % SHAPES.length];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = Math.round(Math.max(16, Math.min(w - s.w - 16, col * cw + (cw - s.w) / 2 + (rnd() - 0.5) * cw * 0.3)));
      const y = Math.round(Math.max(14, Math.min(h - s.h - 14, row * ch + (ch - s.h) / 2 + (rnd() - 0.5) * ch * 0.3)));
      const creases = Array.from({ length: s.c }, (_, k) => ({
        top: Math.round(-6 + rnd() * (s.h + 10)),
        left: Math.round(-12 + rnd() * (s.w * 0.4)),
        len: Math.round(s.w * (0.5 + rnd() * 0.8)),
        rot: (rnd() - 0.5) * (i % 3 === 0 ? 30 : 150),
        light: k % 3 === 1,
      }));
      return { ...sp, i, x, y, w: s.w, h: s.h, r: s.r, tone: BONE[i % BONE.length], rot: (rnd() - 0.5) * 26, creases };
    });
    cleared.current = new Set();
    setLayout(next);
    setExposed([]);
    setTouched(false);
  }

  function paintDirt(w: number, h: number) {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = DIRT;
    ctx.fillRect(0, 0, w, h);
    const rnd = prng(3301);
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

  function measure(force = false) {
    const el = digRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.max(420, Math.round(r.width));
    const h = Math.max(320, Math.round(r.height));
    if (!force && w === dims.w && h === dims.h && layout.length) return;
    setDims({ w, h });
    buildLayout(w, h);
    paintDirt(w, h);
  }

  useEffect(() => {
    if (!started) return;
    measure(true);
    const onResize = () => measure(true);
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

  return (
    <main style={{ background: PAPER }}>
      <link href="https://api.fontshare.com/v2/css?f[]=zodiak@400&f[]=comico@400&display=swap" rel="stylesheet" />

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
            <p style={{ fontFamily: LABEL_FONT, fontSize: 12, letterSpacing: "0.24em", color: MUTED }}>FIELD SEASON 2018 — 2026</p>
            <h1
              className="mt-5 text-5xl sm:text-6xl uppercase"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.03em", color: INK }}
            >
              The Idea Bed
            </h1>
            <p className="mt-4 max-w-md text-lg italic" style={{ fontFamily: DISPLAY_FONT, color: "#6b5c40" }}>
              Five ideas I abandoned, buried where they fell. Nothing here is labelled. You'll have to brush it off yourself.
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
            <div className="flex flex-col gap-0.5">
              <Link
                to="/"
                className="hover:opacity-70 transition-opacity"
                style={{ fontFamily: DISPLAY_FONT, fontSize: 19, letterSpacing: "0.1em", textTransform: "uppercase", color: INK }}
              >
                The Idea Bed
              </Link>
              <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.1em", color: MUTED }}>
                SITE SURVEY · IDEAS NOT PURSUED
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span style={{ fontFamily: LABEL_FONT, fontSize: 11, letterSpacing: "0.14em", color: MUTED }}>RECOVERED</span>
              <span style={{ fontFamily: LABEL_FONT, fontSize: 16, color: INK }}>
                {exposed.length} / {SPECIMENS.length}
              </span>
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
                    backgroundImage: "repeating-linear-gradient(102deg, rgba(255,255,255,.42) 0 2px, transparent 2px 5px)",
                    border: "1.5px solid #6f5c3c",
                    overflow: "hidden",
                    boxShadow: "inset -12px -14px 20px rgba(110,92,60,.3), inset 9px 10px 14px rgba(255,252,240,.55)",
                  }}
                >
                  {sp.creases.map((c, k) => (
                    <div
                      key={k}
                      style={{
                        position: "absolute",
                        top: c.top,
                        left: c.left,
                        width: c.len,
                        borderTop: c.light ? "1.5px solid rgba(255,252,240,.8)" : "1px solid rgba(112,93,61,.55)",
                        transform: `rotate(${c.rot}deg)`,
                        transformOrigin: "left center",
                      }}
                    />
                  ))}
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
