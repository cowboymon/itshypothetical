import { supabase, supabaseConfigured } from "./supabase";

function assertConfigured() {
  if (!supabaseConfigured) {
    throw new Error("Supabase isn't configured for this deployment.");
  }
}

export interface Screenshot {
  src: string;
  alt: string;
}

export interface Review {
  quote: string;
  author?: string;
}

export interface DetailField {
  label: string;
  value: string;
}

export interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  status: string;
  has_page: boolean;
  cta_label: string | null;
  cta_href: string;
  problem: string;
  how_it_works: string[];
  screenshots_heading: string;
  screenshots: Screenshot[];
  example_heading: string;
  example_quotes: string[];
  reviews: Review[];
  details: DetailField[];
  sort_order: number;
}

export type ProjectDraft = Omit<ProjectRow, "id"> & { id?: string };

export async function fetchProjects(): Promise<ProjectRow[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveProject(row: ProjectDraft): Promise<ProjectRow> {
  assertConfigured();
  const { data, error } = await supabase.from("projects").upsert(row).select().single();
  if (error) throw error;
  return data as ProjectRow;
}

export async function deleteProject(id: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProjectImage(file: File): Promise<string> {
  assertConfigured();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("specimen-plates").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("specimen-plates").getPublicUrl(path);
  return data.publicUrl;
}
