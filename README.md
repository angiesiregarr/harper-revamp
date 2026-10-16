# Harper Hotels landing page

A responsive static landing page built from the [Harper brand website design in Figma](https://www.figma.com/design/N9Rb8PmYXvWn1N8oMHQAVw/Harper---Brand-Website?node-id=239-3). It uses approved Harper imagery and the brand's Cinzel, Lato, Orange and Gray visual language.

## Run locally

```sh
npm run build
npm run preview
```

Run `npm install` once, then open <http://localhost:4173>. The build bundles the React Bits hero carousel and copies the static site to `dist/`.

## Routes and interactions

- `?city=jakarta`, `?city=bali`, `?city=yogyakarta` and `?city=makassar` select city routes. Jakarta is the default. The hotel gallery previews images on hover, keyboard focus, or tap without navigating.
- The navigation stays at the top and becomes more compact on scroll without changing link font sizes. Its Book Now button opens the booking dialog.
- Offer cards scroll past a pinned title on desktop. The title returns to normal flow on smaller screens.
- The Journal presents six linked articles on a raised ivory panel over a matching floral paper surface. A separate linear-gradient frame blends the supplied grayscale cloud artwork into the gray Moments section.
- The Moments gallery shows five social previews with arrow-key, button, side-card, and touch-swipe navigation. The previews currently link to Harper's Instagram profile; individual reel URLs are not in the project.
- The hero has a two-line heading, orange membership accents, and a draggable React Bits image orbit. Each major section has a distinct scroll entrance; the supplied title ornaments change from color to white over darker backgrounds. Decorative motion is disabled or simplified for reduced-motion users.
- Booking and membership links lead to the official Harper or Archipelago websites. Journal cards link to their article pages.

## React Bits Pro

`components.json` includes the React Bits Pro registry aliases and references `REACTBITS_LICENSE_KEY` through the Authorization header. The shadcn installer validates the setup but stops because `REACTBITS_LICENSE_KEY` is not configured in this workspace. Once the key is available, run `npx shadcn@latest add @reactbits-starter/scroll-portal-tw`, then integrate the returned React component into the site's build. The current scroll entrances use the site's local JavaScript and CSS.

## Deployment

GitHub Pages serves the static files from the root of `main`. In repository **Settings → Pages**, the source is **Deploy from a branch** with **main** and **/(root)** selected. Every push to `main` automatically starts a Pages build and publishes the update at <https://angiesiregarr.github.io/harper-revamp/>.
