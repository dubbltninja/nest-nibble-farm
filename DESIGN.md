# Design notes

**What the site is.** The bench record of a two-person selective hatch in Henderson, Maryland: what is in the yard, what colour each line lays, and what the DNA bench can tell you the same day. A register, not a storefront.

**Palette and type.** The colours and typefaces are the ones the site used before the redesign; the redesign's own palette and fonts were tried and reverted. The tokens are at the top of `css/styles.css`:

| Token | Value |
| --- | --- |
| `--bg`, `--bg-2`, `--slab` | dark greens for page grounds, header, footer and call-to-action blocks |
| `--light` | text on dark grounds |
| `--chalk`, `--cream` | light surfaces for breed lists, forms and the DNA panels |
| `--blue`, `--green`, `--choc`, `--cream` | the egg colours, used in the palette scene and the scale on the left edge |
| `--ink` | text on light surfaces |
| `--red` | the gold accent (name kept from the redesign), for markers and hover states |

Headings are Cormorant Garamond and body text is Sora, both from Google Fonts. Text does not change width or size with scroll; that effect was tried and removed.

**Motion.** Scroll position is the only clock. `js/main.js` publishes `--p` (0 to 1) on every `[data-scene]` (pinned scenes) and `[data-scrub]` (elements passing through the viewport), plus `--page-p` for the shell scale on the left edge. CSS does all the drawing from those numbers. There are no timed or looping animations.

- Home hero: an egg-shaped aperture on the farm photo opens to full bleed.
- Shell palette: one pinned scene, four chapters, the ground changes colour.
- Chicken lines: one pinned strip that travels sideways.
- DNA page: gel bands migrate, a 16-well rack fills (16 samples a day is the real capacity).

**Still version.** The base CSS is a complete page with nothing pinned or hidden. The pinned layouts live under `.motion`, which the script adds only when reduced motion is not requested.

**Content rules.** Copy, breed list, statuses and photos are real. Photos load from Cloudinary using `data/breeds.json`; the SVGs in `assets/images` are fallbacks. Do not add breeds, prices, testimonials or certifications. NPIP certification is pending.
