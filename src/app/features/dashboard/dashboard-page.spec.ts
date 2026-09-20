import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { DEMO_DATABASE_OPTIONS, DemoDatabase } from '../../core/data/demo-database';
import { en, es } from '../../testing/translations';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
	beforeEach(async () => {
		localStorage.clear();
		await TestBed.configureTestingModule({
			imports: [
				DashboardPage,
				TranslocoTestingModule.forRoot({
					langs: { en, es },
					translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en', reRenderOnLangChange: true },
					preloadLangs: true
				})
			],
			providers: [provideRouter([]), { provide: DEMO_DATABASE_OPTIONS, useValue: { minDelay: 0, maxDelay: 0 } }]
		}).compileComponents();
	});

	it('paints the four figures once the data is in', async () => {
		const fixture = TestBed.createComponent(DashboardPage);
		await fixture.whenStable();

		const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
		expect(text).toContain('Delivered on time');
		expect(text).toContain('Active projects');
		expect(text).toContain('Overdue tasks');
		expect(text).toContain('Hours in flight');
	});

	it('offers a retry when the load fails, and recovers on it', async () => {
		const db = TestBed.inject(DemoDatabase);
		db.failing.set(true);

		const fixture = TestBed.createComponent(DashboardPage);
		await fixture.whenStable();

		const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
		expect(alert?.textContent).toContain('could not be loaded');

		db.failing.set(false);
		(alert?.querySelector('button') as HTMLButtonElement).click();
		await fixture.whenStable();

		expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')).toBeNull();
		expect((fixture.nativeElement as HTMLElement).textContent).toContain('Active projects');
	});
});
