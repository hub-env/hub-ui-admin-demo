import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideHubIcons } from 'ng-hub-ui-icons';
import { appIconPack } from './core/icons/app-icon-pack';
import { AVAILABLE_LANGUAGES } from './core/i18n/language-store';
import { TranslationLoader } from './core/i18n/translation-loader';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes, withComponentInputBinding()),
		provideHttpClient(withFetch()),
		provideTransloco({
			config: {
				availableLangs: [...AVAILABLE_LANGUAGES],
				defaultLang: 'en',
				fallbackLang: 'en',
				reRenderOnLangChange: true,
				prodMode: !isDevMode()
			},
			loader: TranslationLoader
		}),
		provideHubIcons({ defaultPack: 'app', packs: { app: appIconPack } })
	]
};
