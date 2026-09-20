import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { App } from './app';
import { routes } from './app.routes';
import { LanguageStore } from './core/i18n/language-store';
import { en, es } from './testing/translations';

describe('App shell', () => {
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
			],
			providers: [provideRouter(routes)]
		}).compileComponents();
	});

	it('renders the brand and the four sections', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();

		const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
		expect(text).toContain('Hub PM');
		for (const section of ['Dashboard', 'Projects', 'Board', 'Calendar']) {
			expect(text).toContain(section);
		}
	});

	it('relabels the navigation when the language changes', async () => {
		const fixture = TestBed.createComponent(App);
		await fixture.whenStable();

		TestBed.inject(LanguageStore).set('es');
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Tablero');
	});

	it('lands on the dashboard and reaches the other screens', async () => {
		const harness = await RouterTestingHarness.create('/');
		await harness.fixture.whenStable();

		expect(TestBed.inject(Router).url).toBe('/dashboard');

		await harness.navigateByUrl('/projects');
		await harness.fixture.whenStable();

		expect(TestBed.inject(Router).url).toBe('/projects');
	});
});
