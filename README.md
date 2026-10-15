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
- The moments gallery moves continuously on pointer devices, pauses on hover or keyboard focus, and becomes swipeable on touch screens. Reduced-motion users get a static, scrollable gallery.
- The hero uses the supplied Gradient 1 artwork, a two-line heading, orange membership accents, and a draggable React Bits image orbit. Section headings, offer cards, and journal images reveal as they enter view. Decorative motion is disabled or simplified for reduced-motion users.
- Booking and membership links lead to the official Harper or Archipelago websites. Journal buttons open readable story dialogs.

## Deployment

GitHub Pages serves the static files from the root of `main`. In repository **Settings → Pages**, the source is **Deploy from a branch** with **main** and **/(root)** selected. Every push to `main` automatically starts a Pages build and publishes the update at <https://angiesiregarr.github.io/harper-revamp/>.
