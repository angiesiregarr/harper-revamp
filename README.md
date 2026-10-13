# Harper Hotels landing page

A responsive static landing page built from the [Harper brand website design in Figma](https://www.figma.com/design/N9Rb8PmYXvWn1N8oMHQAVw/Harper---Brand-Website?node-id=239-3). It uses approved Harper imagery and the brand's Cinzel, Lato, Orange and Gray visual language.

## Run locally

```sh
npm run build
npm run preview
```

Open <http://localhost:4173>. The site has no runtime dependencies. `npm run build` copies the static files to `dist/` for local preview or other static hosts.

## Routes and interactions

- `?city=jakarta`, `?city=bali`, `?city=yogyakarta` and `?city=makassar` select city routes. Jakarta is the default. The hotel gallery previews images on hover, keyboard focus, or tap without navigating.
- The navigation starts after the hero and sticks when it reaches the top of the viewport.
- Offer cards scroll past a pinned title on desktop. The title returns to normal flow on smaller screens.
- The moments gallery moves continuously on pointer devices, pauses on hover or keyboard focus, and becomes swipeable on touch screens. Reduced-motion users get a static, scrollable gallery.
- Section headings, offer cards, and journal images reveal as they enter view. The hero has a short entrance sequence, links and cards respond to hover or focus, the navigation shows reading progress, and the membership image drifts gently while scrolling on desktop. These decorative effects are disabled or simplified for reduced-motion users.
- Booking and membership links lead to the official Harper or Archipelago websites. Journal buttons open readable story dialogs.

## Deployment

GitHub Pages serves the static files from the root of `main`. In repository **Settings → Pages**, the source is **Deploy from a branch** with **main** and **/(root)** selected. Every push to `main` automatically starts a Pages build and publishes the update at <https://angiesiregarr.github.io/harper-revamp/>.
