import { Link } from "react-router";
import { motion } from "motion/react";
import { useRef } from "react";

// ─── Junk drawer — trashed ideas + assorted drawer debris ─────────────────────
// Deliberately messier than the rest of the site: scattered, rotated, draggable.

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

function PenIcon() {
  return (
    <svg width="92" height="22" viewBox="0 0 92 22" fill="none">
      <rect x="2" y="8" width="66" height="7" rx="3.5" fill="#1C1A17" />
      <rect x="2" y="8" width="12" height="7" rx="3.5" fill="#7A7368" />
      <path d="M68 6 L88 11 L68 16 Z" fill="#C4845A" />
    </svg>
  );
}

function MintTinIcon() {
  return (
    <svg width="86" height="58" viewBox="0 0 86 58" fill="none">
      <rect x="2" y="2" width="82" height="54" rx="10" fill="#E4E0DA" stroke="#1C1A17" strokeWidth="1.5" />
      <rect x="2" y="2" width="82" height="19" rx="9" fill="#C4845A" />
      <text x="43" y="15" fontSize="8" fill="#F8F5F0" textAnchor="middle" fontFamily="DM Mono, monospace" letterSpacing="1">
        MINTS
      </text>
      <circle cx="20" cy="38" r="3" fill="#F8F5F0" stroke="#C4845A" strokeWidth="1" />
      <circle cx="32" cy="38" r="3" fill="#F8F5F0" stroke="#C4845A" strokeWidth="1" />
      <circle cx="44" cy="38" r="3" fill="#F8F5F0" stroke="#C4845A" strokeWidth="1" />
    </svg>
  );
}

function SnackIcon() {
  return (
    <svg width="94" height="48" viewBox="0 0 94 48" fill="none">
      <path d="M15 8 L2 2 L2 46 L15 40 Z" fill="#6E7F6B" />
      <rect x="15" y="4" width="64" height="40" rx="4" fill="#C4845A" />
      <path d="M79 8 L92 2 L92 46 L79 40 Z" fill="#6E7F6B" />
      <text x="47" y="28" fontSize="9" fill="#F8F5F0" textAnchor="middle" fontFamily="DM Mono, monospace" letterSpacing="1">
        SNACK
      </text>
    </svg>
  );
}

function HighlighterIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="94" viewBox="0 0 26 94" fill="none">
      <rect x="5" y="22" width="16" height="68" rx="4" fill={color} />
      <path d="M5 22 L13 2 L21 22 Z" fill="#1C1A17" />
      <rect x="8" y="74" width="10" height="12" rx="2" fill="#F8F5F0" />
    </svg>
  );
}

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
      whileDrag={{ scale: 1.06, zIndex: 40, boxShadow: "0 12px 28px rgba(0,0,0,0.18)" }}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: -40, rotate: 0, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, rotate, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
}

function IdeaCard({ idea }: { idea: TrashedIdea }) {
  return (
    <div className="w-56 sm:w-64 bg-[#FBF3DC] border border-[#E4D9B0] shadow-[0_6px_16px_rgba(0,0,0,0.12)] p-5">
      <span className="font-[DM_Mono] text-[9px] tracking-[0.14em] uppercase text-[#C4845A]">Trashed</span>
      <h3 className="font-[Gambarino] text-lg text-foreground mt-1">{idea.title}</h3>
      <p className="font-[General_Sans] font-light text-sm text-muted-foreground mt-2 leading-relaxed">
        {idea.note}
      </p>
    </div>
  );
}

export default function JunkDrawer() {
  const drawerRef = useRef<HTMLDivElement>(null);

  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5 inline-block">←</span>
          All projects
        </Link>

        <div className="mt-12 pb-16 border-b border-border">
          <p className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground mb-4 uppercase">
            Everything that didn't make it
          </p>
          <h1 className="font-[Gambarino] text-5xl sm:text-7xl text-foreground leading-[1.02]">
            The junk drawer.
          </h1>
          <p className="font-[General_Sans] font-light text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
            Ideas that got as far as a name and then didn't. Drag stuff around — it's a drawer, that's what it's for.
          </p>
        </div>
      </div>

      {/* The drawer itself — deliberately messier than the rest of the site */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          ref={drawerRef}
          className="relative w-full min-w-[880px] h-[760px] bg-[#EFE9DF] border border-[#D8CFBE] rounded-sm overflow-hidden"
          style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.08)" }}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Drawer front sliding open on load */}
          <motion.div
            className="absolute inset-0 z-50 bg-[#1C1A17] flex items-end justify-center pb-6"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="w-24 h-2 rounded-full bg-[#7A7368]" />
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
              <IdeaCard idea={idea} />
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
            <HighlighterIcon color="#F2C744" />
          </DraggableItem>
          <DraggableItem top="42%" left="88%" rotate={-14} delay={1.34} constraintsRef={drawerRef}>
            <HighlighterIcon color="#E8749A" />
          </DraggableItem>
        </motion.div>
      </div>
    </main>
  );
}
