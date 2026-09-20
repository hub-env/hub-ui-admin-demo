# Hub PM — the Hub UI demo app

A project management app built only with [Hub UI](https://github.com/hub-env/hub-ui)
packages: navigation, data table, kanban board, calendar, forms, stepper, modal
and toasts, with no other UI framework in the dependency tree.

It installs the `ng-hub-ui-*` packages from npm, exactly as any consumer would,
so cloning this repository is also a check that the published packages work
together.

> Work in progress. The screens land one by one; the live demo goes up at the
> end of the first phase.

## Run it

```bash
npm install   # npm 11 or later
npm start
```

Then open http://localhost:4200.

## Stack

Angular 22, standalone and zoneless, with signals and `OnPush`. Vitest for the
tests, Transloco for English and Spanish, and the `ng-hub-ui-ds` design tokens
for both themes.

## Part of Hub UI

Stars, issues and the roadmap live in the main repository:
[hub-env/hub-ui](https://github.com/hub-env/hub-ui).

## License

MIT — see [LICENSE](./LICENSE).
