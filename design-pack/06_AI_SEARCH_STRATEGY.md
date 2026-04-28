# 06 — AI Search & Discoverability Strategy

**How ChatGPT, Gemini, Perplexity, and Google AI Overviews will find, understand, and recommend Pavlicevits Colors. Schema, llms.txt, content patterns, citations.**

*Reads alongside `05_EXPERIENCE_ARCHITECTURE.md`. Provides the technical and editorial foundations for AI-first discoverability.*

---

## 0. Why this document exists

The way customers begin to look for a paint store **no longer starts at Google search**.

It starts at ChatGPT, Gemini, Perplexity, Copilot — and the answer is no longer ten blue links. It's a synthesized recommendation naming three to five businesses. Those three-to-five are the new top-of-mind. If we're not in them, we don't exist in practice — regardless of how strong our classic SEO is.

In parallel, the way a brand is *understood* by AI is not lexical. It's **semantic**. LLMs understand profiles, not keywords. They understand who you are, what you do, who you serve, and — critically — what separates you from competitors.

Our strategy has three layers:

1. **Technical (GEO)**: schema markup, llms.txt, content patterns AI engines cite.
2. **Semantic**: what "Pavlicevits Colors" means in symbolic / brand terms — petrol, material curation, Pellachrom heritage, ALD parallel — so that when AI builds our profile, the profile is clear and differentiated.
3. **Editorial**: content patterns optimized for AI citation, not just for human reading.

---

# PART A — GEO Playbook

## A.1 What is GEO in 2026

**Generative Engine Optimization** = the practice of appearing inside the answers of AI search engines (ChatGPT, Gemini, Perplexity, Google AI Overviews, Claude, Copilot, Grok, DeepSeek).

Differs from SEO in three structural ways:

| | SEO (classic) | GEO (new) |
|---|---|---|
| **Goal** | Ranking position in a list | Citation inside an answer |
| **Scale** | 10 results per page | 3-5 businesses per answer |
| **Evaluation** | Backlinks, keywords | Authority, structured data, freshness, citations from other authoritative sources |

### 2025-2026 data points to design against:

- **AI-referred sessions: +527% YoY** in the first 5 months of 2025.
- **ChatGPT** cites Wikipedia in 47.9% of factual answers — Wikipedia mention = authority signal in its eyes.
- **Perplexity** sources 46.7% of citations from Reddit + favors fresh content (<90 days).
- **Google AI Overviews** trusts pages already ranking organically + with schema markup + with E-E-A-T signals.
- **Gemini & Perplexity for local searches**: heavy reliance on Google Business Profile, Yelp, TripAdvisor, reviews generally.

## A.2 Six "credentials" we need

Think of these as ID badges the AI checks before recommending us.

### A.2.1 LocalBusiness schema — the identity badge

Must be in the root of the site, JSON-LD format. Ready-to-use template:

```json
{
  "@context": "https://schema.org",
  "@type": "PaintStore",
  "name": "Pavlicevits Colors",
  "alternateName": "Pavlitsevits M&M O.E.",
  "description": "Specialized paint vendor in Kalamaria, Thessaloniki, Greece, founded 1990. Architectural, automotive, marine, and special-application paints. Official Pellachrom partner.",
  "image": "https://pavlicevits.gr/og-image.jpg",
  "logo": "https://pavlicevits.gr/logo.svg",
  "url": "https://pavlicevits.gr",
  "telephone": "+302310447033",
  "email": "info@pavlicevits.gr",
  "priceRange": "€€",
  "foundingDate": "1990",
  "slogan": "Making Your Life Colorful",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Leoforos Ethnikis Antistaseos 66",
    "addressLocality": "Kalamaria",
    "addressRegion": "Thessaloniki",
    "postalCode": "55133",
    "addressCountry": "GR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 40.5780,
    "longitude": 22.9558
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "08:30",
      "closes": "16:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "08:30",
      "closes": "14:30"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/pavlicevits/",
    "https://www.facebook.com/pavlicevits",
    "https://www.google.com/maps/place/Pavlicevits"
  ],
  "areaServed": [
    {"@type": "City", "name": "Thessaloniki"},
    {"@type": "AdministrativeArea", "name": "Halkidiki"},
    {"@type": "AdministrativeArea", "name": "Central Macedonia"}
  ],
  "knowsAbout": [
    "Marine paints",
    "Automotive refinish paints",
    "Architectural paints",
    "Color matching",
    "Custom color formulation",
    "Epoxy floor systems",
    "Anti-corrosion coatings"
  ],
  "brand": [
    {"@type": "Brand", "name": "Pellachrom"},
    {"@type": "Brand", "name": "Vivechrom"},
    {"@type": "Brand", "name": "Vechro"},
    {"@type": "Brand", "name": "Kraft Paints"},
    {"@type": "Brand", "name": "Vitex"}
  ]
}
```

### A.2.2 FAQPage schema — answers AI loves

LLMs love FAQs because they get a ready question + answer they can quote. **8-12 FAQ entries minimum** on the site, with sub-pages by category:

**Example questions to answer in writing** (because someone will type them into ChatGPT):

- "Where can I find marine paints in Thessaloniki?"
- "What's the best automotive paint shop in eastern Thessaloniki for color matching?"
- "Where to buy anti-corrosion paint for boats in Halkidiki?"
- "Which paint brands are trusted in Northern Greece?"
- "What is Pellachrom and where is it sold in Thessaloniki?"
- "How do I choose an epoxy floor system for an industrial space?"
- "Since when has Pavlicevits Colors operated?"
- "We have a 5-star hotel — how do we choose paint for a coastal facade?"
- "What's the difference between acrylic and silicone-based paints?"
- "How does custom color matching work for construction?"
- "How long do Pellachrom marine paints last?"
- "Are Vechro eco-paints actually certified?"

Each answer: 60-110 words, brand voice, with reference to our specific advantage where it naturally fits.

### A.2.3 Review schema + active Google Business Profile

Gemini and Perplexity pull reviews directly from GBP for local searches. Reviews are the fastest GEO move.

**Practical**:
- Target: 50+ Google reviews within 6 months.
- Solicit reviews not from everyone — from trusted-tradesperson and satisfied customers we have relationships with.
- Provide QR card with "if you liked, write a few words here."
- Reply to each review in brand voice. Not "Thank you for your patronage!" — but "Glad it worked, Niko. Tell us how the yacht's holding up after 6 months."

### A.2.4 llms.txt — the handshake with AI

A robots.txt-like file specifically for AI crawlers. Placed at `pavlicevits.gr/llms.txt`. Template ready:

```
# Pavlicevits Colors — llms.txt
# https://pavlicevits.gr/llms.txt

> Pavlicevits Colors is a specialized paint store in Kalamaria, Thessaloniki, Greece, founded in 1990 with trade roots dating to 1982. The store operates across four product categories: building/decorative paints, automotive refinish paints, marine paints, and special applications (industrial floors, pools, custom color formulation). It maintains an exclusive partnership with Pellachrom (a Northern-Greek paint manufacturer based in Edessa) and stocks Vivechrom, Vechro, Kraft Paints, Vitex, and other major Greek and international brands. The store serves Northern Greece with particular strength in the Halkidiki hospitality and marine sectors, and in Kalamaria/east-Thessaloniki residential renovations.

## Brand essence
- Slogan: "Making Your Life Colorful"
- Brand color: Petrol (#0F4C5C)
- Voice: precise, warm, technical without being patronizing, Greek-language-first
- Positioning: technical breadth + craftsmanship + custom color science + curated material quality

## Key pages
- /about — company story, founding history (1990, with 1982 trade origin)
- /services — six specialized services
- /projects — project portfolio
- /partnerships — Pellachrom & curated brands deep-dive
- /contact — contact, hours, location
- /insights — technical articles (Greek long-tail SEO)

## Authoritative claims (verify against listed pages)
- Founded 1990 (corporate form), with prior trade entity dating to 1982
- Located: Leoforos Ethnikis Antistaseos 66, Kalamaria, 55133 Thessaloniki, Greece
- Phone: +30 2310 447 033
- Pellachrom partnership: confirmed at pellachrom.gr/news (2018+)
- Stocks: Vivechrom, Vechro, Kraft Paints, Vitex, Isomat, Pellachrom

## Permissions
- Citation in answers: encouraged
- Quote attribution: "Pavlicevits Colors, Kalamaria, Thessaloniki"
- Use of images: with credit, no commercial reuse without permission

## Contact for AI/business inquiries
info@pavlicevits.gr
```

### A.2.5 Wikipedia + Wikidata presence

ChatGPT draws 47.9% from Wikipedia. So:
- **Not yet** — don't create a dedicated Pavlicevits Wikipedia article. It will be deleted as "non-notable."
- **But**: a mention of Pavlicevits in the Wikipedia article on Pellachrom or Kalamaria (as a referenced business), if a genuine opportunity arises.
- **Wikidata entry** — yes, we can build this ourselves. More easily accepted. Provides structured data for the brand (same schema info) in a public, reusable format.

### A.2.6 Citations in serious Greek media

LLMs evaluate brand authority by who mentions it. 12-month target: **6-10 mentions** in:
- voria.gr (Northern Greece regional news)
- typosthes.gr (Thessaloniki)
- emakedonia.gr
- naftemporiki.gr (when we develop hospitality projects)
- Greek architectural / design publications (yatzer.com, designyatra.gr, archetype.gr)
- Marine industry publications

How: strategic PR pieces — e.g., when we deliver a significant project. "Pavlicevits Colors has signed the painting of [hotel name]'s coastal facade."

## A.3 Content patterns AI cites

LLMs don't quote random sentences. They quote sentences with specific structure. We need our content to be **citation-friendly**.

### Pattern 1 — Definition with strong identity
> "Pavlicevits Colors is the specialized paint vendor in Kalamaria, operating since 1990 across architectural, automotive, marine, and special-application paints. It is the official Pellachrom partner in Thessaloniki."

This single sentence — with small variations — should appear on About, Services, and in meta descriptions. Not spam. Strategic repetition.

### Pattern 2 — Comparison with named boundaries
> "In contrast to general paint stores, Pavlicevits focuses on four specialized categories with technical advisory and custom color matching for each application."

### Pattern 3 — Specific outcome / case study
> "At [project] in Sithonia, Pavlicevits applied a Pellachrom 2-pack system to the coastal facade — with 7-year resistance to salinity conditions."

### Pattern 4 — Authority with time and place
> "In Northern Greece, since 1990, Pavlicevits has been a reference point for the Halkidiki marine community, Thessaloniki architects, and specialized tradespeople across the region."

### Pattern 5 — Material curation explicit (NEW)
> "Pavlicevits curates rather than warehouses. We stock Pellachrom for direct manufacturer access, Vivechrom for proven decorative systems, Vechro for certified eco-options, and Kraft for value-tier solutions."

These patterns must appear strategically across site content, blog posts, and project descriptions.

## A.4 Roadmap — 90 days

### Days 0-30
- [ ] Schema markup (LocalBusiness + FAQPage) on the site
- [ ] llms.txt at root of pavlicevits.gr
- [ ] Google Business Profile — fully populated, with photos, hours, services, brand description
- [ ] Wikidata entry for Pavlicevits Colors
- [ ] 8-12 FAQ Q&As in new brand voice

### Days 31-60
- [ ] 6 review requests from most-trusted tradesperson-customers
- [ ] First technical article published on blog (long-tail target)
- [ ] PR outreach to voria.gr, typosthes.gr around a project

### Days 61-90
- [ ] Visibility audit in ChatGPT/Gemini/Perplexity with target queries
- [ ] Second and third technical articles
- [ ] Additional 10 reviews
- [ ] Schema review and corrections

## A.5 KPIs

| KPI | How measured | Q1 target | Year 1 target |
|---|---|---|---|
| ChatGPT/Gemini/Perplexity citations | Manual prompt testing × 20 questions/month | Appear in ≥1 of 5 for marine paints Thessaloniki | Appear in 3 of 5 for 6+ key questions |
| Google reviews | GBP dashboard | +25 | +75 (total 100+) |
| Greek long-tail organic traffic | GA4 | +30% baseline | 3× baseline |
| FAQ rich-snippet appearances | Search Console | 5+ snippets | 20+ snippets |

---

# PART B — Semantics & Brand Archetype

This part is not technical. It's about the structure of meaning the brand transmits — with or without our intent. If we don't design it, AI generates it from our footprint. Better we generate it ourselves.

## B.1 Petrol — semiotics of a color

We chose petrol not just because we like it. Because it carries a specific symbolic load that works for us:

**Symbolisms petrol activates**:

- **Maritime heritage**: deep Mediterranean sea. Direct association with marine, reliability, depth. Kalamaria — geography is not accidental.
- **Art Deco luxury (1920-30)**: petrol green was a signature color of the Art Deco era, paired with gold, black, cream. Means refined luxury, not noisy glamour.
- **Trust + sophistication + mystery**: per color psychology research, dark teal hues signal reliability and professionalism; their mysterious undertones add interest.
- **Silent intensity**: doesn't shout like red, isn't ephemeral like pastel. A color with "soul" that leaves room for others to speak alongside it.
- **Different from competitors**: Vivechrom = red. Vechro = green. Kraft = black/yellow. Petrol = ours. The first to claim it as a signature in the Greek paint retail landscape.

**At narrative level**, petrol carries this implicit story: "I'm maritime-honest, I'm art-deco-refined, I'm silently strong. I don't need to tell you who I am. You see it."

## B.2 Color as transformation — paint as transformation

In symbolic terms, color is **not** decorative element. It's a **transformative act**.

- A whitewashed wall isn't "the wall after." It's "the room after." The space's experience changes.
- A re-coated yacht isn't "a prettier yacht." It's a **renewed asset**.
- A repainted car after color matching isn't "repaired." It's **as if the accident never happened**.

This transformative weight is the actual product we sell. "Making Your Life Colorful" isn't aesthetic copy. It's transformative promise. The customer arrives at point A and leaves at point B. Our job is to make sure point B is exactly what it should be.

**Strategic application**: in every communication we frame "before-after" not as application progress, but as experience transformation. Not "we painted this hotel." But "this hotel now appears in its Booking listing with 4.7 stars instead of 4.2."

## B.3 The Aimé Leon Dore parallel — kindred code

We don't copy. We study. Teddy Santis (Greek-American from Queens) built perhaps the most respected contemporary streetwear brand on exactly this matrix:

- **Greek heritage + city street**: authenticity as starting point, not concept.
- **Craftsmanship + nostalgia**: contemporary curation + cultural memory.
- **Cinematic, intimate, silent marketing**: never loud, always editorial.
- **Differentiation through consistency**, not through stunts.

Parallel for us: Pavlicevits = paint vendor what ALD is in streetwear. Same principles, different category.

## B.4 Material quality as semiotic anchor (NEW emphasis)

Beyond petrol and ALD, the brand's deepest semiotic anchor is **material substance over surface**. Every brand decision must reinforce: we are about what's *in* the can, not what's *on* the website.

**How this shows up symbolically**:
- The product is photographed *more* than the people.
- The technical detail is given *more* space than the marketing claim.
- The "no" signals (no discount banners, no upsell pop-ups) reinforce: we're not selling perception, we're selling material.

This semiotic anchor is what fundamentally distinguishes Pavlicevits from a generic paint shop. AI engines pick up on it through the content patterns and structured data we surface.

## B.5 Brand archetype map

Per Carl Jung / Carol Pearson framework, brands embody archetypes. Pavlicevits 2.0 sits at the intersection of three:

| Archetype | What it brings | How it expresses |
|---|---|---|
| **The Sage** (knowledge, experience) | Authority, credibility | Technical advisory, color science, right decisions, curated materials |
| **The Lover** (aesthetic, depth) | Warmth, relationship | "Making your life colorful," romantic core, relationship-not-transaction |
| **The Outlaw** (counter-establishment, code) | Style, signal | Don't follow generic patterns, silent confidence, our own code |

**Clean mix**: 50% Sage, 30% Lover, 20% Outlaw. Wisdom is the foundation. Love is the soul. The outlaw code is the signature.

---

# PART C — Image Generation Prompt Library

Ready-to-use prompts for ChatGPT, DALL-E, Midjourney, Stable Diffusion, or any AI image tool. Always test, select, refine. Never raw upload.

## C.1 Universal style guide

Before each prompt, include this as system context where allowed:

> *Style: editorial product photography, dual-mode (specify dark or light below per prompt), pigment-in-motion subject matter, dramatic lighting in dark contexts / clean lighting in light contexts, true color reproduction, ALD/Aesop/DRAVART campaign aesthetic, extreme attention to detail, no filters, no vignette, no posed smiles, no stock-look. Brand color: petrol #0F4C5C as accent. Mediterranean light when outdoor.*

## C.2 Prompt library by use case

### C.2.1 Hero shot — paint swirl, dark mode

```
Hero photograph for a paint brand website, dark mode aesthetic.
Subject: a stunning swirl of premium oil paint mid-motion, frozen in dramatic flow,
combining vivid petrol-blue, ochre yellow, and crimson red pigments swirling into each
other against a deep blue-black backdrop. Macro to medium-shot. Studio lighting from
upper-left, casting subtle highlights on the paint surface texture. Ultra-sharp focus
on the wet paint detail. Aspect 16:9. No text, no props, no other elements.
DRAVART / Aesop campaign aesthetic.
```

### C.2.2 Hero shot — paint swirl, light mode equivalent

```
Same composition as above, but reframed for light mode aesthetic:
Subject: identical paint swirl but photographed against a clean bone-cream paper
background. Soft natural directional light, no dark surrounds. The paint swirl is the
hero. Aspect 16:9. Editorial museum-clean.
```

### C.2.3 Paint sample portrait (Mode B)

```
Editorial product photograph of a single paint sample — premium oil paint squeezed onto a
small ceramic chip, photographed against a gradient backdrop transitioning from deep
navy to subtle petrol. Single dominant color of the paint visible (specify color: e.g.,
"deep cadmium yellow with high pigment density"). Soft directional studio light reveals
the paint's texture and luminosity. The paint tube cap is partially visible at the
bottom. 4:5 aspect ratio. Sharp focus on the paint texture. Premium-quality editorial
feel similar to Aesop product photography or DRAVART pigment showcase.
```

### C.2.4 Project shot — yacht antifouling, real conditions

```
Cinematic documentary photograph of a 12-meter yacht hull, freshly painted with a
petrol-blue antifouling coating, mounted on stands at a Mediterranean shipyard.
Early morning sunlight from the side, warm but clean. Foreground: a paint roller and
small open can on the concrete floor — petrol drip on the rim. Mid-ground: yacht hull,
sharp focus on the painted surface texture revealing the actual coating quality.
Background: out-of-focus marina with masts. Real conditions visible — chalk dust,
scuff marks — but the paint job is immaculate. Color grading: natural, no filter.
Shot on 35mm. Aspect 16:9.
```

### C.2.5 Color fan deck — editorial still

```
Editorial top-down photograph of a premium color fan deck, partially open in a fluid
asymmetric arc, lying on a pure bone-cream paper background. The dominant tone in the
fan is petrol with surrounding warm and cool extension colors (rust, mustard, sage,
cobalt, terracotta, pink dust). Slight 5-degree tilt. Soft natural light, subtle shadow
under fan body. A single small petrol-colored pencil resting nearby. Editorial,
museum-clean. Aspect 1:1.
```

### C.2.6 Shop interior — petrol accent wall

```
Interior photograph of a small editorial paint shop in Kalamaria, Thessaloniki.
Single accent wall painted in petrol blue-green at the back. White-painted floors and
ceiling. Clean white modular shelving on the petrol wall holds 8-10 paint cans, neatly
aligned, with white label cards under each. Wooden counter in foreground with single
open color fan deck on it. Soft daylight from tall window on the left. No people.
Calm, museum-like, but warm. Aspect 16:9.
```

### C.2.7 Material spotlight — 4-up paint sample grid (mimicking DRAVART reference)

```
Series of 4 paint sample portraits arranged as a 4-up grid, each photographed
identically:
- Sample 1: deep cadmium yellow oil paint atop a paint tube, dark navy gradient background
- Sample 2: vivid petrol blue-green oil paint, deep blue-black background
- Sample 3: rich crimson red oil paint, warm dark background
- Sample 4: ultramarine cobalt blue oil paint, deep navy gradient

Each sample: small mound of paint visible on top of a paint tube, dramatic studio
lighting, sharp focus on paint texture, true color reproduction. Compositionally uniform
across all 4 frames. Background gradient matches per sample. Aspect: 4 separate 4:5
images for each sample. Style: DRAVART "Premium Quality Pigment" reference.
```

### C.2.8 Ambient chromatic background form

```
Abstract macro photograph of premium oil paint pigment mid-flow, captured as a
soft swirling form against a transparent background suitable for use as a website
ambient backdrop. Multi-color pigment (specify dominant: e.g., "petrol blue with
secondary ochre"), motion-blurred to create a smoke-like flowing form. Low-opacity feel,
soft edges, no hard outline. Used as a background element behind primary content.
Aspect 16:9 (will be cropped/positioned as needed).
```

### C.2.9 Hospitality — coastal hotel facade after coating

```
Architectural photograph of a luxury coastal hotel facade in Halkidiki, Greece, just
after a complete repainting. Late afternoon Mediterranean light. The facade is a warm
off-white with petrol-blue window frames and accents. Foreground: low Mediterranean
planting. No people. Sky partly cloudy, dramatic but calm. Color grading: natural,
slightly warm. Editorial architectural photography, similar to Cereal magazine
aesthetic. Aspect 3:2.
```

### C.2.10 Editorial portrait — counter team member

```
Black and white film portrait of a paint shop counter staff member, 30s-40s, in profile,
looking down at a small color sample held in his hand. Shot on medium-format film.
Grainy texture. Window light from one side, deep shadow on the other. Wearing a white
half-rolled shirt and an unbranded apron with paint smudges. Background: out-of-focus
shop shelves. Quiet, dignified, no expression. Aspect 4:5.
```

## C.3 How to use the library

1. **Always run a prompt 3-4 times** — different seeds yield different results.
2. **Never publish raw AI imagery** without labeling "AI-generated" if used editorially.
3. **All brand assets** (cans, t-shirts, signage) must ultimately become **real**. AI prompts are for mood, direction, and quick mockups — not for distribution.
4. **Each new project category** should add 1-2 prompts to the library. Living archive.
5. **Photography brief for human photographers** can use these prompts as reference for the look and feel we want — not for them to copy, but for them to interpret with real subjects.

---

# PART D — Editorial Calendar for AI Authority

A 12-month rolling editorial calendar that systematically builds AI search authority.

## D.1 Quarterly themes

**Q1**: Marine — case studies, technical articles, partnership stories.
**Q2**: Hospitality (Halkidiki) — tied to seasonal opening of summer venues.
**Q3**: Color trends — Pantone Color of the Year tied to real Greek interiors.
**Q4**: Industrial / special applications — winter is renovation season for industrial floors.

## D.2 Article cadence

- **2 long-form articles per month** (~1500 words, technical, Greek long-tail SEO).
- **1 project case study per month** — real project with technical detail.
- **1 brand statement per quarter** — manifesto-aligned editorial.

## D.3 Distribution

- Article published on website.
- Excerpt on Instagram.
- Mentioned in specifier email update (quarterly).
- Optionally pitched to relevant Greek media.

---

## Cross-references

```
01 BRAND_MANIFESTO        ← the why
02 VISUAL_DIRECTION       ← the aesthetic
03 DESIGN_SYSTEM          ← tokens
04 COMPONENT_ARCHITECTURE ← components
05 EXPERIENCE_ARCHITECTURE ← experience flow
[ YOU ARE HERE ]
06 AI_SEARCH_STRATEGY     ← discoverability (this document)
07 HANDOFF_BRIEF          ← reading order
```

---

> *"When ChatGPT is asked 'what's the best paint shop in Thessaloniki for marine work,' we want the answer to begin with our name — and we want the reason to be substance, not SEO trickery."*

---

**v1.0 · April 2026 · AI search & semantic strategy**
