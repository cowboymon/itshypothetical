import { Link } from "react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  deleteProject,
  fetchProjects,
  saveProject,
  uploadProjectImage,
  type DetailField,
  type ProjectRow,
  type Review,
  type Screenshot,
} from "../lib/projects";

const INK = "#2b2318";
const PAPER = "#efe6d2";
const BORDER = "#c3b291";
const MUTED = "#8a7a5c";
const RUST = "#a4522c";

const STATUS_OPTIONS = ["Live", "In beta", "In validation", "In concept", "In dev", "Wrapped"];

function blankRow(sortOrder: number): ProjectRow {
  return {
    id: "",
    slug: "",
    name: "",
    tagline: "",
    description: "",
    long_description: "",
    status: "In concept",
    has_page: true,
    cta_label: "",
    cta_href: "#",
    problem: "",
    how_it_works: [],
    screenshots_heading: "In the app",
    screenshots: [],
    example_heading: "",
    example_quotes: [],
    reviews: [],
    details: [],
    sort_order: sortOrder,
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span style={{ fontSize: 11, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase" }}>{label}</span>
      {hint && <span style={{ fontSize: 11, color: MUTED }}>{hint}</span>}
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  background: "#fff",
  padding: "8px 10px",
  fontSize: 14,
  color: INK,
  width: "100%",
};

function parseLines(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

function parseDetails(text: string): DetailField[] {
  return parseLines(text).map((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return { label: line, value: "" };
    return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
  });
}
function stringifyDetails(items: DetailField[]): string {
  return items.map((d) => `${d.label}: ${d.value}`).join("\n");
}

function parseReviews(text: string): Review[] {
  return parseLines(text).map((line) => {
    const idx = line.lastIndexOf(" — ");
    if (idx === -1) return { quote: line };
    return { quote: line.slice(0, idx).trim(), author: line.slice(idx + 3).trim() };
  });
}
function stringifyReviews(items: Review[]): string {
  return items.map((r) => (r.author ? `${r.quote} — ${r.author}` : r.quote)).join("\n");
}

function ProjectEditor({
  row,
  onSaved,
  onDeleted,
}: {
  row: ProjectRow;
  onSaved: (row: ProjectRow) => void;
  onDeleted: (id: string) => void;
}) {
  const [draft, setDraft] = useState(row);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !row.id;

  function set<K extends keyof ProjectRow>(key: K, value: ProjectRow[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...draft, cta_label: draft.cta_label?.trim() ? draft.cta_label : null };
      if (!payload.id) delete (payload as Partial<ProjectRow>).id;
      const saved = await saveProject(payload);
      setDraft(saved);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!row.id) return;
    if (!confirm(`Delete "${draft.name || draft.slug}"? This can't be undone.`)) return;
    try {
      await deleteProject(row.id);
      onDeleted(row.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  async function addScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProjectImage(file);
      const next: Screenshot[] = [...draft.screenshots, { src: url, alt: "" }];
      set("screenshots", next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload screenshot.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function updateScreenshotAlt(i: number, alt: string) {
    const next = draft.screenshots.slice();
    next[i] = { ...next[i], alt };
    set("screenshots", next);
  }

  function removeScreenshot(i: number) {
    set("screenshots", draft.screenshots.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-3 p-5" style={{ border: `1px solid ${BORDER}`, background: "#faf6ea" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Slug">
          <input style={inputStyle} value={draft.slug} onChange={(e) => set("slug", e.target.value)} placeholder="loud-and-fine" />
        </Field>
        <Field label="Name">
          <input style={inputStyle} value={draft.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Status">
          <select style={inputStyle} value={draft.status} onChange={(e) => set("status", e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Sort order">
          <input
            type="number"
            style={inputStyle}
            value={draft.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={draft.has_page} onChange={(e) => set("has_page", e.target.checked)} />
        <span style={{ fontSize: 13, color: INK }}>Has its own page (unchecked = card only, not clickable, no route)</span>
      </label>

      <Field label="Tagline">
        <input style={inputStyle} value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </Field>
      <Field label="Card description (short, shown on the homepage grid)">
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>
      <Field label="Long description (shown under the title on the project page)">
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
          value={draft.long_description}
          onChange={(e) => set("long_description", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="CTA button label (blank = no button)">
          <input style={inputStyle} value={draft.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} placeholder="Join the waitlist" />
        </Field>
        <Field label="CTA link">
          <input style={inputStyle} value={draft.cta_href} onChange={(e) => set("cta_href", e.target.value)} placeholder="# or https://..." />
        </Field>
      </div>

      <Field label="The problem">
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={draft.problem}
          onChange={(e) => set("problem", e.target.value)}
        />
      </Field>

      <Field label="How it works" hint="One step per line">
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
          value={draft.how_it_works.join("\n")}
          onChange={(e) => set("how_it_works", parseLines(e.target.value))}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Screenshots heading">
          <input style={inputStyle} value={draft.screenshots_heading} onChange={(e) => set("screenshots_heading", e.target.value)} />
        </Field>
        <Field label="Example-quotes heading (blank = section hidden)">
          <input style={inputStyle} value={draft.example_heading} onChange={(e) => set("example_heading", e.target.value)} placeholder="What a review looks like" />
        </Field>
      </div>

      <Field label="Example quotes" hint="One per line — only shows if a heading above is set">
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
          value={draft.example_quotes.join("\n")}
          onChange={(e) => set("example_quotes", parseLines(e.target.value))}
        />
      </Field>

      <Field label="Screenshots">
        <div className="flex flex-col gap-2">
          {draft.screenshots.map((s, i) => (
            <div key={i} className="flex items-center gap-3 flex-wrap">
              <img src={s.src} alt="" style={{ width: 44, height: 44, objectFit: "cover", border: `1px solid ${BORDER}` }} />
              <input
                style={{ ...inputStyle, width: 240 }}
                value={s.alt}
                placeholder="alt text"
                onChange={(e) => updateScreenshotAlt(i, e.target.value)}
              />
              <button type="button" onClick={() => removeScreenshot(i)} className="cursor-pointer" style={{ fontSize: 12, color: MUTED, textDecoration: "underline" }}>
                remove
              </button>
            </div>
          ))}
          <input type="file" accept="image/*" onChange={addScreenshot} disabled={uploading} />
        </div>
      </Field>

      <Field label="Reviews" hint="One per line, as: quote — author (author optional)">
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={stringifyReviews(draft.reviews)}
          onChange={(e) => set("reviews", parseReviews(e.target.value))}
        />
      </Field>

      <Field label="Details sidebar" hint="One per line, as: Label: Value">
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={stringifyDetails(draft.details)}
          onChange={(e) => set("details", parseDetails(e.target.value))}
        />
      </Field>

      {error && <p style={{ color: RUST, fontSize: 13 }}>{error}</p>}

      <div className="flex items-center gap-4 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="cursor-pointer"
          style={{ background: INK, color: PAPER, padding: "9px 20px", fontSize: 13, letterSpacing: "0.08em" }}
        >
          {saving ? "Saving…" : isNew ? "Add project" : "Save"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            className="cursor-pointer"
            style={{ color: RUST, fontSize: 13, textDecoration: "underline" }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else onSignedIn();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
      <Field label="Email">
        <input type="email" required style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password">
        <input type="password" required style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && <p style={{ color: RUST, fontSize: 13 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer mt-2"
        style={{ background: INK, color: PAPER, padding: "10px 20px", fontSize: 13, letterSpacing: "0.08em" }}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function ProjectsEditor() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  function loadRows() {
    fetchProjects()
      .then(setRows)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load projects."));
  }

  useEffect(() => {
    if (session) loadRows();
  }, [session]);

  function handleSaved(saved: ProjectRow) {
    setRows((prev) => {
      if (!prev) return prev;
      const exists = prev.some((r) => r.id === saved.id);
      return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved];
    });
  }

  function handleDeleted(id: string) {
    setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
  }

  return (
    <main style={{ background: PAPER, minHeight: "100dvh" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-xs hover:opacity-70 transition-opacity uppercase" style={{ letterSpacing: "0.14em", color: MUTED }}>
          ← the site
        </Link>
        <h1 className="mt-4 text-3xl" style={{ color: INK, fontWeight: 600 }}>
          Edit projects
        </h1>

        {session === undefined ? null : !session ? (
          <div className="mt-8 flex justify-center">
            <LoginForm onSignedIn={loadRows} />
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p style={{ fontSize: 13, color: MUTED }}>Signed in as {session.user.email}</p>
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="cursor-pointer"
                style={{ fontSize: 13, color: MUTED, textDecoration: "underline" }}
              >
                Sign out
              </button>
            </div>

            {loadError && <p style={{ color: RUST, fontSize: 13 }}>{loadError}</p>}

            {rows === null ? (
              <p style={{ fontSize: 13, color: MUTED }}>Loading…</p>
            ) : (
              <>
                <div>
                  <p className="mb-2" style={{ fontSize: 11, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase" }}>
                    Add a new project
                  </p>
                  <ProjectEditor
                    key={`new-${rows.length}`}
                    row={blankRow(rows.length)}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                  />
                </div>

                <div className="mt-2">
                  <p className="mb-2" style={{ fontSize: 11, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase" }}>
                    Existing projects
                  </p>
                  <div className="flex flex-col gap-6">
                    {rows
                      .slice()
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((row) => (
                        <ProjectEditor key={row.id} row={row} onSaved={handleSaved} onDeleted={handleDeleted} />
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
