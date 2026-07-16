# 10 — The One-Shot Website Prompt

**Single-paste prompt for Claude (Fable 5) + Higgsfield MCP, in the style of the One-Prompt Website Pack. Builds the cinematic Pavlicevits brand one-pager: Greek-first, dark, lead-gen only, petrol as the sole accent.**

*Paste the whole prompt, unedited, the first time. Requires the Higgsfield MCP connected and Seedance 2.0 credits.*

---

## The prompt

> Build me an award-winning cinematic "3D scroll" website for PAVLICEVITS COLORS — a real specialist paint vendor in Kalamaria, Thessaloniki, founded in 1990 with trade roots back to 1982. Four categories only: architectural, automotive refinish, marine, and special applications. Official partner of Pellachrom, a Greek paint manufacturer in Edessa (~100 km away). Two generations of the same family work the counter. This is a lead-generation brand site — no shop, no prices, no checkout. Create it as a fresh standalone project; do not touch any existing e-shop codebase.
>
> VISUALS — generate with the Seedance 2.0 model on the Higgsfield MCP (std mode, 1080p, 16:9, no audio, ~8s per clip). First generate ONE hero image — petrol paint (#0F4C5C) mid-bloom in dark water against a deep blue-black void (#0A0E1A), white highlights, hints of luminous teal (#2BA8C2) — and pass it as an image reference to every clip so the palette is identical throughout. CRITICAL: every clip stays strictly in the petrol / deep-navy / teal palette. Never multicolor, never rainbow — this is a trade paint specialist, not an art-supplies brand.
>
> 1. HERO BLOOM — petrol pigment blooming and swirling through dark water in extreme slow motion, growing from a single drop until it fills the frame, white light rippling through the medium.
> 2. THE MATERIAL — extreme macro: a wide brush lays one slow, dense stroke of wet petrol paint across a dark substrate; pigment density, sheen, and surface tension in sharp detail.
> 3. THE WORK — slow dolly along a 12-meter yacht hull mid-recoat at a boatyard at dusk, fresh dark antifouling catching the low light, the Aegean out of focus behind it.
> 4. THE COUNTER — a moody editorial interior of a specialist paint shop: shelves of curated cans, warm practical light, two figures of different generations working the same counter, unhurried.
>
> WEBSITE — scroll-scrub the hero bloom as a canvas frame sequence so scrolling makes the pigment bloom. Lenis smooth scroll, text reveals pinned to scroll position. GREEK-FIRST: all copy in Greek; only the brand name and the slogan stay in English. Use fonts with full Greek glyph support and verify Greek renders correctly.
>
> Sections, in order:
> - HERO — eyebrow "ΑΠΟ ΤΟ 1990 · ΚΑΛΑΜΑΡΙΑ, ΘΕΣΣΑΛΟΝΙΚΗ"; mixed-weight headline "**Το σωστό χρώμα.** *Για δουλειά που κρατάει.*"; sub-line naming the four categories and the curated brands (Pellachrom, Vivechrom, Vechro, Kraft, Vitex — "επιλεγμένα, όχι απλώς στοιβαγμένα"); CTAs "Δείτε τα έργα μας" / "Φέρτε μας τη δουλειά σας".
> - IDENTITY STRIP — one full-width line: "Δεν πουλάμε κάθε χρώμα. Πουλάμε όσα κερδίζουν τη θέση τους στα ράφια μας."
> - MATERIAL — pinned over clip 2: "**Αυτό που έχει μέσα το κουτί** *είναι το πραγματικό προϊόν.*" Sub: "Πυκνότητα πιγμέντων. Χημεία ρητινών. Αντοχή στο φως. Καλυπτικότητα."
> - FOUR CATEGORIES — cards for Αρχιτεκτονικά / Φανοποιία / Ναυτιλιακά / Ειδικές εφαρμογές, each with two lines of sparse technical copy grounded in Northern Greece (Καλαμαριά apartments, Χαλκιδική hotel facades, Σάνη and Πόρτο Καρράς marinas, industrial floors and pools).
> - FEATURED PROJECT — pinned over clip 3: "**Σκάφος 12 μέτρων. Σιθωνία.** *Επτά χρόνια αντοχής.*" Spec callouts in a tech grid: υπόστρωμα GRP, εποξειδικό σύστημα 2 συστατικών Pellachrom Marine (αστάρι + tie coat + υφαλόχρωμα), εφαρμογή σε δύο φάσεις στο καρνάγιο, διάρκεια ζωής 7+ χρόνια.
> - COUNTER STRIP — tabular numerals counting up on scroll: 36+ ΧΡΟΝΙΑ ΣΤΟ ΕΠΑΓΓΕΛΜΑ · 4 ΕΞΕΙΔΙΚΕΥΜΕΝΕΣ ΚΑΤΗΓΟΡΙΕΣ · Εκατοντάδες ΣΤΑΘΕΡΟΙ ΠΕΛΑΤΕΣ · Pellachrom ΕΠΙΣΗΜΟΣ ΣΥΝΕΡΓΑΤΗΣ.
> - THE SHOP — over clip 4, with the pull quote in petrol italic: "Δεν πουλάμε χρώμα. Πουλάμε λύσεις. Συχνά είναι ένα προϊόν. Συχνά είναι κάτι παραπάνω."
> - CTA BANNER + FORM — "**Έχετε μια δουλειά που ζητά κάτι παραπάνω** *από την προφανή απάντηση;*" Contact form (Όνομα, Email, Τηλέφωνο, τύπος έργου as radio: Αρχιτεκτονικά / Φανοποιία / Ναυτιλιακά / Ειδικές εφαρμογές, Μήνυμα) beside shop details: +30 2310 447 033 · info@pavlicevits.gr · Λεωφ. Εθνικής Αντιστάσεως 66, Καλαμαριά 55133 · Δευ–Παρ 08:30–16:30, Σάβ 08:30–14:30.
> - FOOTER — the slogan stand-alone, italic, in petrol, always in English: "Making Your Life Colorful."
>
> DESIGN — dark, serious, professional. Deep blue-black canvas #0A0E1A. Petrol #0F4C5C is the ONLY accent — lift it to #2BA8C2 / #5BC5DB for text, borders, and glows on dark. White typography. Mixed-weight headlines everywhere: heavy first beat + light italic second beat — the italic is never the opener. Eyebrow chips uppercase, small, +0.06em letter-spacing. Tabular numerals for stats and phone numbers. Generous blackspace, hairline borders, at most a faint petrol radial glow behind hero moments — no decorative orbs, no clutter.
>
> COPY VOICE — calm, precise, peer-to-peer; it speaks to professional painters and specifiers as equals. "Εμείς", never "εγώ". Specifics over superlatives ("αντοχή επτά ετών", never "εξαιρετική αντοχή"). Forward-looking verbs. No combat metaphors, no defensive language, no exclamation marks. CTAs invite, never sell: "Μιλήστε μας" / "Φέρτε μας τη δουλειά" — never "Αγοράστε τώρα". Forbidden anywhere on the page: discount banners, popups, autoplay sliders, countdown timers, stock-photo look.
>
> Launch on localhost and verify the hero bloom scrub is smooth, every pinned reveal fires, Greek text renders correctly in the chosen fonts, and the form validates — before telling me it's done.

---

## Notes for iterating after the first build

1. **Hero consistency beats clip quality.** Generate 2–3 takes of the HERO BLOOM only and keep the one where the petrol hue holds through the full bloom; take the first acceptable result on clips 2–4.
2. **Swap clip 3 per campaign.** The featured-project slot rotates: a Halkidiki hotel facade at evening light, a car panel under a spray gun, an industrial floor reflecting overheads — same palette rule always applies.
3. **Compress the videos for web** after approval — one sentence to Claude cuts file size ~90%.
4. **Source of truth**: copy comes from `08b_WEBSITE_COPY_GR.md`, voice rules from `01_BRAND_MANIFESTO.md` §9–10, tokens from `03_DESIGN_SYSTEM.md`. If the prompt and those documents conflict, the documents win.
