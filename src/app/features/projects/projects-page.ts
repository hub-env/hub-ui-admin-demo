import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { HubButtonComponent } from 'ng-hub-ui-buttons';
import { HubIconComponent } from 'ng-hub-ui-icons';
import { HubModal } from 'ng-hub-ui-modal';
import { HubToastService } from 'ng-hub-ui-toast';
import { DatePipe, PercentPipe } from '@angular/common';
import { HubBadgeComponent } from 'ng-hub-ui-badges';
import {
	PaginableTableCellDirective,
	PaginableTableHeader,
	PaginableTableOrdination,
	TableComponent
} from 'ng-hub-ui-paginable';
import { PROJECT_STATUSES, Project } from '../../core/data/models';
import { PeopleService } from '../../core/data/people.service';
import { ProjectsService } from '../../core/data/projects.service';
import { ListQuery, Sort } from '../../core/data/query';
import { LanguageStore } from '../../core/i18n/language-store';
import { NewProjectDialog } from './new-project-dialog/new-project-dialog';

@Component({
	selector: 'app-projects-page',
	imports: [
		DatePipe,
		PercentPipe,
		FormsModule,
		TranslocoDirective,
		HubBadgeComponent,
		HubButtonComponent,
		HubIconComponent,
		PaginableTableCellDirective,
		TableComponent
	],
	templateUrl: './projects-page.html',
	styleUrl: './projects-page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsPage {
	private readonly projects = inject(ProjectsService);
	private readonly people = inject(PeopleService);
	private readonly transloco = inject(TranslocoService);
	private readonly languages = inject(LanguageStore);
	private readonly modal = inject(HubModal);
	private readonly toast = inject(HubToastService);

	protected readonly page = signal(1);
	protected readonly perPage = signal(10);
	protected readonly searchTerm = signal('');
	protected readonly ordination = signal<PaginableTableOrdination | undefined>({
		property: 'dueDate',
		direction: 'asc'
	});
	protected readonly filters = signal<Record<string, unknown>>({});
	protected readonly selection = signal<Project[]>([]);

	private readonly labels = toSignal(this.transloco.selectTranslateObject<Record<string, string>>('projects'), {
		initialValue: {} as Record<string, string>
	});
	private readonly statusLabels = toSignal(this.transloco.selectTranslateObject<Record<string, string>>('projectStatus'), {
		initialValue: {} as Record<string, string>
	});

	/** What the service is asked for. Every table control feeds this. */
	private readonly query = computed<ListQuery>(() => ({
		page: this.page(),
		perPage: this.perPage(),
		search: this.searchTerm(),
		sort: toSort(this.ordination()),
		filters: normaliseFilters(this.filters())
	}));

	protected readonly projectsResource = resource({
		params: () => this.query(),
		loader: ({ params }) => this.projects.list(params)
	});

	protected readonly peopleResource = resource({ loader: () => this.people.list() });

	protected readonly headers = computed<PaginableTableHeader[]>(() => {
		const labels = this.labels();
		const statuses = this.statusLabels();
		return [
			{ property: 'code', title: labels['code'] ?? '', sortable: true },
			{ property: 'name', title: labels['name'] ?? '', sortable: true },
			{ property: 'client', title: labels['client'] ?? '', sortable: true },
			{
				property: 'status',
				title: labels['status'] ?? '',
				sortable: true,
				filter: {
					type: 'dropdown',
					mode: 'menu',
					options: PROJECT_STATUSES.map((status) => ({ value: status, label: statuses[status] ?? status })),
					bindLabel: 'label',
					bindValue: 'value'
				}
			},
			{
				property: 'ownerId',
				title: labels['owner'] ?? '',
				filter: {
					type: 'dropdown',
					mode: 'menu',
					options: (this.peopleResource.value() ?? []).map((person) => ({
						value: person.id,
						label: person.name
					})),
					bindLabel: 'label',
					bindValue: 'value'
				}
			},
			{ property: 'dueDate', title: labels['dueDate'] ?? '', sortable: true, align: 'end' },
			{ property: 'progress', title: labels['progress'] ?? '', sortable: true, align: 'end' }
		];
	});

	/**
	 * `title` carries the visible text: the batch bar renders `button.title`
	 * and ignores `label`, whatever the type says. Both are set so the action
	 * reads the same if that changes.
	 */
	protected readonly batchActions = computed(() => [
		{
			title: this.labels()['archive'] ?? '',
			label: this.labels()['archive'] ?? '',
			color: 'danger' as const,
			variant: 'soft' as const,
			handler: (items: ReadonlyArray<Project>) => void this.archive(items)
		}
	]);

	/**
	 * A new search or filter starts reading from page one: staying on page
	 * seven of a result set that now has two pages shows an empty table.
	 */
	protected onSearch(term: string | null): void {
		this.searchTerm.set(term ?? '');
		this.page.set(1);
	}

	protected onFilters(filters: Record<string, unknown> | null): void {
		this.filters.set(filters ?? {});
		this.page.set(1);
	}

	protected onPage(page: number | null): void {
		this.page.set(page ?? 1);
	}

	protected onPerPage(perPage: number | null): void {
		this.perPage.set(perPage ?? 10);
	}

	protected onOrdination(ordination: PaginableTableOrdination | undefined | null): void {
		this.ordination.set(ordination ?? undefined);
	}

	protected async archive(items: ReadonlyArray<Project>): Promise<void> {
		if (!items.length) {
			return;
		}
		try {
			await this.projects.archive(items.map((project) => project.id));
			this.selection.set([]);
			this.projectsResource.reload();
			this.toast.success(this.transloco.translate('projects.archived', { count: items.length }));
		} catch {
			this.toast.error(this.transloco.translate('states.error'));
		}
	}

	protected openNewProject(): void {
		this.modal
			.open(NewProjectDialog, {
				size: 'lg',
				headerSelector: '.hub-modal__header',
				footerSelector: '.hub-modal__footer'
			})
			.result.then((created: Project | undefined) => {
				if (!created) {
					return;
				}
				this.page.set(1);
				this.searchTerm.set('');
				this.projectsResource.reload();
				this.toast.success(this.transloco.translate('projects.created', { name: created.name }));
			})
			.catch(() => {
				/* dismissed */
			});
	}

	protected readonly locale = this.languages.locale;

	protected personName(id: string): string {
		return (this.peopleResource.value() ?? []).find((person) => person.id === id)?.name ?? '';
	}

	protected statusColor(status: string): 'success' | 'warning' | 'info' | 'neutral' {
		switch (status) {
			case 'active':
				return 'success';
			case 'on-hold':
				return 'warning';
			case 'delivered':
				return 'info';
			default:
				return 'neutral';
		}
	}
}

/** The table types its direction as a plain string; the data layer names the two it accepts. */
function toSort(ordination: PaginableTableOrdination | undefined): Sort | null {
	if (!ordination) {
		return null;
	}
	return { property: ordination.property, direction: ordination.direction === 'desc' ? 'desc' : 'asc' };
}

/** The table hands back single values or arrays; the service wants arrays. */
function normaliseFilters(filters: Record<string, unknown>): Record<string, ReadonlyArray<string>> {
	const result: Record<string, ReadonlyArray<string>> = {};
	for (const [key, value] of Object.entries(filters ?? {})) {
		if (value === null || value === undefined || value === '') {
			continue;
		}
		result[key] = Array.isArray(value) ? value.map(String) : [String(value)];
	}
	return result;
}
