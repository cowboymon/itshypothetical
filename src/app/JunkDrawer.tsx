import { Link } from "react-router";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import rough from "roughjs";

// ─── Junk drawer — trashed ideas + assorted drawer debris ─────────────────────
// This page is deliberately its own world: hand-drawn, textured, warm and a
// little messy — everything else on the site is calm and this isn't.
// Item shapes are kept simple on purpose — real illustrations get swapped in later.

const INK = "#3A3226";
const PAPER = "#F1E9D8";

const frameColors = ["#5FA8A0", "#E8846B", "#E0B84A", "#A794C4", "#8B9A5B", "#D98F6F"];

interface TrashedIdea {
  title: string;
  note: string;
  top: string;
  left: string;
  rotate: number;
}

const trashedIdeas: TrashedIdea[] = [
  { title: "Sock Drawer", note: "An inventory app for socks. Would've been the most niche app ever made.", top: "6%", left: "4%", rotate: -6 },
  { title: "Ghosted", note: "Auto-drafts the text you'll never send. Too real, too sad. Shelved.", top: "2%", left: "34%", rotate: 4 },
  { title: "Correct Weather", note: "Hyperlocal weather down to your specific balcony. Turns out — just look outside.", top: "30%", left: "58%", rotate: -3 },
  { title: "Group Chat Butler", note: "Summarizes the 400-message group chat so you don't have to. Someone else built it, better and first.", top: "50%", left: "6%", rotate: 5 },
  { title: "Apology Generator", note: "Pre-written apologies, ranked by sincerity. Legal said no.", top: "58%", left: "42%", rotate: -5 },
  { title: "Speedrun My Life", note: "Gamifies chores as speedrun categories. Nobody wants a leaderboard for laundry.", top: "14%", left: "76%", rotate: 3 },
];

// ─── Paper grain, mixed into the background so nothing feels flat ─────────────

const NOISE_BG = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' fill='${PAPER}' filter='url(#n)'/></svg>`
)}")`;

// ─── A hand-drawn wobble behind a word, marker-circle style ───────────────────

function MarkerCircle({ children, color = "#6FA8D8" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="relative inline-block px-2">
      <svg
        className="absolute -inset-x-2 -top-2 -bottom-1 w-[calc(100%+16px)] h-[calc(100%+12px)] pointer-events-none"
        viewBox="0 0 220 90"
        preserveAspectRatio="none"
      >
        <path
          d="M14 46 C10 20, 60 6, 110 8 C165 10, 212 18, 206 46 C210 76, 150 84, 108 82 C55 80, 8 74, 14 46 Z"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

// ─── Rough.js-rendered items — sketchy hand-drawn line quality on simple shapes ─

function useRoughDraw(draw: (rc: ReturnType<typeof rough.svg>) => void) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    draw(rough.svg(svg));
  }, []);
  return ref;
}

function PenIcon() {
  const ref = useRoughDraw((rc) => {
    const svg = ref.current!;
    svg.appendChild(rc.rectangle(2, 8, 58, 9, { fill: INK, stroke: INK, fillStyle: "solid", roughness: 1.8, seed: 11 }));
    svg.appendChild(rc.rectangle(2, 8, 12, 9, { fill: "#C9BFAE", stroke: INK, fillStyle: "solid", roughness: 1.8, seed: 12 }));
    svg.appendChild(rc.polygon([[60, 6], [86, 12], [60, 18]], { fill: "#E0956B", stroke: INK, fillStyle: "hachure", roughness: 1.8, seed: 13 }));
  });
  return <svg ref={ref} width="92" height="24" viewBox="0 0 92 24" />;
}

function MintTinIcon() {
  const ref = useRoughDraw((rc) => {
    const svg = ref.current!;
    svg.appendChild(rc.rectangle(2, 2, 82, 54, { fill: "#EDE4CC", stroke: INK, fillStyle: "solid", roughness: 2, seed: 21 }));
    svg.appendChild(rc.rectangle(2, 2, 82, 19, { fill: "#5FA8A0", stroke: INK, fillStyle: "solid", roughness: 2, seed: 22 }));
    svg.appendChild(rc.ellipse(20, 38, 8, 8, { fill: "#EDE4CC", stroke: "#5FA8A0", fillStyle: "solid", roughness: 1.6, seed: 23 }));
    svg.appendChild(rc.ellipse(32, 38, 8, 8, { fill: "#EDE4CC", stroke: "#5FA8A0", fillStyle: "solid", roughness: 1.6, seed: 24 }));
    svg.appendChild(rc.ellipse(44, 38, 8, 8, { fill: "#EDE4CC", stroke: "#5FA8A0", fillStyle: "solid", roughness: 1.6, seed: 25 }));
  });
  return (
    <svg ref={ref} width="86" height="58" viewBox="0 0 86 58">
      <text x="43" y="15" fontSize="8" fill="#F1E9D8" textAnchor="middle" fontFamily="Kalam, cursive">
        mints
      </text>
    </svg>
  );
}

function SnackIcon() {
  const ref = useRoughDraw((rc) => {
    const svg = ref.current!;
    svg.appendChild(rc.polygon([[15, 8], [2, 2], [2, 46], [15, 40]], { fill: "#8B9A5B", stroke: INK, fillStyle: "solid", roughness: 1.8, seed: 31 }));
    svg.appendChild(rc.rectangle(15, 4, 64, 40, { fill: "#E0B84A", stroke: INK, fillStyle: "solid", roughness: 1.8, seed: 32 }));
    svg.appendChild(rc.polygon([[79, 8], [92, 2], [92, 46], [79, 40]], { fill: "#8B9A5B", stroke: INK, fillStyle: "solid", roughness: 1.8, seed: 33 }));
  });
  return (
    <svg ref={ref} width="94" height="48" viewBox="0 0 94 48">
      <text x="47" y="28" fontSize="9" fill={INK} textAnchor="middle" fontFamily="Kalam, cursive">
        snack
      </text>
    </svg>
  );
}

function HighlighterIcon({ color, seedBase }: { color: string; seedBase: number }) {
  const ref = useRoughDraw((rc) => {
    const svg = ref.current!;
    svg.appendChild(rc.rectangle(5, 22, 16, 68, { fill: color, stroke: INK, fillStyle: "solid", roughness: 1.8, seed: seedBase }));
    svg.appendChild(rc.polygon([[5, 22], [13, 2], [21, 22]], { fill: INK, stroke: INK, fillStyle: "solid", roughness: 1.8, seed: seedBase + 1 }));
    svg.appendChild(rc.rectangle(8, 74, 10, 12, { fill: "#F1E9D8", stroke: INK, fillStyle: "solid", roughness: 1.6, seed: seedBase + 2 }));
  });
  return <svg ref={ref} width="26" height="94" viewBox="0 0 26 94" />;
}

// ─── Draggable wrapper ─────────────────────────────────────────────────────────

function DraggableItem({
  children,
  top,
  left,
  rotate,
  delay,
  constraintsRef,
  className = "",
}: {
  children: React.ReactNode;
  top: string;
  left: string;
  rotate: number;
  delay: number;
  constraintsRef: React.RefObject<HTMLDivElement>;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{ top, left }}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.2}
      dragMomentum={false}
      whileDrag={{ scale: 1.08, zIndex: 40, boxShadow: "0 14px 30px rgba(58,50,38,0.25)" }}
      whileHover={{ scale: 1.04 }}
      initial={{ opacity: 0, y: -40, rotate: 0, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, rotate, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Idea card — framed like a little postcard, not a corporate note ──────────

function IdeaCard({ idea, frameColor }: { idea: TrashedIdea; frameColor: string }) {
  return (
    <div
      className="w-56 sm:w-64 p-2.5 rounded-md"
      style={{ background: frameColor, boxShadow: "0 10px 22px rgba(58,50,38,0.22)" }}
    >
      <div className="rounded-sm p-4" style={{ background: PAPER }}>
        <span
          className="text-[11px] uppercase tracking-wide"
          style={{ fontFamily: "Kalam, cursive", color: frameColor, opacity: 0.9 }}
        >
          trashed
        </span>
        <h3 className="text-2xl mt-1" style={{ fontFamily: "Caveat, cursive", color: INK }}>
          {idea.title}
        </h3>
        <p className="text-sm mt-2 leading-snug" style={{ fontFamily: "Kalam, cursive", color: "#6B6252" }}>
          {idea.note}
        </p>
      </div>
    </div>
  );
}

export default function JunkDrawer() {
  const drawerRef = useRef<HTMLDivElement>(null);

  return (
    <main style={{ background: PAPER, backgroundImage: NOISE_BG }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@400;700&display=swap" />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity duration-200 group"
          style={{ fontFamily: "Kalam, cursive", color: INK }}
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5 inline-block">←</span>
          Back to the sensible website
        </Link>

        <div className="mt-12 pb-16">
          <p className="text-sm tracking-wide mb-4" style={{ fontFamily: "Kalam, cursive", color: "#8B9A5B" }}>
            everything that didn't make it
          </p>
          <h1 className="text-6xl sm:text-8xl leading-[1.05]" style={{ fontFamily: "Caveat, cursive", fontWeight: 700, color: INK }}>
            The <MarkerCircle color="#6FA8D8">junk drawer</MarkerCircle>.
          </h1>
          <p className="text-lg mt-6 max-w-xl leading-relaxed" style={{ fontFamily: "Kalam, cursive", color: "#6B6252" }}>
            Ideas that got as far as a name and then didn't. Drag stuff around — it's a drawer, that's what it's for.
          </p>
        </div>
      </div>

      {/* The drawer itself — full bleed, edge to edge */}
      <motion.div
        ref={drawerRef}
        className="relative w-full h-[85vh] min-h-[600px] overflow-hidden mt-16"
        style={{
          background: "#E7DCC1",
          backgroundImage: NOISE_BG,
          boxShadow: "inset 0 0 60px rgba(58,50,38,0.14)",
          borderTop: "2px solid #D8C9A3",
        }}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
          {/* Drawer front sliding open on load */}
          <motion.div
            className="absolute inset-0 z-50 flex items-end justify-center pb-8"
            style={{ background: "#7C8B54" }}
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <div
              className="px-4 py-2 rounded-sm rotate-[-2deg]"
              style={{ background: PAPER, fontFamily: "Caveat, cursive", color: INK, fontSize: 22, fontWeight: 700 }}
            >
              opening...
            </div>
          </motion.div>

          {trashedIdeas.map((idea, i) => (
            <DraggableItem
              key={idea.title}
              top={idea.top}
              left={idea.left}
              rotate={idea.rotate}
              delay={0.7 + i * 0.06}
              constraintsRef={drawerRef}
            >
              <IdeaCard idea={idea} frameColor={frameColors[i % frameColors.length]} />
            </DraggableItem>
          ))}

          <DraggableItem top="76%" left="72%" rotate={-8} delay={1.1} constraintsRef={drawerRef}>
            <PenIcon />
          </DraggableItem>
          <DraggableItem top="70%" left="20%" rotate={6} delay={1.16} constraintsRef={drawerRef}>
            <MintTinIcon />
          </DraggableItem>
          <DraggableItem top="4%" left="58%" rotate={-4} delay={1.22} constraintsRef={drawerRef}>
            <SnackIcon />
          </DraggableItem>
          <DraggableItem top="36%" left="4%" rotate={12} delay={1.28} constraintsRef={drawerRef}>
            <HighlighterIcon color="#E0B84A" seedBase={41} />
          </DraggableItem>
          <DraggableItem top="42%" left="88%" rotate={-14} delay={1.34} constraintsRef={drawerRef}>
            <HighlighterIcon color="#D9738F" seedBase={51} />
          </DraggableItem>
      </motion.div>
    </main>
  );
}
