import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HUB_MODAL_DATA, HubActiveModal } from 'ng-hub-ui-modal';
import { HubButtonComponent } from 'ng-hub-ui-buttons';
import { HubDatepickerComponent, HubInputComponent, HubSelectComponent } from 'ng-hub-ui-forms';
import { CalendarEvent, CalendarEventKind, Project } from '../../../core/data/models';
import { EventsService } from '../../../core/data/events.service';
import { LanguageStore } from '../../../core/i18n/language-store';

export interface EventDialogData {
	event: CalendarEvent;
	projects: Project[];
}

const KINDS: readonly CalendarEventKind[] = ['meeting', 'delivery', 'review', 'holiday'];

@Component({
	selector: 'app-event-dialog',
	imports: [
		ReactiveFormsModule,
		TranslocoPipe,
		HubButtonComponent,
		HubInputComponent,
		HubSelectComponent,
		HubDatepickerComponent
	],
	templateUrl: './event-dialog.html',
	styleUrl: './event-dialog.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventDialog {
	private readonly fb = inject(FormBuilder);
	private readonly events = inject(EventsService);
	private readonly transloco = inject(TranslocoService);
	private readonly languages = inject(LanguageStore);

	protected readonly activeModal = inject(HubActiveModal);
	protected readonly data = inject<EventDialogData>(HUB_MODAL_DATA);
	protected readonly locale = this.languages.locale;
	protected readonly saving = signal(false);

	protected readonly form = this.fb.nonNullable.group({
		title: [this.data.event.title, [Validators.required, Validators.minLength(3)]],
		kind: [this.data.event.kind as string, Validators.required],
		projectId: [this.data.event.projectId ?? ''],
		start: [this.data.event.start, Validators.required],
		end: [this.data.event.end, Validators.required]
	});

	private readonly kindLabels = toSignal(this.transloco.selectTranslateObject<Record<string, string>>('eventKind'), {
		initialValue: {} as Record<string, string>
	});
	private readonly dateLabels = toSignal(this.transloco.selectTranslateObject<Record<string, string>>('datepicker'), {
		initialValue: {} as Record<string, string>
	});

	protected readonly kindOptions = computed(() =>
		KINDS.map((kind) => ({ value: kind, label: this.kindLabels()[kind] ?? kind }))
	);

	protected readonly projectOptions = computed(() => this.data.projects);

	protected readonly datepickerLabels = computed(() => {
		const labels = this.dateLabels();
		return {
			openCalendar: labels['openCalendar'] ?? 'Open calendar',
			previousMonth: labels['previousMonth'] ?? 'Previous month',
			nextMonth: labels['nextMonth'] ?? 'Next month',
			previousYear: labels['previousYear'] ?? 'Previous year',
			nextYear: labels['nextYear'] ?? 'Next year',
			today: labels['today'] ?? 'Today',
			clear: labels['clear'] ?? 'Clear'
		};
	});

	protected async save(): Promise<void> {
		if (this.saving()) {
			return;
		}
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.saving.set(true);
		try {
			const value = this.form.getRawValue();
			const updated = await this.events.update(this.data.event.id, {
				title: value.title,
				kind: value.kind as CalendarEventKind,
				projectId: value.projectId || null,
				start: toIso(value.start),
				end: toIso(value.end)
			});
			this.activeModal.close(updated);
		} finally {
			this.saving.set(false);
		}
	}
}

/** The datepicker hands back a Date once a new point is picked, a string otherwise. */
function toIso(value: string | Date): string {
	return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
