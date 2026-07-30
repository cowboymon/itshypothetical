-- The Idea Bed — Supabase setup
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create extension if not exists "pgcrypto";

create table if not exists public.specimens (
  id uuid primary key default gen_random_uuid(),
  no text not null,
  name text not null,
  year int not null,
  tagline text not null,
  blurb text not null,
  reason text,
  cause text not null,
  image_url text,
  sort_order int not null default 0,
  confidential boolean not null default false,
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds columns if this script already ran before they existed.
alter table public.specimens add column if not exists confidential boolean not null default false;
-- Unused now (was a named-icon key like 'phone'/'gavel'); kept around harmlessly
-- rather than dropped. icon_url is what the app actually reads.
alter table public.specimens add column if not exists icon text;
alter table public.specimens add column if not exists icon_url text;

-- Guards the seed inserts below against ever being duplicated by a re-run.
-- Must run after any duplicate "no" values have been cleaned up.
create unique index if not exists specimens_no_idx on public.specimens (no);

alter table public.specimens enable row level security;

-- Anyone can read specimens (the public Idea Bed page).
drop policy if exists "specimens are publicly readable" on public.specimens;
create policy "specimens are publicly readable"
  on public.specimens for select
  using (true);

-- Only logged-in users (you, via the admin page) can write.
drop policy if exists "authenticated users can insert specimens" on public.specimens;
create policy "authenticated users can insert specimens"
  on public.specimens for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can update specimens" on public.specimens;
create policy "authenticated users can update specimens"
  on public.specimens for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete specimens" on public.specimens;
create policy "authenticated users can delete specimens"
  on public.specimens for delete
  to authenticated
  using (true);

-- Storage bucket for plate illustrations.
insert into storage.buckets (id, name, public)
values ('specimen-plates', 'specimen-plates', true)
on conflict (id) do nothing;

drop policy if exists "plate images are publicly readable" on storage.objects;
create policy "plate images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'specimen-plates');

drop policy if exists "authenticated users can upload plate images" on storage.objects;
create policy "authenticated users can upload plate images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'specimen-plates');

drop policy if exists "authenticated users can update plate images" on storage.objects;
create policy "authenticated users can update plate images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'specimen-plates');

drop policy if exists "authenticated users can delete plate images" on storage.objects;
create policy "authenticated users can delete plate images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'specimen-plates');

-- Seed data: the 10 existing ideas, migrated from the hardcoded array.
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-01', 'Critically Endangered', 2024, 'a zoo where the rarest thing in it is basically a lottery ticket', 'Every animal capped at exactly how many are left in the wild. 30 polar bears left on Earth? Then exactly 30 people, ever, get to own one in-game. No restock, no "come back next season." Real money goes to real conservation, so the rarer (read: more expensive) the animal, the more good it''s actually doing.', 'Got as far as a Figma mockup before I killed it, because I already know myself, and I would commit several ethically grey acts to get a saber-toothed tiger into MY zoo.', 'TRASHED FOR MY OWN PROTECTION', 0) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-02', 'Sorted', 2019, 'point, scan, get told where your trash actually belongs', 'Scan a barcode, get told what''s recyclable in your bin and where the rest needs to go. Built on the very reasonable idea that shame doesn''t work on anyone standing alone in their kitchen at 11pm sorting yoghurt tubs.', 'Never left the napkin sketch stage, because other people already built this, better, first.', 'NOT SPECIAL', 1) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-03', 'Still Reachable', 2025, 'a number that''s always theirs, no matter what', 'Upload a voice message from someone you''ve lost — touch with, or just lost — and get a number that''s permanently theirs. Call it, hear them. Text it, it just sits there. No stranger eventually inheriting the number and going "sorry, wrong number" into the void where their voice used to live.', 'Currently sitting at "idea in a doc," untouched.', 'UNTOUCHED, STILL POSSIBLE', 2) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-04', 'Sent Anyway', 2022, 'say the thing. it just never lands', 'Text your ex, or anyone gone, into an inbox that never reaches them. Same dumb little rush as hitting send, none of the aftermath. If it was bad enough, order the whole thread printed as a book, delivered with a single match, so the last thing you ever do with it is set it on fire.', 'Got a working prototype together. The instinct''s dead right — grief wants an inbox, closure sometimes wants a bonfire, not a Notes app. But "$34, ships in 5–7 business days, comes with complimentary matches" turns something tender into a checkout page, and I couldn''t say that out loud with a straight face in a pitch meeting.', 'TENDER TURNED INTO A CHECKOUT PAGE', 3) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-05', 'At Least Your Plants Answer', 2021, 'a houseplant that texts you back. rudely', 'Soil sensor, hooked to a chatbot that only communicates in plant grievances: "kind of thirsty," "you''re doing too much," "I am not a fern, Kevin, stop misting me." Prototyped it on my own windowsill, actually — it''s a $40 Bluetooth moisture sensor cosplaying as a personality.', 'Eventually somebody notices the man behind the curtain.', 'THE CURTAIN SLIPS EVENTUALLY', 4) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-06', 'The Alibi', 2018, 'a believable excuse to leave, on a countdown', 'Set a timer before any dinner, date, or work drinks you already regret agreeing to. At zero, it fires off a fake emergency text — one you wrote while sober, so future-you always has a getaway car.', 'Made it to a clickable prototype. An app whose entire personality is "helps you lie to people you love" is a hard pitch at the best of times, and an impossible one at the family dinner you''re currently trying to escape. Also: turns out you can just schedule texts now.', 'TECH ALREADY DID THE CRIME', 5) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-07', 'Group Chat Court', 2017, 'screenshots in. verdict out', 'Submit your side of the dispute — who said they''d bring the speaker, who ghosted the group booking — and total strangers vote guilty or not guilty.', 'Stayed a thought experiment. Handing the internet a gavel and pointing it at your actual friendships is exactly as bad an idea as it sounds on paper, and we knew that going in. Also Reddit exists. For a reason.', 'REDDIT ALREADY EXISTS', 6) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-08', 'Paddle Pop Enterprise', 2002, 'a multi-level conspiracy to corner the frozen stick market, aged 12', 'Tried to hack the Paddle Pop prize system by cahoots-ing with a small ring of co-conspirators to artificially inflate demand — get enough kids buying, then swoop in and collect everyone''s sticks once the hype had done its job.', 'Basically ran a demand-side cartel out of a primary school tuckshop.', 'NO REGRETS, MILD CONCERN', 7) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-09', 'Holly the Horse & Pumpkin Pea Patch', 2004, 'my first published universe. circulation: one photocopier, tops', 'A comic. Read way too much Captain Underpants, but was quietly into zines before zines were a thing anyone under 40 had heard of, so really I was just ahead of my time and nobody knew it yet.', 'Plot, characters, and overall coherence: none of your business.', 'AHEAD OF ITS TIME, ALLEGEDLY', 8) on conflict (no) do nothing;
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-10', 'Actually Tasty', 2023, 'turns out 4.5 stars just means it offended nobody', 'Got sick of walking into 4.5+ star restaurants, cafes, and bakeries and having a genuinely bad time, then spiraling about what was wrong with me. Eventual realisation: taste is subjective, and a 5-star average usually just means the food is generic enough to never upset anyone. Congratulations to that muffin, it has no personality and neither does your rating system. The idea: 10 menu items, one per vendor, you actually try. You rate how you felt eating each one, and that builds your taste profile — not "is this objectively good" but "will YOU, specifically, enjoy this." Then you follow people with matching taste buds, so you stop taking recommendations from people whose mouths clearly work differently to yours.', NULL, 'STILL COOKING', 9) on conflict (no) do nothing;

-- icon_url is left null by default, so every specimen falls back to the
-- cycled generic fossil glyph (see GENERIC_ICON_KEYS in JunkDrawer.tsx).
-- Set icon_url on a specimen (via the editor's "Custom icon" upload) to
-- give it its own icon instead.

-- ─── Projects (homepage cards + project detail pages) ──────────────────────

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  description text not null,
  long_description text not null default '',
  status text not null default 'In concept',
  has_page boolean not null default true,
  cta_label text,
  cta_href text not null default '#',
  problem text not null default '',
  how_it_works jsonb not null default '[]'::jsonb,
  screenshots_heading text not null default 'In the app',
  screenshots jsonb not null default '[]'::jsonb,
  example_heading text not null default '',
  example_quotes jsonb not null default '[]'::jsonb,
  reviews jsonb not null default '[]'::jsonb,
  details jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "projects are publicly readable" on public.projects;
create policy "projects are publicly readable"
  on public.projects for select
  using (true);

drop policy if exists "authenticated users can insert projects" on public.projects;
create policy "authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can update projects" on public.projects;
create policy "authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete projects" on public.projects;
create policy "authenticated users can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

-- Reuses the same bucket the Idea Bed's plate/icon images live in.
insert into storage.buckets (id, name, public)
values ('specimen-plates', 'specimen-plates', true)
on conflict (id) do nothing;

-- Seed data: the 4 existing projects, migrated from the hardcoded array.
insert into public.projects (slug, name, tagline, description, long_description, status, has_page, cta_label, cta_href, problem, how_it_works, screenshots_heading, screenshots, reviews, details, sort_order) values (
  'loud-and-fine', 'Loud & Fine', 'Loud world. Fine dog.',
  'Sound desensitization for anxious dogs — no trainer required, several treats required.',
  'Systematic sound desensitization for dogs who lose it at vacuums, thunder, fireworks, and the doorbell. $2.99 once. No subscription. No ads.',
  'In dev', false, 'Join the waitlist', '#',
  'Most dogs who panic at loud noises aren''t broken — they just haven''t been introduced to the sound on their terms. The existing tools for this are built like they''re from 2013, because they are. Loud & Fine does the same proven method (systematic desensitization) without making you read a manual first.',
  '["Pick the sound your dog struggles with — vacuum, storm, fireworks, clippers, crying baby", "Play it at a volume they can handle, reward them, repeat", "The app tracks progress so you know when to turn it up", "No account, no cloud, no data leaving your phone"]'::jsonb,
  'In the app',
  '[{"src":"https://picsum.photos/seed/loud-and-fine-1/300/650","alt":"Loud & Fine app screenshot — sound picker"},{"src":"https://picsum.photos/seed/loud-and-fine-2/300/650","alt":"Loud & Fine app screenshot — session in progress"},{"src":"https://picsum.photos/seed/loud-and-fine-3/300/650","alt":"Loud & Fine app screenshot — progress tracking"}]'::jsonb,
  '[{"quote":"My dog used to hide in the bathtub every time it thundered. Now he just glances at the window.","author":"Sarah, and a much calmer beagle"},{"quote":"Wish this existed before the fireworks incident of 2023. We''re rebuilding trust, slowly.","author":"Marcus"},{"quote":"$2.99 and no subscription almost made me suspicious. It just works.","author":"Priya"}]'::jsonb,
  '[{"label":"Price","value":"$2.99 one-time"},{"label":"Platform","value":"iOS"},{"label":"Data","value":"100% on-device"},{"label":"Tone","value":"Cool vet nurse — warm, deadpan"}]'::jsonb,
  0
) on conflict (slug) do nothing;

insert into public.projects (slug, name, tagline, description, long_description, status, has_page, cta_label, cta_href, problem, how_it_works, screenshots_heading, screenshots, reviews, details, sort_order) values (
  'quirks-and-all', 'Quirks & All', 'Away, but known.',
  'Every weird habit your dog has, written down and handed off on purpose.',
  'The pet-care handoff doc your sitter actually reads — quirks, commands, and the one thing to know if things go sideways.',
  'In beta', true, 'Visit the website', 'https://quirksandall.itshypothetical.com',
  'Handing your dog off to a sitter usually means a rushed text, a half-remembered command list, and hoping for the best. Quirks & All turns that into one link: what your dog''s actually like, what commands mean what, and a one-tap missing-poster generator you hope you never need.',
  '["Build your dog''s profile once — quirks, commands, routines", "Generate a share link with a preset (Walk / Stay / Full) for whoever''s looking after them", "Sitters see exactly what they need, nothing they don''t", "If commands drift out of date, the app nudges you to check"]'::jsonb,
  'In the app',
  '[{"src":"https://picsum.photos/seed/quirks-and-all-1/300/650","alt":"Quirks & All app screenshot — dog profile"},{"src":"https://picsum.photos/seed/quirks-and-all-2/300/650","alt":"Quirks & All app screenshot — share link presets"},{"src":"https://picsum.photos/seed/quirks-and-all-3/300/650","alt":"Quirks & All app screenshot — missing poster generator"}]'::jsonb,
  '[{"quote":"My sitter texted back ''this is the best handoff doc I''ve ever gotten.'' Weirdly proud of that.","author":"Jamie"},{"quote":"Finally a way to explain that ''off'' means off the couch, not off the bed.","author":"Theo"},{"quote":"Haven''t needed the missing poster generator. Comforting that it''s there.","author":"Dana"}]'::jsonb,
  '[{"label":"Platform","value":"Website"},{"label":"Model","value":"Free to start"},{"label":"Tone","value":"Quirks are charming, not problems"}]'::jsonb,
  1
) on conflict (slug) do nothing;

insert into public.projects (slug, name, tagline, description, status, has_page, sort_order) values (
  'reach', 'Reach', 'Alone, not lost.',
  'A loneliness app — because knowing you''re not alone shouldn''t take this much effort.',
  'In validation', false, 2
) on conflict (slug) do nothing;

insert into public.projects (slug, name, tagline, description, long_description, status, has_page, problem, how_it_works, example_heading, example_quotes, details, sort_order) values (
  'straightforward-review', 'Straightforward Review', 'Reviews without the bullshit.',
  'Reviews in two sentences or less. You already know what you want — this just confirms it.',
  'Reviews in two sentences or less. One thumb, up or down. You already know if the place was good — this just makes it quick to say so, and quick to check.',
  'Wrapped', true,
  'Most reviews are 300 words of someone re-litigating their week. Nobody reads them, and nobody who writes them enjoys it either. Book, blender, ice cream, whatever — you don''t need a novel to know if it''s worth it. You need one honest signal from someone who''s already been through it.',
  '["See a thing. Give it a thumb — up or down. No stars, no 1–10, no ambiguity.", "Add up to two sentences if you want to. Not required.", "Browsing: see the thumb split first, read the two-liners after — no scrolling through essays to find the one useful line.", "No profiles to build, no reviewer level, no badges. That''s the whole product."]'::jsonb,
  'What a review looks like',
  '["Bloody good read. Finished in two weeks. Felt all the feels and then some.", "Would endure the aftermaths of lactose intolerance again.", "Clackity clack tap tap clack clop. Rough translation: I do be enjoying this."]'::jsonb,
  '[{"label":"Format","value":"Thumbs up/down + 2 sentences"},{"label":"Platform","value":"Website"},{"label":"Status","value":"Wrapped"},{"label":"Tone","value":"Utility over charm"}]'::jsonb,
  3
) on conflict (slug) do nothing;
