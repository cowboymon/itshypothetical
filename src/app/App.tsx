import { HashRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router";
import React, { useEffect, useState } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import JunkDrawer from "./JunkDrawer";
import IdeaBedEditor from "./IdeaBedEditor";
import ProjectsEditor from "./ProjectsEditor";
import { fetchProjects, type ProjectRow } from "../lib/projects";

// ─── Data ────────────────────────────────────────────────────────────────────

export const statusStyle: Record<string, string> = {
  "Live": "bg-[#1C1A17] text-[#F8F5F0]",
  "In beta": "bg-[#6E7F6B] text-[#F8F5F0]",
  "In validation": "bg-[#C4845A] text-[#F8F5F0]",
  "In concept": "bg-[#E4E0DA] text-[#7A7368]",
  "In dev": "bg-[#9C8B6E] text-[#F8F5F0]",
  "Wrapped": "bg-[#7C8798] text-[#F8F5F0]",
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

  if (pathname.startsWith("/the-idea-bed") || pathname.startsWith("/projects/edit")) return null;

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

function Footer({ nextProject }: { nextProject?: ProjectRow }) {
  return (
    <footer className="border-t border-border mt-16">
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
              <Link to="/the-idea-bed" className="text-xs text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: "Comico, sans-serif" }}>The Idea Bed</Link>
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
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProjects()
      .then((rows) => {
        if (!cancelled) setProjects(rows);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load projects.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="min-h-[92vh] flex flex-col justify-end pb-20 pt-32 max-w-5xl mx-auto px-6">
        <p className="font-[General_Sans] text-xs tracking-[0.18em] text-muted-foreground mb-8 uppercase">
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
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-12 inline-flex items-center gap-2 text-sm font-[General_Sans] text-foreground border-b border-foreground pb-0.5 w-fit hover:text-accent hover:border-accent transition-colors duration-200"
        >
          See what's real ↓
        </a>

        {/* Decorative rule */}
        <div className="mt-20 w-full h-px bg-border" />
      </section>

      {/* Project grid */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-[Gambarino] text-4xl sm:text-5xl text-foreground mb-16">
          The family
        </h2>

        {loadError ? (
          <p className="font-[General_Sans] text-sm text-muted-foreground">Couldn't load projects — {loadError}</p>
        ) : projects === null ? (
          <p className="font-[General_Sans] text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        )}
      </section>

      {/* About strip */}
      <section id="about" className="bg-card border-y border-border py-16">
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

function ProjectCard({ project }: { project: ProjectRow }) {
  const hasPage = project.has_page !== false;

  const content = (
    <>
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
          className={`shrink-0 mt-1 inline-block font-[General_Sans] font-medium text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${statusStyle[project.status] ?? statusStyle["In concept"]}`}
        >
          {project.status}
        </span>
      </div>

      <p className="font-[General_Sans] font-light text-sm text-muted-foreground leading-relaxed flex-1">
        {project.description}
      </p>

      {hasPage && (
        <span className="text-xs font-[General_Sans] text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5">
          See project <span className="transition-transform duration-200 group-hover:translate-x-0.5 inline-block">→</span>
        </span>
      )}
    </>
  );

  if (!hasPage) {
    return (
      <div className="bg-background p-8 sm:p-10 flex flex-col gap-5 min-h-[240px]">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/${project.slug}`}
      className="group bg-background p-8 sm:p-10 flex flex-col gap-5 hover:bg-card transition-colors duration-200 min-h-[240px]"
    >
      {content}
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
      <span className="font-[General_Sans] font-medium text-xs text-muted-foreground uppercase tracking-[0.12em] shrink-0">{label}</span>
      <span className="font-[General_Sans] text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

function HowItWorksItem({ text, index }: { text: string; index: number }) {
  return (
    <div className="flex gap-5 items-start py-4 border-b border-border last:border-0">
      <span className="font-[General_Sans] font-medium text-xs text-muted-foreground tabular-nums pt-0.5 w-5 shrink-0">
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
  const isExternal = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
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
      <h2 className="font-[General_Sans] font-medium text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">Reviews</h2>
      <div className="space-y-6">
        {items.map((r, i) => (
          <div key={i} className="border-b border-border pb-6 last:border-0">
            <p className="font-[General_Sans] font-light text-base text-foreground leading-relaxed">"{r.quote}"</p>
            {r.author && (
              <p className="font-[General_Sans] font-medium text-xs text-muted-foreground uppercase tracking-[0.12em] mt-3">{r.author}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Project detail page (generic — shared by every project) ─────────────────

function ProjectPage() {
  const { slug } = useParams();
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProjects()
      .then((rows) => {
        if (!cancelled) setProjects(rows);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load project.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <main className="max-w-5xl mx-auto px-6 pt-32">
        <p className="font-[General_Sans] text-sm text-muted-foreground">Couldn't load this project — {loadError}</p>
      </main>
    );
  }

  if (projects === null) {
    return (
      <main className="max-w-5xl mx-auto px-6 pt-32">
        <p className="font-[General_Sans] text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const project = projects.find((p) => p.slug === slug && p.has_page);
  if (!project) {
    return (
      <main className="max-w-5xl mx-auto px-6 pt-32">
        <BackLink />
        <p className="font-[General_Sans] text-sm text-muted-foreground mt-8">That project doesn't exist (yet).</p>
      </main>
    );
  }

  const pageProjects = projects.filter((p) => p.has_page).sort((a, b) => a.sort_order - b.sort_order);
  const nextProject = pageProjects[pageProjects.findIndex((p) => p.slug === project.slug) + 1];

  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-0">
        <BackLink />

        <div className="mt-12 pb-16 border-b border-border">
          <span className={`font-[General_Sans] font-medium text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 ${statusStyle[project.status] ?? statusStyle["In concept"]} mb-6 inline-block`}>
            {project.status}
          </span>
          <h1 className="font-[Gambarino] text-5xl sm:text-7xl lg:text-8xl text-foreground leading-[1.02] mt-3">
            {project.name}
          </h1>
          <p className="font-[Gambarino] text-2xl sm:text-3xl text-muted-foreground mt-3">
            {project.tagline}
          </p>
          {project.long_description && (
            <p className="font-[General_Sans] font-light text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
              {project.long_description}
            </p>
          )}
          {project.cta_label && (
            <div className="mt-8">
              <ProjectCTA label={project.cta_label} href={project.cta_href} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 py-20">
          <div className="space-y-16">
            {project.problem && (
              <section>
                <h2 className="font-[General_Sans] font-medium text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">The problem</h2>
                <p className="font-[General_Sans] font-light text-base sm:text-lg text-foreground leading-relaxed">
                  {project.problem}
                </p>
              </section>
            )}

            {project.how_it_works.length > 0 && (
              <section>
                <h2 className="font-[General_Sans] font-medium text-xs tracking-[0.18em] text-muted-foreground uppercase mb-2">How it works</h2>
                {project.how_it_works.map((step, i) => (
                  <HowItWorksItem key={i} text={step} index={i} />
                ))}
              </section>
            )}

            {project.screenshots.length > 0 && (
              <section>
                <h2 className="font-[General_Sans] font-medium text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">{project.screenshots_heading}</h2>
                <Screenshots images={project.screenshots} />
              </section>
            )}

            {project.example_quotes.length > 0 && (
              <section>
                <h2 className="font-[General_Sans] font-medium text-xs tracking-[0.18em] text-muted-foreground uppercase mb-6">{project.example_heading}</h2>
                <div className="space-y-4">
                  {project.example_quotes.map((q, i) => (
                    <QuoteBlock key={i}>{q}</QuoteBlock>
                  ))}
                </div>
              </section>
            )}

            <Reviews items={project.reviews} />
          </div>

          {(project.details.length > 0 || project.cta_label) && (
            <aside>
              {project.details.length > 0 && (
                <>
                  <h2 className="font-[General_Sans] font-medium text-xs tracking-[0.18em] text-muted-foreground uppercase mb-4">Details</h2>
                  <div className="bg-card p-6 border border-border">
                    {project.details.map((d, i) => (
                      <DetailRow key={i} label={d.label} value={d.value} />
                    ))}
                  </div>
                </>
              )}
              {project.cta_label && (
                <div className="mt-8">
                  <ProjectCTA label={project.cta_label} href={project.cta_href} />
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
      <Footer nextProject={nextProject} />
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
        <Route path="/the-idea-bed" element={<JunkDrawer />} />
        <Route path="/the-idea-bed/edit" element={<IdeaBedEditor />} />
        <Route path="/projects/edit" element={<ProjectsEditor />} />
        <Route path="/:slug" element={<ProjectPage />} />
      </Routes>
    </HashRouter>
  );
}
