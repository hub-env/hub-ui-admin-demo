import { TestBed } from '@angular/core/testing';
import { HubActiveModal } from 'ng-hub-ui-modal';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { DEMO_DATABASE_OPTIONS } from '../../../core/data/demo-database';
import { ProjectsService } from '../../../core/data/projects.service';
import { en, es } from '../../../testing/translations';
import { NewProjectDialog } from './new-project-dialog';
import { provideTestingHubUi } from '../../../testing/test-providers';

describe('NewProjectDialog', () => {
	let closed: unknown;

	beforeEach(async () => {
		localStorage.clear();
		closed = undefined;
		await TestBed.configureTestingModule({
			imports: [
				NewProjectDialog,
				TranslocoTestingModule.forRoot({
					langs: { en, es },
					translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en', reRenderOnLangChange: true },
					preloadLangs: true
				})
			],
			providers: [
				...provideTestingHubUi(),
				{
					provide: HubActiveModal,
					useValue: { close: (value: unknown) => (closed = value), dismiss: () => undefined }
				}
			]
		}).compileComponents();
	});

	/** The dialog's members are protected, which is right for the template and awkward for a test. */
	type Exposed = {
		details: { setValue: (value: unknown) => void; touched: boolean };
		team: { setValue: (value: unknown) => void };
		dates: { setValue: (value: unknown) => void };
		detailsValid: () => boolean;
		teamValid: () => boolean;
		canSubmit: () => boolean;
		submit: () => Promise<void>;
	};

	const expose = (fixture: { componentInstance: NewProjectDialog }): Exposed =>
		fixture.componentInstance as unknown as Exposed;

	function fill(component: Exposed) {
		component.details.setValue({ name: 'Partner portal', client: 'Nordwind Labs', status: 'discovery' });
		component.team.setValue({ ownerId: 'person-1', budget: 24000 });
		component.dates.setValue({ startDate: '2026-10-01', dueDate: '2026-12-15' });
	}

	it('keeps the later steps shut until the one before is valid', async () => {
		const fixture = TestBed.createComponent(NewProjectDialog);
		const component = expose(fixture);
		await fixture.whenStable();

		expect(component.detailsValid()).toBe(false);
		expect(component.teamValid()).toBe(false);

		component.details.setValue({ name: 'Partner portal', client: 'Nordwind Labs', status: 'discovery' });
		await fixture.whenStable();

		expect(component.detailsValid()).toBe(true);
		expect(component.canSubmit()).toBe(false);
	});

	it('creates the project and hands it back to whoever opened the dialog', async () => {
		const fixture = TestBed.createComponent(NewProjectDialog);
		const component = expose(fixture);
		fill(component);
		await fixture.whenStable();

		await component.submit();

		expect((closed as { name: string }).name).toBe('Partner portal');
		expect((await TestBed.inject(ProjectsService).list({ search: 'Partner portal' })).totalItems).toBe(1);
	});

	it('reveals the errors instead of saving half a form', async () => {
		const fixture = TestBed.createComponent(NewProjectDialog);
		const component = expose(fixture);
		await fixture.whenStable();

		await component.submit();

		expect(closed).toBeUndefined();
		expect(component.details.touched).toBe(true);
		expect((await TestBed.inject(ProjectsService).list()).totalItems).toBe(12);
	});
});
