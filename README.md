# VeloceFix (working title: SlotRight)

Repair-to-booking desk for a UK letting-agency property manager. Locked idea for the Grok Bot Real Estate Hackathon London, 12 Nov 2026, Track 4.

A tenant WhatsApps a repair (photo included). Grok proposes what is wrong. Deterministic code checks the building record and cited UK rules, sets a transparent priority, and — only if every fact is green — offers a contractor slot in the same thread. When the job is closed, a short form writes a verified history. Notifications are drafted, not auto-sent.

**Recommended product name:** VeloceFix (pending Francesco's confirmation). See `knowledge/idea.md`.

## Status

Spec locked 19:41 Europe/London; Twilio WhatsApp is the tenant channel; Grok Bot is the agency ops assistant. Application code is not started until DEP1 (live Next.js on Vercel). How we work: `knowledge/flow.md`. Cards: `knowledge/tasks.md`. Pitch: `knowledge/pitch.md`.

## Stack (planned)

Next.js on Vercel, local JSON seed, xAI (Grok) for proposals, TypeScript checks and priority engine, Twilio WhatsApp sandbox (fallback: labelled `/sim`).

## Honesty

Seeded buildings and slots; private tenancies use agency-policy clocks, not Awaab's Law; WhatsApp is a test sandbox (or a labelled simulation); completion messages are drafts. Details in `knowledge/idea.md`.

## Licence

MIT, Copyright 2026 Francesco Coccia.
