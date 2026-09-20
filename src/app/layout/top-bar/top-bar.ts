import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { HubBreadcrumbComponent, HubBreadcrumbItemDirective } from 'ng-hub-ui-breadcrumbs';
import { HubButtonComponent } from 'ng-hub-ui-buttons';
import { HubIconComponent } from 'ng-hub-ui-icons';
import { Language, LanguageStore } from '../../core/i18n/language-store';
import { ThemeStore } from '../../core/theme/theme-store';

@Component({
	selector: 'app-top-bar',
	imports: [
		RouterLink,
		TranslocoDirective,
		UpperCasePipe,
		HubBreadcrumbComponent,
		HubBreadcrumbItemDirective,
		HubButtonComponent,
		HubIconComponent
	],
	templateUrl: './top-bar.html',
	styleUrl: './top-bar.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBar {
	private readonly transloco = inject(TranslocoService);

	protected readonly theme = inject(ThemeStore);
	protected readonly languages = inject(LanguageStore);

	/** Route data carries the key; the trail is translated here. */
	protected label(key: string): string {
		return this.transloco.translate(key);
	}

	protected selectLanguage(language: Language): void {
		this.languages.set(language);
	}
}
