/**
 * Global test setup (Vitest + jsdom).
 *
 * jsdom does not implement `window.matchMedia`, which the theme store and
 * several ng-hub-ui components rely on for responsive behaviour. A minimal
 * no-op stub keeps them renderable under test.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
	window.matchMedia = (query: string): MediaQueryList =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false
		}) as MediaQueryList;
}
