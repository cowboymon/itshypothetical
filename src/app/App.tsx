import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router";
import React, { useEffect, useState } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: "Live" | "In beta" | "In validation" | "In concept";
}

// ─── Data ────────────────────────────────────────────────────────────────────

const projects: Project[] = [
  {
    slug: "loud-and-fine",
    name: "Loud & Fine",
    tagline: "Loud world. Fine dog.",
    description: "Sound desensitization for anxious dogs — no trainer required, several treats required.",
    status: "In beta",
  },
  {
    slug: "quirks-and-all",
    name: "Quirks & All",
    tagline: "Away, but known.",
    description: "Every weird habit your dog has, written down and handed off on purpose.",
    status: "In beta",
  },
  {
    slug: "reach",
    name: "Reach",
    tagline: "Alone, not lost.",
    description: "A loneliness app — because knowing you're not alone shouldn't take this much effort.",
    status: "In validation",
  },
  {
    slug: "straightforward-review",
    name: "Straightforward Review",
    tagline: "Thumbs up or don't bother.",
    description: "Reviews in two sentences or less. You already know what you want — this just confirms it.",
    status: "Live",
  },
];

const statusStyle: Record<string, string> = {
  "Live": "bg-[#1C1A17] text-[#F8F5F0]",
  "In beta": "bg-[#6E7F6B] text-[#F8F5F0]",
  "In validation": "bg-[#C4845A] text-[#F8F5F0]",
  "In concept": "bg-[#E4E0DA] text-[#7A7368]",
};

// ─── Scroll to top on route change ───────────────────────────────────────────

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-[Gambarino] text-lg text-foreground hover:text-accent transition-colors duration-200"
        >
          It's Hypothetical
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-8">
          <NavLink section="projects" label="Projects" />
          <NavLink section="about" label="About" />
          <a
            href="mailto:hello@itshypothetical.com"
            className="text-sm font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Contact
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {open ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
          <NavLink section="projects" label="Projects" />
          <NavLink section="about" label="About" />
          <a href="mailto:hello@itshypothetical.com" className="text-sm font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>
      )}
    </nav>
  );
}

function NavLink({ section, label }: { section: string; label: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  return (
    <a
      href={`#${section}`}
      onClick={handleClick}
      className="text-sm font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors duration-200"
    >
      {label}
    </a>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer({ nextProject }: { nextProject?: Project }) {
  return (
    <footer className="border-t border-border mt-32">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <a
              href="https://itshypothetical.com"
              className="font-[Gambarino] text-base text-foreground hover:text-accent transition-colors"
            >
              It's Hypothetical
            </a>
            <p className="text-xs font-[General_Sans] text-muted-foreground mt-1">
              Built in Sydney. Mostly at hours I'm not proud of.
            </p>
          </div>

          {nextProject ? (
            <Link
              to={`/${nextProject.slug}`}
              className="group flex items-center gap-2 text-sm font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors"
            >
              Next: {nextProject.name}
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          ) : (
            <div className="flex gap-6">
              <Link to="/" className="text-xs font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
              <Link to="/" className="text-xs font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <a href="mailto:hello@itshypothetical.com" className="text-xs font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <a href="https://www.linkedin.com/in/monica-rattanong/" target="_blank" rel="noopener noreferrer" className="text-xs font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// ─── Homepage ────────────────────────────────────────────────────────────────

function Homepage() {
  return (
    <main>
      {/* Hero */}
      <section className="min-h-[92vh] flex flex-col justify-end pb-20 pt-32 max-w-5xl mx-auto px-6">
        <p className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground mb-8 uppercase">
          A studio of small, useful ideas
        </p>
        <h1 className="font-[Gambarino] text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.02] max-w-4xl">
          Every idea starts as a hypothetical.
        </h1>
        <p className="font-[General_Sans] text-lg sm:text-xl text-muted-foreground mt-8 max-w-xl leading-relaxed font-light">
          I build the ones that hold up outside my head. Fewer than you'd think.
        </p>
        <a
          href="#projects"
          className="mt-12 inline-flex items-center gap-2 text-sm font-[General_Sans] text-foreground border-b border-foreground pb-0.5 w-fit hover:text-accent hover:border-accent transition-colors duration-200"
        >
          See what's real ↓
        </a>

        {/* Decorative rule */}
        <div className="mt-20 w-full h-px bg-border" />
      </section>

      {/* Project grid */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="font-[Gambarino] text-4xl sm:text-5xl text-foreground mb-16">
          The family
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* About strip */}
      <section id="about" className="bg-card border-y border-border py-24">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <div>
            <h2 className="font-[Gambarino] text-4xl sm:text-5xl text-foreground leading-tight">
              What this actually is
            </h2>
          </div>
          <div className="space-y-6 font-[General_Sans] font-light text-base sm:text-lg text-foreground leading-relaxed max-w-2xl">
            <p>
              I test ideas before I build them. Most don't make it — turns out "this seems useful" and "I would actually pay for this" are two very different sentences. The ones on this page passed. Barely, in one case.
            </p>
            <p>
              I'm not a studio in the twelve-people-and-a-Slack-status sense. It's mostly me, a notes app full of half-formed things, and an unreasonable interest in whether an idea is actually good or I just like the name I came up with for it.
            </p>
            <p className="text-muted-foreground text-sm font-[Gambarino]">
              "Some ideas here started as a real problem I kept hitting. One started because I liked the name more than the concept. I'll let you guess which."
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/${project.slug}`}
      className="group bg-background p-8 sm:p-10 flex flex-col gap-5 hover:bg-card transition-colors duration-200 min-h-[240px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-[Gambarino] text-2xl sm:text-3xl text-foreground group-hover:text-accent transition-colors duration-200">
            {project.name}
          </h3>
          <p className="font-[Gambarino] text-muted-foreground text-base mt-0.5">
            {project.tagline}
          </p>
        </div>
        <span
          className={`shrink-0 mt-1 inline-block font-[DM_Mono] text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${statusStyle[project.status]}`}
        >
          {project.status}
        </span>
      </div>

      <p className="font-[General_Sans] font-light text-sm text-muted-foreground leading-relaxed flex-1">
        {project.description}
      </p>

      <span className="text-xs font-[General_Sans] text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5">
        See project <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">→</span>
      </span>
    </Link>
  );
}

// ─── Reusable project page components ────────────────────────────────────────

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm font-[General_Sans] text-muted-foreground hover:text-foreground transition-colors duration-200 group"
    >
      <span className="transition-transform duration-200 group-hover:-translate-x-0.5 inline-block">←</span>
      All projects
    </Link>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b border-border last:border-0 gap-8">
      <span className="font-[DM_Mono] text-xs text-muted-foreground uppercase tracking-[0.12em] shrink-0">{label}</span>
      <span className="font-[General_Sans] text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

function HowItWorksItem({ text, index }: { text: string; index: number }) {
  return (
    <div className="flex gap-5 items-start py-4 border-b border-border last:border-0">
      <span className="font-[DM_Mono] text-xs text-muted-foreground tabular-nums pt-0.5 w-5 shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className="font-[General_Sans] font-light text-base text-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function QuoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-accent pl-6 my-2">
      <p className="font-[Gambarino] text-xl sm:text-2xl text-foreground leading-snug">
        {children}
      </p>
    </blockquote>
  );
}

function ProjectCTA({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 bg-foreground text-primary-foreground font-[General_Sans] text-sm px-6 py-3 hover:bg-accent transition-colors duration-200"
    >
      {label}
    </a>
  );
}

// Screenshots for a project's "In the app" section.
// Leave `images` empty to turn this off — nothing renders until screenshots exist.
function Screenshots({ images }: { images?: { src: string; alt: string }[] }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 mt-6">
      {images.map((img, i) => (
        <div
          key={i}
          className="shrink-0 w-40 sm:w-48 aspect-[9/19.5] bg-card border border-border overflow-hidden"
        >
          <ImageWithFallback src={img.src} alt={img.alt} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

// User/press reviews for a project. Leave `items` empty to turn this section off per page —
// the whole section (heading included) disappears until reviews are added.
function Reviews({ items }: { items?: { quote: string; author?: string }[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">Reviews</h2>
      <div className="space-y-6">
        {items.map((r, i) => (
          <div key={i} className="border-b border-border pb-6 last:border-0">
            <p className="font-[General_Sans] font-light text-base text-foreground leading-relaxed">"{r.quote}"</p>
            {r.author && (
              <p className="font-[DM_Mono] text-xs text-muted-foreground uppercase tracking-[0.12em] mt-3">{r.author}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Loud & Fine ─────────────────────────────────────────────────────────────

// Placeholder screenshots/reviews — swap for the real ones before shipping
const loudAndFineScreenshots: { src: string; alt: string }[] = [
  { src: "https://picsum.photos/seed/loud-and-fine-1/300/650", alt: "Loud & Fine app screenshot — sound picker" },
  { src: "https://picsum.photos/seed/loud-and-fine-2/300/650", alt: "Loud & Fine app screenshot — session in progress" },
  { src: "https://picsum.photos/seed/loud-and-fine-3/300/650", alt: "Loud & Fine app screenshot — progress tracking" },
];
const loudAndFineReviews: { quote: string; author?: string }[] = [
  { quote: "My dog used to hide in the bathtub every time it thundered. Now he just glances at the window.", author: "Sarah, and a much calmer beagle" },
  { quote: "Wish this existed before the fireworks incident of 2023. We're rebuilding trust, slowly.", author: "Marcus" },
  { quote: "$2.99 and no subscription almost made me suspicious. It just works.", author: "Priya" },
];

function LoudAndFine() {
  const nextProject = projects[1];
  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-0">
        <BackLink />

        <div className="mt-12 pb-16 border-b border-border">
          <span className={`font-[DM_Mono] text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${statusStyle["In beta"]} mb-6 inline-block`}>
            In beta
          </span>
          <h1 className="font-[Gambarino] text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.02] mt-3">
            Loud & Fine
          </h1>
          <p className="font-[Gambarino] text-2xl sm:text-3xl text-muted-foreground mt-3">
            Loud world. Fine dog.
          </p>
          <p className="font-[General_Sans] font-light text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
            Systematic sound desensitization for dogs who lose it at vacuums, thunder, fireworks, and the doorbell. $2.99 once. No subscription. No ads.
          </p>
          <div className="mt-8">
            <ProjectCTA label="Join the waitlist" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 py-20">
          <div className="space-y-16">
            {/* Problem */}
            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">The problem</h2>
              <p className="font-[General_Sans] font-light text-base sm:text-lg text-foreground leading-relaxed">
                Most dogs who panic at loud noises aren't broken — they just haven't been introduced to the sound on their terms. The existing tools for this are built like they're from 2013, because they are. Loud & Fine does the same proven method (systematic desensitization) without making you read a manual first.
              </p>
            </section>

            {/* How it works */}
            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-2">How it works</h2>
              {[
                "Pick the sound your dog struggles with — vacuum, storm, fireworks, clippers, crying baby",
                "Play it at a volume they can handle, reward them, repeat",
                "The app tracks progress so you know when to turn it up",
                "No account, no cloud, no data leaving your phone",
              ].map((step, i) => <HowItWorksItem key={i} text={step} index={i} />)}
            </section>

            {/* Voice sample */}
            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">In the app</h2>
              <Screenshots images={loudAndFineScreenshots} />
            </section>

            <Reviews items={loudAndFineReviews} />
          </div>

          {/* Details */}
          <aside>
            <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-4">Details</h2>
            <div className="bg-card p-6 border border-border">
              <DetailRow label="Price" value="$2.99 one-time" />
              <DetailRow label="Platform" value="iOS" />
              <DetailRow label="Data" value="100% on-device" />
              <DetailRow label="Tone" value="Cool vet nurse — warm, deadpan" />
            </div>
            <div className="mt-8">
              <ProjectCTA label="Join the waitlist" />
            </div>
          </aside>
        </div>
      </div>
      <Footer nextProject={nextProject} />
    </main>
  );
}

// ─── Quirks & All ────────────────────────────────────────────────────────────

// Placeholder screenshots/reviews — swap for the real ones before shipping
const quirksAndAllScreenshots: { src: string; alt: string }[] = [
  { src: "https://picsum.photos/seed/quirks-and-all-1/300/650", alt: "Quirks & All app screenshot — dog profile" },
  { src: "https://picsum.photos/seed/quirks-and-all-2/300/650", alt: "Quirks & All app screenshot — share link presets" },
  { src: "https://picsum.photos/seed/quirks-and-all-3/300/650", alt: "Quirks & All app screenshot — missing poster generator" },
];
const quirksAndAllReviews: { quote: string; author?: string }[] = [
  { quote: "My sitter texted back 'this is the best handoff doc I've ever gotten.' Weirdly proud of that.", author: "Jamie" },
  { quote: "Finally a way to explain that 'off' means off the couch, not off the bed.", author: "Theo" },
  { quote: "Haven't needed the missing poster generator. Comforting that it's there.", author: "Dana" },
];

function QuirksAndAll() {
  const nextProject = projects[2];
  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-0">
        <BackLink />

        <div className="mt-12 pb-16 border-b border-border">
          <span className={`font-[DM_Mono] text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${statusStyle["In beta"]} mb-6 inline-block`}>
            In beta
          </span>
          <h1 className="font-[Gambarino] text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.02] mt-3">
            Quirks & All
          </h1>
          <p className="font-[Gambarino] text-2xl sm:text-3xl text-muted-foreground mt-3">
            Away, but known.
          </p>
          <p className="font-[General_Sans] font-light text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
            The pet-care handoff doc your sitter actually reads — quirks, commands, and the one thing to know if things go sideways.
          </p>
          <div className="mt-8">
            <ProjectCTA label="Get it on the App Store" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 py-20">
          <div className="space-y-16">
            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">The problem</h2>
              <p className="font-[General_Sans] font-light text-base sm:text-lg text-foreground leading-relaxed">
                Handing your dog off to a sitter usually means a rushed text, a half-remembered command list, and hoping for the best. Quirks & All turns that into one link: what your dog's actually like, what commands mean what, and a one-tap missing-poster generator you hope you never need.
              </p>
            </section>

            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-2">How it works</h2>
              {[
                "Build your dog's profile once — quirks, commands, routines",
                "Generate a share link with a preset (Walk / Stay / Full) for whoever's looking after them",
                "Sitters see exactly what they need, nothing they don't",
                "If commands drift out of date, the app nudges you to check",
              ].map((step, i) => <HowItWorksItem key={i} text={step} index={i} />)}
            </section>

            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">In the app</h2>
              <div className="space-y-4">
                <QuoteBlock>Still using "settle" with Biscuit? Still accurate?</QuoteBlock>
                <QuoteBlock>One tap. Print-ready poster and social tile. Just in case.</QuoteBlock>
              </div>
              <Screenshots images={quirksAndAllScreenshots} />
            </section>

            <Reviews items={quirksAndAllReviews} />
          </div>

          <aside>
            <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-4">Details</h2>
            <div className="bg-card p-6 border border-border">
              <DetailRow label="Platform" value="iOS" />
              <DetailRow label="Model" value="Free to start" />
              <DetailRow label="Tone" value="Quirks are charming, not problems" />
            </div>
            <div className="mt-8">
              <ProjectCTA label="Get it on the App Store" />
            </div>
          </aside>
        </div>
      </div>
      <Footer nextProject={nextProject} />
    </main>
  );
}

// ─── Reach ───────────────────────────────────────────────────────────────────

const reachReviews: { quote: string; author?: string }[] = [];

function Reach() {
  const nextProject = projects[3];
  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-0">
        <BackLink />

        <div className="mt-12 pb-16 border-b border-border">
          <span className={`font-[DM_Mono] text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${statusStyle["In validation"]} mb-6 inline-block`}>
            In validation
          </span>
          <h1 className="font-[Gambarino] text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.02] mt-3">
            Reach
          </h1>
          <p className="font-[Gambarino] text-2xl sm:text-3xl text-muted-foreground mt-3">
            Alone, not lost.
          </p>
          <p className="font-[General_Sans] font-light text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
            A loneliness app. In validation right now — not yet built. Get notified when it's ready.
          </p>
          <div className="mt-8">
            <ProjectCTA label="Get notified when it's ready" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 py-20">
          <div className="space-y-16">
            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">The problem</h2>
              <p className="font-[General_Sans] font-light text-base sm:text-lg text-foreground leading-relaxed">
                Loneliness isn't usually about being alone — it's about the gap between wanting to reach out and actually doing it. Knowing you're not alone shouldn't take this much effort.
              </p>
            </section>

            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-2">How it works</h2>
              <p className="font-[General_Sans] font-light text-sm text-muted-foreground py-6 border-b border-border">
                Feature set is being validated. More soon.
              </p>
            </section>

            <Reviews items={reachReviews} />
          </div>

          <aside>
            <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-4">Details</h2>
            <div className="bg-card p-6 border border-border">
              <DetailRow label="Platform" value="TBD" />
              <DetailRow label="Status" value="In validation — not yet built" />
            </div>
            <div className="mt-8">
              <ProjectCTA label="Get notified when it's ready" />
            </div>
          </aside>
        </div>
      </div>
      <Footer nextProject={nextProject} />
    </main>
  );
}

// ─── Straightforward Review ───────────────────────────────────────────────────

const straightforwardReviewReviews: { quote: string; author?: string }[] = [];

function StraightforwardReview() {
  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-0">
        <BackLink />

        <div className="mt-12 pb-16 border-b border-border">
          <span className={`font-[DM_Mono] text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${statusStyle["Live"]} mb-6 inline-block`}>
            Live
          </span>
          <h1 className="font-[Gambarino] text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.02] mt-3">
            Straightforward<br className="hidden sm:block" /> Review
          </h1>
          <p className="font-[Gambarino] text-2xl sm:text-3xl text-muted-foreground mt-3">
            Thumbs up or don't bother.
          </p>
          <p className="font-[General_Sans] font-light text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
            Reviews in two sentences or less. One thumb, up or down. You already know if the place was good — this just makes it quick to say so, and quick to check.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 py-20">
          <div className="space-y-16">
            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">The problem</h2>
              <p className="font-[General_Sans] font-light text-base sm:text-lg text-foreground leading-relaxed">
                Most reviews are 300 words of someone re-litigating their evening. Nobody reads them, and nobody who writes them enjoys it either. You don't need a novel to know if a place is worth going — you need one honest signal from someone who's already been.
              </p>
            </section>

            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-2">How it works</h2>
              {[
                "See a place. Give it a thumb — up or down. No stars, no 1–10, no ambiguity.",
                "Add up to two sentences if you want to. Not required.",
                "Browsing: see the thumb split first, read the two-liners after — no scrolling through essays to find the one useful line.",
                "No profiles to build, no reviewer level, no badges. That's the whole product.",
              ].map((step, i) => <HowItWorksItem key={i} text={step} index={i} />)}
            </section>

            <section>
              <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">What a review looks like</h2>
              <div className="space-y-4">
                <QuoteBlock>Good. Loud on weekends though.</QuoteBlock>
                <QuoteBlock>Wouldn't go back. Kitchen closed at 8:45 when the sign says 9.</QuoteBlock>
              </div>
            </section>

            <Reviews items={straightforwardReviewReviews} />
          </div>

          <aside>
            <h2 className="font-[DM_Mono] text-xs tracking-[0.18em] text-muted-foreground uppercase mb-4">Details</h2>
            <div className="bg-card p-6 border border-border">
              <DetailRow label="Format" value="Thumbs up/down + 2 sentences" />
              <DetailRow label="Platform" value="TBD" />
              <DetailRow label="Status" value="Live" />
              <DetailRow label="Tone" value="Utility over charm" />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <HashRouter>
      <ScrollReset />
      <Nav />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/loud-and-fine" element={<LoudAndFine />} />
        <Route path="/quirks-and-all" element={<QuirksAndAll />} />
        <Route path="/reach" element={<Reach />} />
        <Route path="/straightforward-review" element={<StraightforwardReview />} />
      </Routes>
    </HashRouter>
  );
}
