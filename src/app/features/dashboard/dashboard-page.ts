import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { HubAvatarComponent } from 'ng-hub-ui-avatar';
import { HubBadgeComponent } from 'ng-hub-ui-badges';
import { HubButtonComponent } from 'ng-hub-ui-buttons';
import { HubMilestoneComponent, HubMilestonesComponent } from 'ng-hub-ui-milestones';
import { HubProgressComponent, HubRingComponent } from 'ng-hub-ui-metrics';
import { HubSkeletonComponent } from 'ng-hub-ui-skeleton';
import { LanguageStore } from '../../core/i18n/language-store';
import { DashboardService } from '../../core/data/dashboard.service';
import { StatCard } from './stat-card/stat-card';

@Component({
	selector: 'app-dashboard-page',
	imports: [
		DatePipe,
		DecimalPipe,
		PercentPipe,
		RouterLink,
		TranslocoDirective,
		HubAvatarComponent,
		HubBadgeComponent,
		HubButtonComponent,
		HubMilestonesComponent,
		HubMilestoneComponent,
		HubProgressComponent,
		HubRingComponent,
		HubSkeletonComponent,
		StatCard
	],
	templateUrl: './dashboard-page.html',
	styleUrl: './dashboard-page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {
	private readonly dashboard = inject(DashboardService);
	private readonly languages = inject(LanguageStore);

	protected readonly locale = this.languages.locale;

	protected readonly view = resource({ loader: () => this.dashboard.load() });

	protected readonly capacityUsed = computed(() => {
		const summary = this.view.value()?.summary;
		return summary ? Math.round((summary.weekHours / summary.weekCapacity) * 100) : 0;
	});

	/** A milestone already at risk reads as active; the rest are still pending. */
	protected milestoneState(status: string): 'complete' | 'active' | 'pending' {
		if (status === 'met') {
			return 'complete';
		}
		return status === 'at-risk' ? 'active' : 'pending';
	}

	protected reload(): void {
		this.view.reload();
	}
}
