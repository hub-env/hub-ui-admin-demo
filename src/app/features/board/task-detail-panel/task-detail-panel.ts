import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { HUB_MODAL_DATA, HubActiveModal } from 'ng-hub-ui-modal';
import { HubAvatarComponent } from 'ng-hub-ui-avatar';
import { HubBadgeComponent } from 'ng-hub-ui-badges';
import { HubButtonComponent } from 'ng-hub-ui-buttons';
import { Person, Project, Task } from '../../../core/data/models';
import { LanguageStore } from '../../../core/i18n/language-store';

/** Read-only detail of a card, opened as a drawer from the board. */
@Component({
	selector: 'app-task-detail-panel',
	imports: [DatePipe, TranslocoDirective, HubAvatarComponent, HubBadgeComponent, HubButtonComponent],
	templateUrl: './task-detail-panel.html',
	styleUrl: './task-detail-panel.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailPanel {
	protected readonly activeModal = inject(HubActiveModal);
	protected readonly locale = inject(LanguageStore).locale;

	/** Handed over by the board when it opens the drawer. */
	protected readonly data = inject<TaskDetailData>(HUB_MODAL_DATA);
	protected readonly task = this.data.task;
	protected readonly project = this.data.project;
	protected readonly assignee = this.data.assignee;
}

export interface TaskDetailData {
	task: Task;
	project: Project | null;
	assignee: Person | null;
}
