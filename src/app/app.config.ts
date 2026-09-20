import { ApplicationConfig, inject, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { provideHubTranslationAdapter } from 'ng-hub-ui-utils';
import { provideToast } from 'ng-hub-ui-toast';
import { provideHubIcons } from 'ng-hub-ui-icons';
import { appIconPack } from './core/icons/app-icon-pack';
import { AVAILABLE_LANGUAGES } from './core/i18n/language-store';
import { TranslationLoader } from './core/i18n/translation-loader';
import { routes } from './app.routes';

// Dates and numbers follow the chosen language, so Spanish has to be known
// to Angular before the first render.
registerLocaleData(localeEs);

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
		provideHubIcons({ defaultPack: 'app', packs: { app: appIconPack } }),
		// The table, the stepper and the calendar read their own labels through
		// this bridge, so the whole app follows one language switch.
		provideHubTranslationAdapter(() => ({
			dictionary: inject(TranslocoService).selectTranslateObject('HUB')
		})),
		provideToast({ progressBar: true, timeOut: 4000, positionClass: 'toast-bottom-right' })
	]
};
