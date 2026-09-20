import { Injectable, computed, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'hub-pm.theme';

/**
 * Single source of truth for the active theme.
 *
 * ng-hub-ui-ds themes through the `data-theme` attribute on <html>, so the
 * store's only job is to keep that attribute, the signal and localStorage in
 * step. index.html sets the same attribute before Angular boots to avoid a
 * flash of the wrong theme; this store reads that value back on startup.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
	private readonly current = signal<Theme>(initialTheme());

	readonly theme = this.current.asReadonly();
	readonly isDark = computed(() => this.current() === 'dark');

	constructor() {
		effect(() => {
			const theme = this.current();
			document.documentElement.dataset['theme'] = theme;
			// Private browsing and blocked site data make this throw; the app
			// still works, it just forgets the choice.
			try {
				localStorage.setItem(STORAGE_KEY, theme);
			} catch {
				/* the preference is not persisted */
			}
		});
	}

	set(theme: Theme): void {
		this.current.set(theme);
	}

	toggle(): void {
		this.current.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
	}
}

function initialTheme(): Theme {
	const fromAttribute = document.documentElement.dataset['theme'];
	if (fromAttribute === 'dark' || fromAttribute === 'light') {
		return fromAttribute;
	}
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
