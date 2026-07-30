import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import rough from "roughjs";

// ─── Junk drawer — trashed ideas + assorted drawer debris ─────────────────────
// This page is deliberately its own world: hand-drawn, textured, warm and a
// little messy — everything else on the site is calm and this isn't.
// Item shapes are kept simple on purpose — real illustrations get swapped in later.

const INK = "#3A3226";
const PAPER = "#F1E9D8";

// Muted, dusty palette — never saturated or high-contrast
const DUSTY = {
  sage: "#A6AD86",
  terracotta: "#C99B76",
  mustard: "#D6BD74",
  lavender: "#B0A3BC",
};
const frameColors = [DUSTY.sage, DUSTY.terracotta, DUSTY.mustard, DUSTY.lavender, DUSTY.sage, DUSTY.terracotta];

// Big moments (headline, card titles) get the hand-lettered display font.
// Everyday labels and body copy get a simple rounded sans — not a second script font.
const DISPLAY_FONT = "Caveat, cursive";
const LABEL_FONT = "Quicksand, sans-serif";

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
    svg.appendChild(rc.rectangle(2, 8, 58, 9, { fill: INK, stroke: INK, fillStyle: "solid", roughness: 2.2, seed: 11 }));
    svg.appendChild(rc.rectangle(2, 8, 12, 9, { fill: "#C9BFAE", stroke: INK, fillStyle: "solid", roughness: 2.2, seed: 12 }));
    svg.appendChild(rc.polygon([[60, 6], [86, 12], [60, 18]], { fill: DUSTY.terracotta, stroke: INK, fillStyle: "hachure", roughness: 2.2, seed: 13 }));
  });
  return <svg ref={ref} width="92" height="24" viewBox="0 0 92 24" />;
}

function MintTinIcon() {
  const ref = useRoughDraw((rc) => {
    const svg = ref.current!;
    svg.appendChild(rc.rectangle(2, 2, 82, 54, { fill: "#EDE4CC", stroke: INK, fillStyle: "solid", roughness: 2.4, seed: 21 }));
    svg.appendChild(rc.rectangle(2, 2, 82, 19, { fill: DUSTY.sage, stroke: INK, fillStyle: "solid", roughness: 2.4, seed: 22 }));
    svg.appendChild(rc.ellipse(20, 38, 8, 8, { fill: "#EDE4CC", stroke: DUSTY.sage, fillStyle: "solid", roughness: 1.8, seed: 23 }));
    svg.appendChild(rc.ellipse(32, 38, 8, 8, { fill: "#EDE4CC", stroke: DUSTY.sage, fillStyle: "solid", roughness: 1.8, seed: 24 }));
    svg.appendChild(rc.ellipse(44, 38, 8, 8, { fill: "#EDE4CC", stroke: DUSTY.sage, fillStyle: "solid", roughness: 1.8, seed: 25 }));
  });
  return (
    <svg ref={ref} width="86" height="58" viewBox="0 0 86 58">
      <text x="43" y="15" fontSize="8" fill="#F1E9D8" textAnchor="middle" fontFamily={LABEL_FONT} fontWeight={700}>
        mints
      </text>
    </svg>
  );
}

function SnackIcon() {
  const ref = useRoughDraw((rc) => {
    const svg = ref.current!;
    svg.appendChild(rc.polygon([[15, 8], [2, 2], [2, 46], [15, 40]], { fill: DUSTY.sage, stroke: INK, fillStyle: "solid", roughness: 2.2, seed: 31 }));
    svg.appendChild(rc.rectangle(15, 4, 64, 40, { fill: DUSTY.mustard, stroke: INK, fillStyle: "solid", roughness: 2.2, seed: 32 }));
    svg.appendChild(rc.polygon([[79, 8], [92, 2], [92, 46], [79, 40]], { fill: DUSTY.sage, stroke: INK, fillStyle: "solid", roughness: 2.2, seed: 33 }));
  });
  return (
    <svg ref={ref} width="94" height="48" viewBox="0 0 94 48">
      <text x="47" y="28" fontSize="9" fill={INK} textAnchor="middle" fontFamily={LABEL_FONT} fontWeight={700}>
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

// ─── Idea card — no hard box chrome, just paper + a hand-drawn accent ─────────
// No border, no frame, barely any shadow — the color and the wobbly underline
// do the work a card border normally would.

function IdeaCard({ idea, frameColor }: { idea: TrashedIdea; frameColor: string }) {
  return (
    <div
      className="w-56 sm:w-64 p-5"
      style={{
        background: PAPER,
        borderRadius: "16px 20px 14px 22px",
        boxShadow: "0 3px 9px rgba(58,50,38,0.10)",
      }}
    >
      <span
        className="text-[11px] uppercase tracking-wide"
        style={{ fontFamily: LABEL_FONT, fontWeight: 700, color: frameColor }}
      >
        trashed
      </span>
      <h3 className="text-2xl mt-1" style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: INK }}>
        {idea.title}
      </h3>
      <svg width="90" height="8" viewBox="0 0 90 8" className="mt-0.5 mb-1">
        <path d="M2 5 C 20 2, 40 7, 60 4 S 85 2, 88 5" fill="none" stroke={frameColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm mt-2 leading-snug" style={{ fontFamily: LABEL_FONT, color: "#6B6252" }}>
        {idea.note}
      </p>
    </div>
  );
}

export default function JunkDrawer() {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const collapseDistance = 260;
  const headerScale = useTransform(scrollY, [0, collapseDistance], [1, 0.82]);
  const headerOpacity = useTransform(scrollY, [0, collapseDistance], [1, 0]);

  return (
    <main style={{ background: PAPER, backgroundImage: NOISE_BG }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Quicksand:wght@500;600;700&display=swap" />

      {/* Header — collapses (scales + fades) as you scroll into the drawer, layout height stays fixed */}
      <div className="overflow-hidden">
        <motion.div
          className="max-w-5xl mx-auto px-6 pt-32 pb-16"
          style={{ scale: headerScale, opacity: headerOpacity, transformOrigin: "top center" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity duration-200 group"
            style={{ fontFamily: LABEL_FONT, fontWeight: 600, color: INK }}
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5 inline-block">←</span>
            Back to the sensible website
          </Link>

          <div className="mt-12">
            <p className="text-sm tracking-wide mb-4" style={{ fontFamily: LABEL_FONT, fontWeight: 600, color: DUSTY.sage }}>
              everything that didn't make it
            </p>
            <h1 className="text-6xl sm:text-8xl leading-[1.05]" style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: INK }}>
              The <MarkerCircle color="#8FAAC7">junk drawer</MarkerCircle>.
            </h1>
            <p className="text-lg mt-6 max-w-xl leading-relaxed" style={{ fontFamily: LABEL_FONT, color: "#6B6252" }}>
              Ideas that got as far as a name and then didn't. Drag stuff around — it's a drawer, that's what it's for.
            </p>
          </div>
        </motion.div>
      </div>

      {/* The drawer itself — full bleed, edge to edge */}
      <motion.div
        ref={drawerRef}
        className="relative w-full h-[85vh] min-h-[600px] overflow-hidden mt-16"
        style={{
          background: "#E7DCC1",
          backgroundImage: NOISE_BG,
          boxShadow: "inset 0 0 60px rgba(58,50,38,0.14)",
          borderTop: `2px solid ${DUSTY.mustard}`,
        }}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
          {/* Drawer front sliding open on load */}
          <motion.div
            className="absolute inset-0 z-50 flex items-end justify-center pb-8"
            style={{ background: DUSTY.sage }}
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="rotate-[-2deg]">
              <MarkerCircle color={PAPER}>
                <span style={{ fontFamily: DISPLAY_FONT, color: PAPER, fontSize: 22, fontWeight: 700 }}>opening...</span>
              </MarkerCircle>
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
            <HighlighterIcon color={DUSTY.mustard} seedBase={41} />
          </DraggableItem>
          <DraggableItem top="42%" left="88%" rotate={-14} delay={1.34} constraintsRef={drawerRef}>
            <HighlighterIcon color={DUSTY.lavender} seedBase={51} />
          </DraggableItem>
      </motion.div>
    </main>
  );
}
