import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * One tile of the dashboard's top row: a label, a headline figure and
 * whatever indicator the caller projects underneath.
 */
@Component({
	selector: 'app-stat-card',
	template: `
		<p class="stat-card__label">{{ label() }}</p>
		<p class="stat-card__value">{{ value() }}</p>
		<div class="stat-card__indicator"><ng-content /></div>
		@if (note()) {
			<p class="stat-card__note">{{ note() }}</p>
		}
	`,
	styleUrl: './stat-card.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCard {
	readonly label = input.required<string>();
	// Angular's number pipes type their output as `string | null`.
	readonly value = input.required<string | null>();
	readonly note = input<string>('');
}
