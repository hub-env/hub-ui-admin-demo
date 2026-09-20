import { Injectable, inject } from '@angular/core';
import { DemoDatabase } from './demo-database';
import { CalendarEvent } from './models';

export type CalendarEventDraft = Omit<CalendarEvent, 'id'>;

@Injectable({ providedIn: 'root' })
export class EventsService {
	private readonly db = inject(DemoDatabase);

	/** Events overlapping [from, to), both ISO date-times. */
	listRange(from: string, to: string): Promise<CalendarEvent[]> {
		return this.db.read(({ events }) =>
			events
				.filter((event) => event.start < to && event.end > from)
				.sort((left, right) => left.start.localeCompare(right.start))
		);
	}

	create(draft: CalendarEventDraft): Promise<CalendarEvent> {
		return this.db.write((data) => {
			const event: CalendarEvent = { ...draft, id: `event-${data.events.length + 1}` };
			return { data: { ...data, events: [...data.events, event] }, result: event };
		});
	}

	update(id: string, changes: Partial<CalendarEventDraft>): Promise<CalendarEvent> {
		return this.db.write((data) => {
			const events = data.events.map((event) => (event.id === id ? { ...event, ...changes } : event));
			const updated = events.find((event) => event.id === id);
			if (!updated) {
				throw new Error(`Unknown event: ${id}`);
			}
			return { data: { ...data, events }, result: updated };
		});
	}
}
