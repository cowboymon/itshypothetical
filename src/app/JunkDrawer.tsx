import { Link } from "react-router";
import { motion, useScroll, useTransform, useMotionValue, animate, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
  year: string;
  status: string;
  top: string;
  left: string;
  rotate: number;
}

const trashedIdeas: TrashedIdea[] = [
  { title: "Sock Drawer", note: "An inventory app for socks. Would've been the most niche app ever made.", year: "2022", status: "trashed", top: "6%", left: "4%", rotate: -6 },
  { title: "Ghosted", note: "Auto-drafts the text you'll never send. Too real, too sad. Shelved.", year: "2023", status: "shelved", top: "2%", left: "34%", rotate: 4 },
  { title: "Correct Weather", note: "Hyperlocal weather down to your specific balcony. Turns out — just look outside.", year: "2023", status: "trashed", top: "30%", left: "58%", rotate: -3 },
  { title: "Group Chat Butler", note: "Summarizes the 400-message group chat so you don't have to. Someone else built it, better and first.", year: "2024", status: "beaten to it", top: "50%", left: "6%", rotate: 5 },
  { title: "Apology Generator", note: "Pre-written apologies, ranked by sincerity. Legal said no.", year: "2024", status: "vetoed", top: "58%", left: "42%", rotate: -5 },
  { title: "Speedrun My Life", note: "Gamifies chores as speedrun categories. Nobody wants a leaderboard for laundry.", year: "2022", status: "trashed", top: "14%", left: "76%", rotate: 3 },
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

// ─── Closed drawer face — the literal thing you pull open ────────────────────

function DrawerFaceIcon() {
  const ref = useRoughDraw((rc) => {
    const svg = ref.current!;
    svg.appendChild(rc.rectangle(4, 4, 312, 132, { fill: DUSTY.terracotta, stroke: INK, fillStyle: "hachure", hachureGap: 5, roughness: 2, seed: 61 }));
    svg.appendChild(rc.rectangle(140, 56, 40, 20, { fill: PAPER, stroke: INK, fillStyle: "solid", roughness: 2, seed: 62 }));
  });
  return <svg ref={ref} width="320" height="140" viewBox="0 0 320 140" />;
}

function DrawerIntro({ onOpen }: { onOpen: () => void }) {
  const pullY = useMotionValue(0);
  const OPEN_AT = 90;

  function handleDragEnd() {
    if (pullY.get() > OPEN_AT * 0.55) {
      onOpen();
    } else {
      animate(pullY, 0, { type: "spring", stiffness: 320, damping: 22 });
    }
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: PAPER, backgroundImage: NOISE_BG }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-sm tracking-wide" style={{ fontFamily: LABEL_FONT, fontWeight: 600, color: DUSTY.sage }}>
        {trashedIdeas.length} canned ideas
      </p>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: OPEN_AT }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ y: pullY, cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >
        <DrawerFaceIcon />
      </motion.div>
      <button onClick={onOpen} className="cursor-pointer">
        <MarkerCircle color={DUSTY.lavender}>
          <span style={{ fontFamily: LABEL_FONT, fontWeight: 600, color: INK }}>pull it open ↓</span>
        </MarkerCircle>
      </button>
    </motion.div>
  );
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
  onTap,
  faded = false,
  labelText,
}: {
  children: React.ReactNode;
  top: string;
  left: string;
  rotate: number;
  delay: number;
  constraintsRef: React.RefObject<HTMLDivElement>;
  className?: string;
  onTap?: () => void;
  faded?: boolean;
  labelText?: string;
}) {
  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing select-none group ${className}`}
      style={{ top, left }}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.2}
      dragMomentum={false}
      whileDrag={{ scale: 1.08, zIndex: 40, boxShadow: "0 14px 30px rgba(58,50,38,0.25)" }}
      whileHover={{ scale: 1.04 }}
      initial={{ opacity: 0, y: -40, rotate: 0, scale: 0.85 }}
      animate={{ opacity: faded ? 0.25 : 1, y: 0, rotate, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay }}
      onTap={onTap}
    >
      {labelText && (
        <span
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ background: PAPER, color: INK, fontFamily: LABEL_FONT, fontWeight: 600, fontSize: 11, boxShadow: "0 2px 6px rgba(58,50,38,0.15)" }}
        >
          {labelText}
        </span>
      )}
      {children}
    </motion.div>
  );
}

// ─── Idea card — a folded note, not a corporate card ──────────────────────────
// Closed by default (title only, crease lines suggesting a fold). Click — a real
// tap, not a drag release — unfolds it into the full detail overlay below.

function IdeaCard({ idea, frameColor }: { idea: TrashedIdea; frameColor: string }) {
  return (
    <div
      className="w-44 sm:w-48 p-4 relative overflow-hidden"
      style={{
        background: PAPER,
        borderRadius: "16px 20px 14px 22px",
        boxShadow: "0 3px 9px rgba(58,50,38,0.10)",
      }}
    >
      {/* fold creases */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 180 130">
        <path d="M0 40 L180 52" stroke={INK} strokeOpacity="0.08" strokeWidth="1.5" />
        <path d="M0 88 L180 78" stroke={INK} strokeOpacity="0.08" strokeWidth="1.5" />
        <path d="M60 0 L52 130" stroke={INK} strokeOpacity="0.06" strokeWidth="1.5" />
      </svg>

      <span
        className="relative text-[11px] uppercase tracking-wide"
        style={{ fontFamily: LABEL_FONT, fontWeight: 700, color: frameColor }}
      >
        trashed
      </span>
      <h3 className="relative text-2xl mt-1" style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: INK }}>
        {idea.title}
      </h3>
      <svg width="70" height="8" viewBox="0 0 70 8" className="relative mt-0.5">
        <path d="M2 5 C 16 2, 30 7, 44 4 S 66 2, 68 5" fill="none" stroke={frameColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Detail overlay — where an idea's fold actually unfolds ──────────────────

function DetailOverlay({ idea, frameColor, onClose }: { idea: TrashedIdea; frameColor: string; onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center px-6"
      style={{ background: "rgba(58,50,38,0.28)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm p-7 relative"
        style={{ background: PAPER, borderRadius: "18px 24px 16px 26px", boxShadow: "0 20px 40px rgba(58,50,38,0.3)" }}
        initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center hover:opacity-60 transition-opacity"
          style={{ fontFamily: LABEL_FONT, color: INK, fontSize: 18 }}
          aria-label="Close"
        >
          ×
        </button>
        <span className="text-[11px] uppercase tracking-wide" style={{ fontFamily: LABEL_FONT, fontWeight: 700, color: frameColor }}>
          {idea.year} · {idea.status}
        </span>
        <h3 className="text-4xl mt-1" style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: INK }}>
          {idea.title}
        </h3>
        <svg width="110" height="8" viewBox="0 0 110 8" className="mt-1 mb-3">
          <path d="M2 5 C 26 2, 48 7, 70 4 S 104 2, 108 5" fill="none" stroke={frameColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="text-base leading-relaxed" style={{ fontFamily: LABEL_FONT, color: "#6B6252" }}>
          {idea.note}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function JunkDrawer() {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const collapseDistance = 260;
  const headerScale = useTransform(scrollY, [0, collapseDistance], [1, 0.82]);
  const headerOpacity = useTransform(scrollY, [0, collapseDistance], [1, 0]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openIdea, setOpenIdea] = useState<string | null>(null);
  const openIdeaData = trashedIdeas.find((i) => i.title === openIdea);
  const openIdeaIndex = trashedIdeas.findIndex((i) => i.title === openIdea);

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
          {/* Closed drawer — pull it open, or tap the hint */}
          <AnimatePresence>
            {!drawerOpen && <DrawerIntro onOpen={() => setDrawerOpen(true)} />}
          </AnimatePresence>

          {drawerOpen &&
            trashedIdeas.map((idea, i) => (
              <DraggableItem
                key={idea.title}
                top={idea.top}
                left={idea.left}
                rotate={idea.rotate}
                delay={i * 0.06}
                constraintsRef={drawerRef}
                onTap={() => setOpenIdea(idea.title)}
                faded={openIdea === idea.title}
              >
                <IdeaCard idea={idea} frameColor={frameColors[i % frameColors.length]} />
              </DraggableItem>
            ))}

          {drawerOpen && (
            <>
              <DraggableItem top="76%" left="72%" rotate={-8} delay={0.4} constraintsRef={drawerRef} labelText="pen">
                <PenIcon />
              </DraggableItem>
              <DraggableItem top="70%" left="20%" rotate={6} delay={0.46} constraintsRef={drawerRef} labelText="mint tin">
                <MintTinIcon />
              </DraggableItem>
              <DraggableItem top="4%" left="58%" rotate={-4} delay={0.52} constraintsRef={drawerRef} labelText="snack">
                <SnackIcon />
              </DraggableItem>
              <DraggableItem top="36%" left="4%" rotate={12} delay={0.58} constraintsRef={drawerRef} labelText="highlighter">
                <HighlighterIcon color={DUSTY.mustard} seedBase={41} />
              </DraggableItem>
              <DraggableItem top="42%" left="88%" rotate={-14} delay={0.64} constraintsRef={drawerRef} labelText="highlighter">
                <HighlighterIcon color={DUSTY.lavender} seedBase={51} />
              </DraggableItem>
            </>
          )}

          <AnimatePresence>
            {openIdeaData && (
              <DetailOverlay
                idea={openIdeaData}
                frameColor={frameColors[openIdeaIndex % frameColors.length]}
                onClose={() => setOpenIdea(null)}
              />
            )}
          </AnimatePresence>
      </motion.div>
    </main>
  );
}
