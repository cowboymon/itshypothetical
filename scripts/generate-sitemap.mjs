// Regenerates public/sitemap.xml from the live `projects` table before every
// build, so pages added/hidden via the CMS don't require a manual sitemap
// edit. Falls back to leaving the existing file alone if Supabase env vars
// aren't available (e.g. a local build without .env.local).
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const SITE = "https://itshypothetical.com";
const OUT = new URL("../public/sitemap.xml", import.meta.url);

function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadEnvLocal();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const STATIC_PAGES = ["/", "/#/the-idea-bed"];

async function main() {
  let projectPaths = [];
  if (url && key) {
    const res = await fetch(`${url}/rest/v1/projects?select=slug,has_page&order=sort_order`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (res.ok) {
      const projects = await res.json();
      projectPaths = projects.filter((p) => p.has_page !== false).map((p) => `/#/${p.slug}`);
    } else {
      console.warn(`generate-sitemap: Supabase fetch failed (${res.status}), keeping existing sitemap.xml`);
      return;
    }
  } else {
    console.warn("generate-sitemap: Supabase env vars not set, keeping existing sitemap.xml");
    return;
  }

  const urls = [...STATIC_PAGES, ...projectPaths]
    .map((path) => `  <url>\n    <loc>${SITE}${path}</loc>\n  </url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(OUT, xml);
  console.log(`generate-sitemap: wrote ${STATIC_PAGES.length + projectPaths.length} urls`);
}

main();
