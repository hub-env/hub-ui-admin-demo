import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { EventsService } from '../../core/data/events.service';
import { en, es } from '../../testing/translations';
import { provideTestingHubUi } from '../../testing/test-providers';
import { CalendarPage } from './calendar-page';

type Exposed = {
	calendarEvents: () => { id: string | number; title: string; start: Date; end: Date; allDay?: boolean }[];
	onEventDrop: (drop: unknown) => Promise<void>;
};

describe('CalendarPage', () => {
	beforeEach(async () => {
		localStorage.clear();
		await TestBed.configureTestingModule({
			imports: [
				CalendarPage,
				TranslocoTestingModule.forRoot({
					langs: { en, es },
					translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en', reRenderOnLangChange: true },
					preloadLangs: true
				})
			],
			providers: [...provideTestingHubUi()]
		}).compileComponents();
	});

	async function render() {
		const fixture = TestBed.createComponent(CalendarPage);
		await fixture.whenStable();
		return { fixture, component: fixture.componentInstance as unknown as Exposed };
	}

	it('hands the calendar dates, not the stored strings', async () => {
		const { component } = await render();

		const events = component.calendarEvents();
		expect(events.length).toBeGreaterThan(0);
		expect(events.every((event) => event.start instanceof Date && event.end instanceof Date)).toBe(true);
	});

	it('marks a holiday as an all-day event', async () => {
		const { component } = await render();
		const stored = await TestBed.inject(EventsService).listRange('2000-01-01', '2100-01-01');
		const holiday = stored.find((event) => event.kind === 'holiday');

		if (!holiday) {
			return;
		}
		expect(component.calendarEvents().find((event) => event.id === holiday.id)?.allDay).toBe(true);
	});

	it('moves the day on a drop and keeps the time and the length', async () => {
		const { fixture, component } = await render();
		const events = TestBed.inject(EventsService);
		const source = (await events.listRange('2000-01-01', '2100-01-01'))[0];
		const before = { start: new Date(source.start), end: new Date(source.end) };
		const target = new Date(before.start);
		target.setDate(target.getDate() + 3);

		await component.onEventDrop({ event: { data: source }, newDate: target });
		await fixture.whenStable();

		const after = (await events.listRange('2000-01-01', '2100-01-01')).find((event) => event.id === source.id)!;
		const start = new Date(after.start);
		expect(start.getDate()).toBe(target.getDate());
		expect(start.getHours()).toBe(before.start.getHours());
		expect(Date.parse(after.end) - Date.parse(after.start)).toBe(before.end.getTime() - before.start.getTime());
	});
});
