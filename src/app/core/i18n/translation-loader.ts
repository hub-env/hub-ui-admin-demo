import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

/**
 * Loads each language from public/i18n, so adding a language is dropping a
 * file in and listing it in the config.
 */
@Injectable({ providedIn: 'root' })
export class TranslationLoader implements TranslocoLoader {
	private readonly http = inject(HttpClient);

	getTranslation(lang: string) {
		return this.http.get<Translation>(`/i18n/${lang}.json`);
	}
}
