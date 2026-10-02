# Design notes

**What the site is.** The bench record of a two-person selective hatch in Henderson, Maryland: what is in the yard, what colour each line lays, and what the DNA bench can tell you the same day. A register, not a storefront.

**The idea: shell as ground.** Every surface is one of the shell colours the flock is bred toward, used flat and full-bleed. The tokens are at the top of `css/styles.css`:

| Token | Source |
| --- | --- |
| `--blue` | Ameraucana shell, the home ground |
| `--green` | olive / green egg |
| `--choc` | Marans shell, carries the speckle |
| `--cream` | Faverolles tint |
| `--chalk` | bloom white with a blue cast, used for forms and the header |
| `--ink` | darkest Marans brown, all text |
| `--red` | comb red, only for actions and the reading marker |

The only curve is the egg (the home aperture, the palette shell, the sample wells). Everything else is square.

**Type.** Anybody for display, Golos Text for reading, both from Google Fonts. Headings use fixed widths of Anybody's width axis. Text does not change width or size with scroll; that effect was tried and removed.

**Motion.** Scroll position is the only clock. `js/main.js` publishes `--p` (0 to 1) on every `[data-scene]` (pinned scenes) and `[data-scrub]` (elements passing through the viewport), plus `--page-p` for the shell scale on the left edge. CSS does all the drawing from those numbers. There are no timed or looping animations.

- Home hero: an egg-shaped aperture on the farm photo opens to full bleed.
- Shell palette: one pinned scene, four chapters, the ground changes colour.
- Chicken lines: one pinned strip that travels sideways.
- DNA page: gel bands migrate, a 16-well rack fills (16 samples a day is the real capacity).

**Still version.** The base CSS is a complete page with nothing pinned or hidden. The pinned layouts live under `.motion`, which the script adds only when reduced motion is not requested.

**Content rules.** Copy, breed list, statuses and photos are real. Photos load from Cloudinary using `data/breeds.json`; the SVGs in `assets/images` are fallbacks. Do not add breeds, prices, testimonials or certifications. NPIP certification is pending.
