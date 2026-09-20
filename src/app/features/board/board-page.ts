import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { Board, BoardCard, CardDragDropEvent, HubBoardComponent, HubCardTemplateDirective } from 'ng-hub-ui-board';
import { HubAvatarComponent } from 'ng-hub-ui-avatar';
import { HubBadgeComponent } from 'ng-hub-ui-badges';
import { HubSelectComponent } from 'ng-hub-ui-forms';
import { HubModal, HubModalPlacement } from 'ng-hub-ui-modal';
import { HubToastService } from 'ng-hub-ui-toast';
import { TASK_COLUMNS, Task, TaskColumn, TaskPriority } from '../../core/data/models';
import { PeopleService } from '../../core/data/people.service';
import { ProjectsService } from '../../core/data/projects.service';
import { TasksService } from '../../core/data/tasks.service';
import { TaskDetailData, TaskDetailPanel } from './task-detail-panel/task-detail-panel';

@Component({
	selector: 'app-board-page',
	imports: [
		FormsModule,
		TranslocoDirective,
		HubBoardComponent,
		HubCardTemplateDirective,
		HubAvatarComponent,
		HubBadgeComponent,
		HubSelectComponent
	],
	templateUrl: './board-page.html',
	styleUrl: './board-page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardPage {
	private readonly tasks = inject(TasksService);
	private readonly people = inject(PeopleService);
	private readonly projects = inject(ProjectsService);
	private readonly transloco = inject(TranslocoService);
	private readonly modal = inject(HubModal);
	private readonly toast = inject(HubToastService);

	protected readonly assignee = signal<string | null>(null);

	protected readonly peopleResource = resource({ loader: () => this.people.list() });
	protected readonly projectsResource = resource({ loader: () => this.projects.list({ perPage: 100 }) });
	protected readonly tasksResource = resource({
		params: () => ({ assigneeId: this.assignee() ?? undefined }),
		loader: ({ params }) => this.tasks.list(params)
	});

	private readonly columnLabels = toSignal(this.transloco.selectTranslateObject<Record<string, string>>('taskColumn'), {
		initialValue: {} as Record<string, string>
	});

	/** The board is a projection of the task list; the service stays the source of truth. */
	protected readonly board = computed<Board<Task>>(() => {
		const labels = this.columnLabels();
		const tasks = this.tasksResource.value() ?? [];
		return {
			title: 'Hub PM',
			columns: TASK_COLUMNS.map((column, index) => ({
				id: index,
				title: labels[column] ?? column,
				cards: tasks
					.filter((task) => task.column === column)
					.sort((left, right) => left.order - right.order)
					.map((task) => ({ id: Number(task.id.replace('task-', '')), title: task.title, data: task }))
			}))
		};
	});

	protected readonly peopleOptions = computed(() => this.peopleResource.value() ?? []);

	protected async onCardMoved(event: CardDragDropEvent<Task>): Promise<void> {
		const task = event.item.data?.data;
		const column = TASK_COLUMNS[event.container.data?.id ?? 0];
		if (!task || !column) {
			return;
		}

		try {
			await this.tasks.move(task.id, column, event.currentIndex);
			this.tasksResource.reload();
		} catch {
			// The board has already drawn the card in its new column, so the list
			// has to be read again for the screen to tell the truth.
			this.tasksResource.reload();
			this.toast.error(this.transloco.translate('states.error'));
		}
	}

	protected openTask(card: BoardCard<Task>): void {
		const task = card.data;
		if (!task) {
			return;
		}

		const data: TaskDetailData = {
			task,
			project: this.projectsResource.value()?.data.find((project) => project.id === task.projectId) ?? null,
			assignee: this.peopleResource.value()?.find((person) => person.id === task.assigneeId) ?? null
		};

		this.modal
			.open(TaskDetailPanel, {
				offcanvas: true,
				placement: HubModalPlacement.End,
				headerSelector: '.hub-modal__header',
				footerSelector: '.hub-modal__footer',
				data
			})
			.result.catch(() => {
				/* dismissed */
			});
	}

	protected priorityColor(priority: TaskPriority): 'neutral' | 'info' | 'warning' | 'danger' {
		switch (priority) {
			case 'urgent':
				return 'danger';
			case 'high':
				return 'warning';
			case 'normal':
				return 'info';
			default:
				return 'neutral';
		}
	}

	protected personOf(id: string) {
		return this.peopleResource.value()?.find((person) => person.id === id) ?? null;
	}

	protected columnOf(task: Task): TaskColumn {
		return task.column;
	}
}
