import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { App } from './app';
import { LanguageStore } from './core/i18n/language-store';

const en = {
	app: { name: 'Hub PM', tagline: 'Built with Hub UI' },
	theme: { toLight: 'Light', toDark: 'Dark' },
	language: { label: 'Language' }
};
const es = {
	app: { name: 'Hub PM', tagline: 'Hecha con Hub UI' },
	theme: { toLight: 'Claro', toDark: 'Oscuro' },
	language: { label: 'Idioma' }
};

describe('App', () => {
	beforeEach(async () => {
		localStorage.clear();
		await TestBed.configureTestingModule({
			imports: [
				App,
				TranslocoTestingModule.forRoot({
					langs: { en, es },
					translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en', reRenderOnLangChange: true },
					preloadLangs: true
				})
			]
		}).compileComponents();
	});

	it('renders the app name', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hub PM');
	});

	it('follows the active language', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();

		TestBed.inject(LanguageStore).set('es');
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Idioma');
	});
});
