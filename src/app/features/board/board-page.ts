import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'app-board-page',
	imports: [TranslocoDirective],
	template: `
		<ng-container *transloco="let t">
			<h1>{{ t('nav.board') }}</h1>
			<p>{{ t('common.comingSoon') }}</p>
		</ng-container>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardPage {}
