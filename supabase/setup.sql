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
alter table public.specimens add column if not exists icon text;

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
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-01', 'Critically Endangered', 2024, 'a zoo where the rarest thing in it is basically a lottery ticket', 'Every animal capped at exactly how many are left in the wild. 30 polar bears left on Earth? Then exactly 30 people, ever, get to own one in-game. No restock, no "come back next season." Real money goes to real conservation, so the rarer (read: more expensive) the animal, the more good it''s actually doing.', 'Got as far as a Figma mockup before I killed it, because I already know myself, and I would commit several ethically grey acts to get a saber-toothed tiger into MY zoo.', 'TRASHED FOR MY OWN PROTECTION', 0);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-02', 'Sorted', 2019, 'point, scan, get told where your trash actually belongs', 'Scan a barcode, get told what''s recyclable in your bin and where the rest needs to go. Built on the very reasonable idea that shame doesn''t work on anyone standing alone in their kitchen at 11pm sorting yoghurt tubs.', 'Never left the napkin sketch stage, because other people already built this, better, first.', 'NOT SPECIAL', 1);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-03', 'Still Reachable', 2025, 'a number that''s always theirs, no matter what', 'Upload a voice message from someone you''ve lost — touch with, or just lost — and get a number that''s permanently theirs. Call it, hear them. Text it, it just sits there. No stranger eventually inheriting the number and going "sorry, wrong number" into the void where their voice used to live.', 'Currently sitting at "idea in a doc," untouched.', 'UNTOUCHED, STILL POSSIBLE', 2);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-04', 'Sent Anyway', 2022, 'say the thing. it just never lands', 'Text your ex, or anyone gone, into an inbox that never reaches them. Same dumb little rush as hitting send, none of the aftermath. If it was bad enough, order the whole thread printed as a book, delivered with a single match, so the last thing you ever do with it is set it on fire.', 'Got a working prototype together. The instinct''s dead right — grief wants an inbox, closure sometimes wants a bonfire, not a Notes app. But "$34, ships in 5–7 business days, comes with complimentary matches" turns something tender into a checkout page, and I couldn''t say that out loud with a straight face in a pitch meeting.', 'TENDER TURNED INTO A CHECKOUT PAGE', 3);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-05', 'At Least Your Plants Answer', 2021, 'a houseplant that texts you back. rudely', 'Soil sensor, hooked to a chatbot that only communicates in plant grievances: "kind of thirsty," "you''re doing too much," "I am not a fern, Kevin, stop misting me." Prototyped it on my own windowsill, actually — it''s a $40 Bluetooth moisture sensor cosplaying as a personality.', 'Eventually somebody notices the man behind the curtain.', 'THE CURTAIN SLIPS EVENTUALLY', 4);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-06', 'The Alibi', 2018, 'a believable excuse to leave, on a countdown', 'Set a timer before any dinner, date, or work drinks you already regret agreeing to. At zero, it fires off a fake emergency text — one you wrote while sober, so future-you always has a getaway car.', 'Made it to a clickable prototype. An app whose entire personality is "helps you lie to people you love" is a hard pitch at the best of times, and an impossible one at the family dinner you''re currently trying to escape. Also: turns out you can just schedule texts now.', 'TECH ALREADY DID THE CRIME', 5);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-07', 'Group Chat Court', 2017, 'screenshots in. verdict out', 'Submit your side of the dispute — who said they''d bring the speaker, who ghosted the group booking — and total strangers vote guilty or not guilty.', 'Stayed a thought experiment. Handing the internet a gavel and pointing it at your actual friendships is exactly as bad an idea as it sounds on paper, and we knew that going in. Also Reddit exists. For a reason.', 'REDDIT ALREADY EXISTS', 6);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-08', 'Paddle Pop Enterprise', 2002, 'a multi-level conspiracy to corner the frozen stick market, aged 12', 'Tried to hack the Paddle Pop prize system by cahoots-ing with a small ring of co-conspirators to artificially inflate demand — get enough kids buying, then swoop in and collect everyone''s sticks once the hype had done its job.', 'Basically ran a demand-side cartel out of a primary school tuckshop.', 'NO REGRETS, MILD CONCERN', 7);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-09', 'Holly the Horse & Pumpkin Pea Patch', 2004, 'my first published universe. circulation: one photocopier, tops', 'A comic. Read way too much Captain Underpants, but was quietly into zines before zines were a thing anyone under 40 had heard of, so really I was just ahead of my time and nobody knew it yet.', 'Plot, characters, and overall coherence: none of your business.', 'AHEAD OF ITS TIME, ALLEGEDLY', 8);
insert into public.specimens (no, name, year, tagline, blurb, reason, cause, sort_order) values ('FD-10', 'Actually Tasty', 2023, 'turns out 4.5 stars just means it offended nobody', 'Got sick of walking into 4.5+ star restaurants, cafes, and bakeries and having a genuinely bad time, then spiraling about what was wrong with me. Eventual realisation: taste is subjective, and a 5-star average usually just means the food is generic enough to never upset anyone. Congratulations to that muffin, it has no personality and neither does your rating system. The idea: 10 menu items, one per vendor, you actually try. You rate how you felt eating each one, and that builds your taste profile — not "is this objectively good" but "will YOU, specifically, enjoy this." Then you follow people with matching taste buds, so you stop taking recommendations from people whose mouths clearly work differently to yours.', NULL, 'STILL COOKING', 9);

-- Icons are left null by default, so every specimen falls back to the
-- generic fossil glyph cycle (see GENERIC_ICON_KEYS in JunkDrawer.tsx) —
-- the look was preferred over per-specimen contextual icons. The mapping
-- below is kept for reference in case that's ever reactivated from the
-- editor's "Fossil icon" dropdown, on a per-specimen basis:
--   FD-01 ticket · FD-02 bin · FD-03 phone · FD-04 envelope · FD-05 plant
--   FD-06 timer · FD-07 gavel · FD-08 popsicle · FD-09 book · FD-10 cutlery
