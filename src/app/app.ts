import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { HubButtonComponent } from 'ng-hub-ui-buttons';
import { Language, LanguageStore } from './core/i18n/language-store';
import { ThemeStore } from './core/theme/theme-store';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, TranslocoDirective, HubButtonComponent, UpperCasePipe],
	templateUrl: './app.html',
	styleUrl: './app.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
	protected readonly theme = inject(ThemeStore);
	protected readonly languages = inject(LanguageStore);

	protected selectLanguage(language: Language): void {
		this.languages.set(language);
	}
}
