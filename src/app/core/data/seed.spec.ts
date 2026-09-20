import { createDemoData } from './seed';

const ANCHOR = new Date(2026, 8, 16);

describe('createDemoData', () => {
	it('gives the same dataset for the same seed and anchor', () => {
		const first = createDemoData({ seed: 42, anchor: ANCHOR });
		const second = createDemoData({ seed: 42, anchor: ANCHOR });

		expect(second).toEqual(first);
	});

	it('gives a different dataset for a different seed', () => {
		const first = createDemoData({ seed: 42, anchor: ANCHOR });
		const second = createDemoData({ seed: 43, anchor: ANCHOR });

		expect(second).not.toEqual(first);
	});

	it('builds twelve projects, eight people and around a hundred tasks', () => {
		const data = createDemoData({ anchor: ANCHOR });

		expect(data.projects).toHaveLength(12);
		expect(data.people).toHaveLength(8);
		expect(data.tasks.length).toBeGreaterThanOrEqual(96);
		expect(data.tasks.length).toBeLessThanOrEqual(144);
		expect(data.milestones.length).toBeGreaterThan(0);
		expect(data.events.length).toBeGreaterThan(0);
	});

	it('keeps every reference pointing at something', () => {
		const data = createDemoData({ anchor: ANCHOR });
		const projectIds = new Set(data.projects.map((project) => project.id));
		const peopleIds = new Set(data.people.map((person) => person.id));

		expect(data.projects.every((project) => peopleIds.has(project.ownerId))).toBe(true);
		expect(data.tasks.every((task) => projectIds.has(task.projectId) && peopleIds.has(task.assigneeId))).toBe(true);
		expect(data.milestones.every((milestone) => projectIds.has(milestone.projectId))).toBe(true);
	});

	it('numbers each column of each project from zero without gaps', () => {
		const data = createDemoData({ anchor: ANCHOR });
		const byColumn = new Map<string, number[]>();

		for (const task of data.tasks) {
			const key = `${task.projectId}:${task.column}`;
			byColumn.set(key, [...(byColumn.get(key) ?? []), task.order]);
		}

		for (const orders of byColumn.values()) {
			expect([...orders].sort((a, b) => a - b)).toEqual(orders.map((_, index) => index));
		}
	});
});
