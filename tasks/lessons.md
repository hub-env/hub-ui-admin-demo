# Lessons

## 2026-09-20 — A screen is not done until it has been opened in a browser

**Context:** closing step 3 of the phase 1 plan, the shell every screen sits in.
**Mistake:** the step was reported as finished on the strength of a green test
suite and a clean build. In the browser the navigation printed its translation
keys, the sidebar stopped halfway down the page, the collapsed nav left a dead
strip on phones and two controls sat at 1.8:1 against the dark theme.
**Rule:** any step that renders something opens in Chrome before it is called
done — light, dark and phone width, with the console read. jsdom renders markup,
not layout, and it never says a colour is unreadable. If the browser cannot be
driven, say so and stop rather than close the step on the tests alone.
