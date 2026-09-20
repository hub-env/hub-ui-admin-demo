import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { TasksService } from '../../core/data/tasks.service';
import { en, es } from '../../testing/translations';
import { provideTestingHubUi } from '../../testing/test-providers';
import { BoardPage } from './board-page';

type Exposed = {
	board: () => { columns: { id?: number; title: string; cards: { title: string; data?: unknown }[] }[] };
	assignee: { set: (value: string | null) => void };
	onCardMoved: (event: unknown) => Promise<void>;
	tasksResource: { isLoading: () => boolean };
};

describe('BoardPage', () => {
	beforeEach(async () => {
		localStorage.clear();
		await TestBed.configureTestingModule({
			imports: [
				BoardPage,
				TranslocoTestingModule.forRoot({
					langs: { en, es },
					translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en', reRenderOnLangChange: true },
					preloadLangs: true
				})
			],
			providers: [...provideTestingHubUi()]
		}).compileComponents();
	});

	async function render() {
		const fixture = TestBed.createComponent(BoardPage);
		await fixture.whenStable();
		return { fixture, component: fixture.componentInstance as unknown as Exposed };
	}

	it('lays the tasks out in the four columns, in their own order', async () => {
		const { component } = await render();

		const columns = component.board().columns;
		expect(columns.map((column) => column.title)).toEqual(['Backlog', 'In progress', 'Review', 'Done']);

		const total = columns.reduce((count, column) => count + column.cards.length, 0);
		expect(total).toBe((await TestBed.inject(TasksService).list()).length);
	});

	it('shows only the cards of the person the filter names', async () => {
		const { fixture, component } = await render();

		component.assignee.set('person-2');
		await fixture.whenStable();

		const cards = component.board().columns.flatMap((column) => column.cards);
		const mine = (await TestBed.inject(TasksService).list({ assigneeId: 'person-2' })).length;
		expect(cards.length).toBe(mine);
	});

	it('moves a card to the column it was dropped in', async () => {
		const { fixture, component } = await render();
		const tasks = TestBed.inject(TasksService);
		const moving = (await tasks.list()).find((task) => task.column !== 'review')!;

		await component.onCardMoved({
			item: { data: { data: moving } },
			container: { data: { id: 2 } },
			currentIndex: 0
		});
		await fixture.whenStable();

		const after = (await tasks.list()).find((task) => task.id === moving.id);
		expect(after?.column).toBe('review');
		expect(after?.order).toBe(0);
	});
});
