import { Provider, EnvironmentProviders, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { provideHubIcons } from 'ng-hub-ui-icons';
import { provideHubTranslationAdapter } from 'ng-hub-ui-utils';
import { provideToast } from 'ng-hub-ui-toast';
import { appIconPack } from '../core/icons/app-icon-pack';
import { DEMO_DATABASE_OPTIONS } from '../core/data/demo-database';

/**
 * What every component test needs from the application's own configuration.
 * Components pull these through `inject()`, so leaving them out fails at
 * render time rather than at compile time — which is exactly the kind of gap
 * a test should not have to rediscover.
 *
 * The fake latency is zero here: waiting is behaviour of the demo, not of the
 * code under test.
 */
export function provideTestingHubUi(): (Provider | EnvironmentProviders)[] {
	return [
		{ provide: DEMO_DATABASE_OPTIONS, useValue: { minDelay: 0, maxDelay: 0 } },
		provideHubIcons({ defaultPack: 'app', packs: { app: appIconPack } }),
		provideHubTranslationAdapter(() => ({
			dictionary: inject(TranslocoService).selectTranslateObject('HUB')
		})),
		provideToast()
	];
}
