import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HubActiveModal } from 'ng-hub-ui-modal';
import { HubButtonComponent } from 'ng-hub-ui-buttons';
import { HubDatepickerComponent, HubInputComponent, HubSelectComponent } from 'ng-hub-ui-forms';
import { StepComponent, StepperComponent } from 'ng-hub-ui-stepper';
import { PROJECT_STATUSES } from '../../../core/data/models';
import { LanguageStore } from '../../../core/i18n/language-store';
import { PeopleService } from '../../../core/data/people.service';
import { ProjectsService } from '../../../core/data/projects.service';

/**
 * Three steps, one form group each. The stepper never looks at a form, so the
 * next step is disabled from the previous group's validity — which is also the
 * only thing stopping someone from tabbing ahead.
 */
@Component({
	selector: 'app-new-project-dialog',
	imports: [
		ReactiveFormsModule,
		TranslocoPipe,
		HubButtonComponent,
		HubInputComponent,
		HubSelectComponent,
		HubDatepickerComponent,
		StepperComponent,
		StepComponent
	],
	templateUrl: './new-project-dialog.html',
	styleUrl: './new-project-dialog.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewProjectDialog {
	private readonly fb = inject(FormBuilder);
	private readonly projects = inject(ProjectsService);
	private readonly people = inject(PeopleService);
	private readonly languages = inject(LanguageStore);

	protected readonly activeModal = inject(HubActiveModal);
	private readonly statusLabels = toSignal(
		inject(TranslocoService).selectTranslateObject<Record<string, string>>('projectStatus'),
		{ initialValue: {} as Record<string, string> }
	);

	protected readonly locale = this.languages.locale;

	/**
	 * The datepicker names its months through `Intl` and its buttons through
	 * `labels`; both are inputs, so they follow the language switch instead of
	 * freezing at whatever LOCALE_ID said on boot.
	 */
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

	private readonly dateLabels = toSignal(
		inject(TranslocoService).selectTranslateObject<Record<string, string>>('datepicker'),
		{ initialValue: {} as Record<string, string> }
	);

	protected readonly statusOptions = computed(() =>
		PROJECT_STATUSES.map((status) => ({ value: status, label: this.statusLabels()[status] ?? status }))
	);
	protected readonly peopleResource = resource({ loader: () => this.people.list() });
	protected readonly saving = signal(false);

	protected readonly details = this.fb.nonNullable.group({
		name: ['', [Validators.required, Validators.minLength(3)]],
		client: ['', Validators.required],
		status: ['discovery', Validators.required]
	});

	protected readonly team = this.fb.nonNullable.group({
		ownerId: ['', Validators.required],
		budget: [10000, [Validators.required, Validators.min(1000)]]
	});

	protected readonly dates = this.fb.nonNullable.group({
		startDate: ['', Validators.required],
		dueDate: ['', Validators.required]
	});

	private readonly detailsStatus = toSignal(this.details.statusChanges, { initialValue: this.details.status });
	private readonly teamStatus = toSignal(this.team.statusChanges, { initialValue: this.team.status });
	private readonly datesStatus = toSignal(this.dates.statusChanges, { initialValue: this.dates.status });

	protected readonly detailsValid = computed(() => this.detailsStatus() === 'VALID');
	protected readonly teamValid = computed(() => this.teamStatus() === 'VALID');
	protected readonly canSubmit = computed(() => this.detailsValid() && this.teamValid() && this.datesStatus() === 'VALID');

	/**
	 * The stepper does not read forms, so its submit button fires whatever the
	 * last step holds. An incomplete form reveals its errors instead of failing
	 * silently.
	 */
	protected async submit(): Promise<void> {
		if (this.saving()) {
			return;
		}

		if (!this.canSubmit()) {
			for (const group of [this.details, this.team, this.dates]) {
				group.markAllAsTouched();
			}
			return;
		}

		this.saving.set(true);
		try {
			const created = await this.projects.create({
				...this.details.getRawValue(),
				...this.team.getRawValue(),
				startDate: toIsoDate(this.dates.getRawValue().startDate),
				dueDate: toIsoDate(this.dates.getRawValue().dueDate),
				status: this.details.getRawValue().status as (typeof PROJECT_STATUSES)[number],
				progress: 0
			});
			this.activeModal.close(created);
		} finally {
			this.saving.set(false);
		}
	}
}

/** The datepicker hands back a Date or an ISO string depending on the granularity. */
function toIsoDate(value: string | Date): string {
	const date = value instanceof Date ? value : new Date(value);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}
