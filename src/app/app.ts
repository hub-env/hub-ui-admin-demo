import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
	Event,
	NavigationCancel,
	NavigationEnd,
	NavigationError,
	NavigationStart,
	Router,
	RouterOutlet
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HubLoadingComponent } from 'ng-hub-ui-loading';
import { SideNav } from './layout/side-nav/side-nav';
import { TopBar } from './layout/top-bar/top-bar';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, SideNav, TopBar, HubLoadingComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
	private readonly router = inject(Router);

	/** Covers the content area while a lazy route is on its way in. */
	protected readonly navigating = signal(false);

	constructor() {
		this.router.events.pipe(takeUntilDestroyed()).subscribe((event: Event) => {
			if (event instanceof NavigationStart) {
				this.navigating.set(true);
			} else if (
				event instanceof NavigationEnd ||
				event instanceof NavigationCancel ||
				event instanceof NavigationError
			) {
				this.navigating.set(false);
			}
		});
	}
}
