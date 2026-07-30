import { Link } from "react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  deleteSpecimen,
  fetchSpecimens,
  saveSpecimen,
  uploadIconImage,
  uploadPlateImage,
  type SpecimenRow,
} from "../lib/specimens";

const INK = "#2b2318";
const PAPER = "#efe6d2";
const BORDER = "#c3b291";
const MUTED = "#8a7a5c";
const RUST = "#a4522c";

function nextSpecimenNo(rows: SpecimenRow[]): string {
  const nums = rows
    .map((r) => r.no.match(/^FD-(\d+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => parseInt(m[1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `FD-${String(next).padStart(2, "0")}`;
}

function blankRow(sortOrder: number, existingRows: SpecimenRow[]): SpecimenRow {
  return {
    id: "",
    no: nextSpecimenNo(existingRows),
    name: "",
    year: new Date().getFullYear(),
    tagline: "",
    blurb: "",
    reason: "",
    cause: "",
    image_url: null,
    sort_order: sortOrder,
    confidential: false,
    icon_url: null,
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span style={{ fontSize: 11, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase" }}>{label}</span>
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

function SpecimenEditor({
  row,
  onSaved,
  onDeleted,
}: {
  row: SpecimenRow;
  onSaved: (row: SpecimenRow) => void;
  onDeleted: (id: string) => void;
}) {
  const [draft, setDraft] = useState(row);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconMode, setIconMode] = useState<"random" | "custom">(row.icon_url ? "custom" : "random");
  const [error, setError] = useState<string | null>(null);
  const isNew = !row.id;

  function set<K extends keyof SpecimenRow>(key: K, value: SpecimenRow[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...draft };
      if (!payload.id) delete (payload as Partial<SpecimenRow>).id;
      const saved = await saveSpecimen(payload);
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
    if (!confirm(`Delete "${draft.name || draft.no}"? This can't be undone.`)) return;
    try {
      await deleteSpecimen(row.id);
      onDeleted(row.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadPlateImage(file);
      set("image_url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleIconImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    setError(null);
    try {
      const url = await uploadIconImage(file);
      set("icon_url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload icon.");
    } finally {
      setUploadingIcon(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 p-5" style={{ border: `1px solid ${BORDER}`, background: "#faf6ea" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="No.">
          <input style={inputStyle} value={draft.no} onChange={(e) => set("no", e.target.value)} placeholder="FD-11" />
        </Field>
        <Field label="Year">
          <input
            type="number"
            style={inputStyle}
            value={draft.year}
            onChange={(e) => set("year", Number(e.target.value))}
          />
        </Field>
        <Field label="Name">
          <input style={inputStyle} value={draft.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Cause of extinction">
          <input style={inputStyle} value={draft.cause} onChange={(e) => set("cause", e.target.value)} />
        </Field>
      </div>
      <Field label="Tagline">
        <input style={inputStyle} value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </Field>
      <Field label="Blurb">
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
          value={draft.blurb}
          onChange={(e) => set("blurb", e.target.value)}
        />
      </Field>
      <Field label="Reason (optional)">
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
          value={draft.reason ?? ""}
          onChange={(e) => set("reason", e.target.value)}
        />
      </Field>
      <Field label="Fossil icon">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`icon-mode-${row.id || "new"}`}
                checked={iconMode === "random"}
                onChange={() => {
                  setIconMode("random");
                  set("icon_url", null);
                }}
              />
              <span style={{ fontSize: 13, color: INK }}>Random fossil</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`icon-mode-${row.id || "new"}`}
                checked={iconMode === "custom"}
                onChange={() => setIconMode("custom")}
              />
              <span style={{ fontSize: 13, color: INK }}>Custom icon</span>
            </label>
          </div>
          {iconMode === "custom" && (
            <div className="flex items-center gap-3 flex-wrap">
              {draft.icon_url && (
                <img
                  src={draft.icon_url}
                  alt=""
                  style={{ width: 44, height: 44, objectFit: "contain", border: `1px solid ${BORDER}`, background: "#fff", padding: 4 }}
                />
              )}
              <input type="file" accept="image/*" onChange={handleIconImage} disabled={uploadingIcon} />
              {draft.icon_url && (
                <button
                  type="button"
                  onClick={() => set("icon_url", null)}
                  className="cursor-pointer"
                  style={{ fontSize: 12, color: MUTED, textDecoration: "underline" }}
                >
                  remove
                </button>
              )}
            </div>
          )}
        </div>
      </Field>
      <Field label="Plate image">
        <div className="flex items-center gap-3 flex-wrap">
          {draft.image_url && (
            <img src={draft.image_url} alt="" style={{ width: 64, height: 64, objectFit: "cover", border: `1px solid ${BORDER}` }} />
          )}
          <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} />
          {draft.image_url && (
            <button
              type="button"
              onClick={() => set("image_url", null)}
              className="cursor-pointer"
              style={{ fontSize: 12, color: MUTED, textDecoration: "underline" }}
            >
              remove
            </button>
          )}
        </div>
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={draft.confidential}
          onChange={(e) => set("confidential", e.target.checked)}
        />
        <span style={{ fontSize: 13, color: INK }}>
          Confidential — show on the dig site, but blur the details (in case I want it back one day)
        </span>
      </label>

      {error && <p style={{ color: RUST, fontSize: 13 }}>{error}</p>}

      <div className="flex items-center gap-4 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading || uploadingIcon}
          className="cursor-pointer"
          style={{ background: INK, color: PAPER, padding: "9px 20px", fontSize: 13, letterSpacing: "0.08em" }}
        >
          {saving ? "Saving…" : isNew ? "Add specimen" : "Save"}
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
        <input
          type="password"
          required
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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

export default function IdeaBedEditor() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [rows, setRows] = useState<SpecimenRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  function loadRows() {
    fetchSpecimens()
      .then(setRows)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load specimens."));
  }

  useEffect(() => {
    if (session) loadRows();
  }, [session]);

  function handleSaved(saved: SpecimenRow) {
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
        <Link
          to="/the-idea-bed"
          className="text-xs hover:opacity-70 transition-opacity uppercase"
          style={{ letterSpacing: "0.14em", color: MUTED }}
        >
          ← the idea bed
        </Link>
        <h1 className="mt-4 text-3xl" style={{ color: INK, fontWeight: 600 }}>
          Edit specimens
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
                    Add a new specimen
                  </p>
                  <SpecimenEditor
                    key={`new-${rows.length}`}
                    row={blankRow(rows.length, rows)}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                  />
                </div>

                <div className="mt-2">
                  <p className="mb-2" style={{ fontSize: 11, letterSpacing: "0.14em", color: MUTED, textTransform: "uppercase" }}>
                    Existing specimens
                  </p>
                  <div className="flex flex-col gap-6">
                    {rows
                      .slice()
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((row) => (
                        <SpecimenEditor key={row.id} row={row} onSaved={handleSaved} onDeleted={handleDeleted} />
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
