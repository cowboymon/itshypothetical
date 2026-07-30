import { supabase, supabaseConfigured } from "./supabase";

function assertConfigured() {
  if (!supabaseConfigured) {
    throw new Error("Supabase isn't configured for this deployment.");
  }
}

export interface SpecimenRow {
  id: string;
  no: string;
  name: string;
  year: number;
  tagline: string;
  blurb: string;
  reason: string | null;
  cause: string;
  image_url: string | null;
  sort_order: number;
  confidential: boolean;
}

export type SpecimenDraft = Omit<SpecimenRow, "id"> & { id?: string };

export async function fetchSpecimens(): Promise<SpecimenRow[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from("specimens")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function saveSpecimen(row: SpecimenDraft): Promise<SpecimenRow> {
  assertConfigured();
  const { data, error } = await supabase.from("specimens").upsert(row).select().single();
  if (error) throw error;
  return data as SpecimenRow;
}

export async function deleteSpecimen(id: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("specimens").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPlateImage(file: File): Promise<string> {
  assertConfigured();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("specimen-plates").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("specimen-plates").getPublicUrl(path);
  return data.publicUrl;
}
