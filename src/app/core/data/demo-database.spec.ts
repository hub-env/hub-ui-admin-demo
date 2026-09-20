import { TestBed } from '@angular/core/testing';
import { DEMO_DATABASE_OPTIONS, DemoDatabase, DemoNetworkError, STORAGE_KEY } from './demo-database';
import { ProjectsService } from './projects.service';
import { TasksService } from './tasks.service';

/** Tests run without the fake latency; the delay is behaviour of the demo, not of the data. */
function configure() {
	TestBed.configureTestingModule({
		providers: [{ provide: DEMO_DATABASE_OPTIONS, useValue: { minDelay: 0, maxDelay: 0 } }]
	});
}

describe('DemoDatabase', () => {
	beforeEach(() => {
		localStorage.clear();
		configure();
	});

	it('seeds the browser storage on first use', async () => {
		TestBed.inject(DemoDatabase);

		expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
	});

	it('persists an edit so a reload keeps it', async () => {
		const projects = TestBed.inject(ProjectsService);
		const [first] = (await projects.list({ perPage: 1 })).data;

		await projects.update(first.id, { name: 'Renamed in the demo' });

		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
		expect(stored.projects.find((project: { id: string }) => project.id === first.id).name).toBe('Renamed in the demo');
	});

	it('brings the seed back on reset', async () => {
		const db = TestBed.inject(DemoDatabase);
		const projects = TestBed.inject(ProjectsService);
		const [first] = (await projects.list({ perPage: 1 })).data;
		await projects.update(first.id, { name: 'Renamed in the demo' });

		db.reset();

		const after = await projects.get(first.id);
		expect(after?.name).not.toBe('Renamed in the demo');
	});

	it('fails every call while the failure switch is on', async () => {
		const db = TestBed.inject(DemoDatabase);
		const projects = TestBed.inject(ProjectsService);

		db.failing.set(true);
		await expect(projects.list()).rejects.toBeInstanceOf(DemoNetworkError);

		db.failing.set(false);
		await expect(projects.list()).resolves.toBeTruthy();
	});

	it('leaves the data untouched when a write fails', async () => {
		const db = TestBed.inject(DemoDatabase);
		const projects = TestBed.inject(ProjectsService);
		const [first] = (await projects.list({ perPage: 1 })).data;

		db.failing.set(true);
		await expect(projects.update(first.id, { name: 'Never saved' })).rejects.toBeInstanceOf(DemoNetworkError);

		db.failing.set(false);
		expect((await projects.get(first.id))?.name).toBe(first.name);
	});
});

describe('ProjectsService', () => {
	beforeEach(() => {
		localStorage.clear();
		configure();
	});

	it('paginates, and the total covers every project', async () => {
		const projects = TestBed.inject(ProjectsService);

		const page = await projects.list({ page: 1, perPage: 5 });

		expect(page.data).toHaveLength(5);
		expect(page.totalItems).toBe(12);
	});

	it('adds a project with its own code and puts it on top', async () => {
		const projects = TestBed.inject(ProjectsService);
		const [owner] = (await projects.list({ perPage: 1 })).data;

		const created = await projects.create({
			name: 'Brand new',
			client: 'Nordwind Labs',
			status: 'discovery',
			ownerId: owner.ownerId,
			startDate: '2026-09-01',
			dueDate: '2026-12-01',
			budget: 21000,
			progress: 0
		});

		expect(created.code).toMatch(/^PRJ-\d{3}$/);
		expect((await projects.list({ perPage: 1 })).data[0].id).toBe(created.id);
		expect((await projects.list()).totalItems).toBe(13);
	});

	it('drops archived projects from the list', async () => {
		const projects = TestBed.inject(ProjectsService);
		const [first] = (await projects.list({ perPage: 1 })).data;

		await projects.archive([first.id]);

		expect((await projects.list()).totalItems).toBe(11);
	});
});

describe('TasksService', () => {
	beforeEach(() => {
		localStorage.clear();
		configure();
	});

	it('moves a card to another column and renumbers it', async () => {
		const tasks = TestBed.inject(TasksService);
		const all = await tasks.list({ projectId: 'project-1' });
		const moving = all.find((task) => task.column !== 'review');

		await tasks.move(moving!.id, 'review', 0);

		const review = (await tasks.list({ projectId: 'project-1' })).filter((task) => task.column === 'review');
		expect(review[0].id).toBe(moving!.id);
		expect(review.map((task) => task.order)).toEqual(review.map((_, index) => index));
	});

	it('closes the gap in the column the card left', async () => {
		const tasks = TestBed.inject(TasksService);
		const all = await tasks.list({ projectId: 'project-1' });
		// The seed does not promise which columns a given project fills, so the
		// test picks the busiest one instead of assuming there is a backlog.
		const busiest = [...new Set(all.map((task) => task.column))].sort(
			(left, right) =>
				all.filter((task) => task.column === right).length - all.filter((task) => task.column === left).length
		)[0];
		const moving = all.find((task) => task.column === busiest)!;
		const destination = moving.column === 'done' ? 'review' : 'done';

		await tasks.move(moving.id, destination, 0);

		const after = (await tasks.list({ projectId: 'project-1' })).filter((task) => task.column === busiest);
		expect(after.map((task) => task.order)).toEqual(after.map((_, index) => index));
		expect(after.some((task) => task.id === moving.id)).toBe(false);
	});
});
