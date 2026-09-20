import { TestBed } from '@angular/core/testing';
import { DEMO_DATABASE_OPTIONS, DemoDatabase } from './demo-database';
import { DashboardService } from './dashboard.service';
import { ProjectsService } from './projects.service';

describe('DashboardService', () => {
	beforeEach(() => {
		localStorage.clear();
		TestBed.configureTestingModule({
			providers: [{ provide: DEMO_DATABASE_OPTIONS, useValue: { minDelay: 0, maxDelay: 0 } }]
		});
	});

	it('answers the whole screen in one round trip', async () => {
		const view = await TestBed.inject(DashboardService).load();

		expect(view.summary.onTimeRate).toBeGreaterThanOrEqual(0);
		expect(view.summary.onTimeRate).toBeLessThanOrEqual(1);
		expect(view.summary.weekCapacity).toBe(8 * 35);
		expect(view.milestones.length).toBeLessThanOrEqual(5);
		expect(view.overdue.length).toBeLessThanOrEqual(5);
		expect(view.activity.length).toBeLessThanOrEqual(6);
	});

	it('counts only the active projects that are still on the list', async () => {
		const projects = TestBed.inject(ProjectsService);
		const active = (await projects.list()).data.filter((project) => project.status === 'active');

		await projects.archive([active[0].id]);
		const view = await TestBed.inject(DashboardService).load();

		expect(view.summary.activeProjects).toBe(active.length - 1);
	});

	it('resolves every row to its project and its person', async () => {
		const view = await TestBed.inject(DashboardService).load();

		expect(view.overdue.every((row) => row.project && row.assignee)).toBe(true);
		expect(view.activity.every((item) => item.person && item.project)).toBe(true);
	});

	it('reports overdue tasks as late by a positive number of days', async () => {
		const view = await TestBed.inject(DashboardService).load();

		expect(view.overdue.every((row) => row.daysLate > 0)).toBe(true);
	});

	it('gives up when the network is down', async () => {
		TestBed.inject(DemoDatabase).failing.set(true);

		await expect(TestBed.inject(DashboardService).load()).rejects.toBeTruthy();
	});
});
