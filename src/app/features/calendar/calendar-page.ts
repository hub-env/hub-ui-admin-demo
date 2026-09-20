import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CalendarEvent as HubCalendarEvent, CalendarViewType, HubCalendarComponent } from 'ng-hub-ui-calendar';
import { HubModal } from 'ng-hub-ui-modal';
import { HubToastService } from 'ng-hub-ui-toast';
import { CalendarEvent } from '../../core/data/models';
import { EventsService } from '../../core/data/events.service';
import { ProjectsService } from '../../core/data/projects.service';
import { LanguageStore } from '../../core/i18n/language-store';
import { EventDialog, EventDialogData } from './event-dialog/event-dialog';

/** Six months around today: enough to navigate without paging the service. */
const RANGE_MONTHS = 3;

@Component({
	selector: 'app-calendar-page',
	imports: [TranslocoPipe, HubCalendarComponent],
	templateUrl: './calendar-page.html',
	styleUrl: './calendar-page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPage {
	private readonly events = inject(EventsService);
	private readonly projects = inject(ProjectsService);
	private readonly transloco = inject(TranslocoService);
	private readonly languages = inject(LanguageStore);
	private readonly modal = inject(HubModal);
	private readonly toast = inject(HubToastService);

	protected readonly CalendarViewType = CalendarViewType;
	protected readonly view = signal<CalendarViewType>(CalendarViewType.MONTH);
	protected readonly selectedDate = signal(new Date());
	protected readonly language = this.languages.language;
	protected readonly locale = this.languages.locale;

	protected readonly eventsResource = resource({
		loader: () => {
			const from = new Date();
			from.setMonth(from.getMonth() - RANGE_MONTHS);
			const to = new Date();
			to.setMonth(to.getMonth() + RANGE_MONTHS);
			return this.events.listRange(from.toISOString(), to.toISOString());
		}
	});

	protected readonly projectsResource = resource({ loader: () => this.projects.list({ perPage: 100 }) });

	/** The calendar works in Date; the data layer stores ISO strings. */
	protected readonly calendarEvents = computed<HubCalendarEvent<CalendarEvent>[]>(() =>
		(this.eventsResource.value() ?? []).map((event) => ({
			id: event.id,
			title: event.title,
			start: new Date(event.start),
			end: new Date(event.end),
			allDay: event.kind === 'holiday',
			cssClass: `event event--${event.kind}`,
			data: event
		}))
	);

	protected async onEventDrop(drop: { event: HubCalendarEvent<CalendarEvent>; newDate: Date }): Promise<void> {
		const source = drop.event.data;
		if (!source) {
			return;
		}

		// Dropping moves the day and keeps the time the event already had.
		const start = withDateOf(new Date(source.start), drop.newDate);
		const end = new Date(start.getTime() + (Date.parse(source.end) - Date.parse(source.start)));

		try {
			await this.events.update(source.id, { start: start.toISOString(), end: end.toISOString() });
			this.eventsResource.reload();
			this.toast.success(
				this.transloco.translate('calendar.saved', {
					title: source.title,
					date: start.toLocaleDateString(this.locale())
				})
			);
		} catch {
			this.eventsResource.reload();
			this.toast.error(this.transloco.translate('states.error'));
		}
	}

	protected openEvent(event: HubCalendarEvent<CalendarEvent>): void {
		const source = event.data;
		if (!source) {
			return;
		}

		const data: EventDialogData = {
			event: source,
			projects: this.projectsResource.value()?.data ?? []
		};

		this.modal
			.open(EventDialog, {
				size: 'lg',
				headerSelector: '.hub-modal__header',
				footerSelector: '.hub-modal__footer',
				data
			})
			.result.then((updated: CalendarEvent | undefined) => {
				if (!updated) {
					return;
				}
				this.eventsResource.reload();
				this.toast.success(this.transloco.translate('calendar.updated', { title: updated.title }));
			})
			.catch(() => {
				/* dismissed */
			});
	}
}

/** Keeps the clock of `time` and takes the calendar day of `day`. */
function withDateOf(time: Date, day: Date): Date {
	const result = new Date(day);
	result.setHours(time.getHours(), time.getMinutes(), 0, 0);
	return result;
}
