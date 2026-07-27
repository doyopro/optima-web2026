@AGENTS.md

# Standing project rules

This project must always support two things by default, on every UI change, without being asked each time:

1. **Full bilingual support (EN/ES)** — every user-facing string goes through `lib/i18n.ts`, no hardcoded text in components, both languages populated for every key, no partial translations.
2. **Full responsive design (mobile + desktop)** — every new component/page must work correctly on mobile viewport widths (~375px) as well as desktop, using Tailwind's responsive utilities. Test/consider both breakpoints before considering a UI task done.
