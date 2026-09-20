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

## 2026-09-20 — A structural directive swallows what a slot-based API projects

**Context:** the new-project wizard and the board's detail drawer, both opened
through `HubModal` with `headerSelector` / `footerSelector`.
**Mistake:** each template was wrapped in `<ng-container *transloco="let t">`.
The modal looks for those selectors among the projected nodes, a structural
directive puts them inside an embedded view, and the search finds nothing: the
header and the footer rendered empty and the whole dialog piled into the body.
It compiled, it showed no error, and the tests passed — the damage was only
visible on screen, and Carlos caught it in a screenshot before I did.
**Rule:** when a library takes content by selector or by slot, nothing wraps
those elements — no `*ngIf`, no `*transloco`, no `@if` around the slot itself.
Translate with the pipe inside each slot instead, and check the rendered
children of the host, not just that the text is somewhere on screen.
