import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { HubNavComponent, HubNavItem } from 'ng-hub-ui-nav';
import { navIcon } from '../../core/icons/app-icon-pack';

const SECTIONS = [
	{ id: 'dashboard', icon: 'dashboard' },
	{ id: 'projects', icon: 'projects' },
	{ id: 'board', icon: 'board' },
	{ id: 'calendar', icon: 'calendar' }
] as const;

/**
 * The app's only navigation. It collapses to an offcanvas panel on small
 * screens and to an icon rail on demand, both of which hub-nav owns; the app
 * only keeps the rail preference.
 *
 * Labels come from `selectTranslateObject`, not from `translate()`: the
 * dictionary arrives over HTTP, so a plain read on first render returns the
 * key itself and nothing tells it to try again.
 */
@Component({
	selector: 'app-side-nav',
	imports: [HubNavComponent],
	template: `
		<hub-nav
			[items]="items()"
			[(rail)]="rail"
			[autoOpenFromRoute]="true"
			[config]="{
				orientation: 'vertical',
				verticalExpandMode: 'accordion',
				collapseMode: 'offcanvas',
				offcanvasPosition: 'start'
			}"
		/>
	`,
	styleUrl: './side-nav.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNav {
	private readonly transloco = inject(TranslocoService);
	private readonly labels = toSignal(this.transloco.selectTranslateObject<Record<string, string>>('nav'), {
		initialValue: {} as Record<string, string>
	});

	readonly rail = signal(false);

	readonly items = computed<HubNavItem[]>(() => {
		const labels = this.labels();
		return SECTIONS.map((section) => ({
			id: section.id,
			label: labels[section.id] ?? '',
			type: 'link',
			icon: navIcon(section.icon),
			route: `/${section.id}`
		}));
	});
}
