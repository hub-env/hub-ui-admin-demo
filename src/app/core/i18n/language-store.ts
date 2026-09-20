import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export const AVAILABLE_LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof AVAILABLE_LANGUAGES)[number];

const STORAGE_KEY = 'hub-pm.language';

/**
 * Remembers the chosen language between visits. Transloco owns the active
 * language; this store only decides which one it starts with and writes the
 * choice down.
 */
@Injectable({ providedIn: 'root' })
export class LanguageStore {
	private readonly transloco = inject(TranslocoService);
	private readonly current = signal<Language>(storedLanguage() ?? 'en');

	readonly language = this.current.asReadonly();
	readonly available = AVAILABLE_LANGUAGES;

	constructor() {
		this.transloco.setActiveLang(this.current());
	}

	set(language: Language): void {
		this.current.set(language);
		this.transloco.setActiveLang(language);
		try {
			localStorage.setItem(STORAGE_KEY, language);
		} catch {
			/* the preference is not persisted */
		}
	}
}

function storedLanguage(): Language | null {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return AVAILABLE_LANGUAGES.includes(stored as Language) ? (stored as Language) : null;
	} catch {
		return null;
	}
}
