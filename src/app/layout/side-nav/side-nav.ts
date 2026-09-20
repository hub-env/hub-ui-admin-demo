import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
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
	private readonly language = toSignal(this.transloco.langChanges$, {
		initialValue: this.transloco.getActiveLang()
	});

	readonly rail = signal(false);

	/** Rebuilt on every language change, which is what re-labels the rail. */
	readonly items = computed<HubNavItem[]>(() => {
		this.language();
		return SECTIONS.map((section) => ({
			id: section.id,
			label: this.transloco.translate(`nav.${section.id}`),
			type: 'link',
			icon: navIcon(section.icon),
			route: `/${section.id}`
		}));
	});
}
