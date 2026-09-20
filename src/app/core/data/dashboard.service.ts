import { Injectable, inject } from '@angular/core';
import { DemoDatabase } from './demo-database';
import { ActivityEntry, Milestone, Person, Project, Task } from './models';

export interface DashboardSummary {
	/** Milestones met on time, over those already due. 0 to 1. */
	onTimeRate: number;
	activeProjects: number;
	overdueTasks: number;
	/** Hours committed in the columns that are moving, against the team's week. */
	weekHours: number;
	weekCapacity: number;
}

export interface OverdueTask {
	task: Task;
	project: Project;
	assignee: Person;
	daysLate: number;
}

export interface ActivityItem {
	entry: ActivityEntry;
	person: Person;
	project: Project;
}

export interface DashboardView {
	summary: DashboardSummary;
	milestones: Milestone[];
	overdue: OverdueTask[];
	activity: ActivityItem[];
}

const WEEKLY_HOURS_PER_PERSON = 35;

/**
 * Everything the dashboard paints, resolved in one round trip.
 *
 * The screen asks a question ("how are we doing?"), not five; splitting it
 * into five calls would only make five spinners out of one.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
	private readonly db = inject(DemoDatabase);

	load(): Promise<DashboardView> {
		const today = new Date().toISOString().slice(0, 10);

		return this.db.read((data) => {
			const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((item) => [item.id, item]));
			const projects = byId(data.projects);
			const people = byId(data.people);

			const due = data.milestones.filter((milestone) => milestone.date <= today);
			const met = due.filter((milestone) => milestone.status === 'met');

			const live = data.tasks.filter((task) => task.column === 'in-progress' || task.column === 'review');
			const overdue = data.tasks
				.filter((task) => task.column !== 'done' && task.dueDate < today)
				.sort((left, right) => left.dueDate.localeCompare(right.dueDate))
				.slice(0, 5)
				.map((task) => ({
					task,
					project: projects.get(task.projectId)!,
					assignee: people.get(task.assigneeId)!,
					daysLate: daysBetween(task.dueDate, today)
				}));

			return {
				summary: {
					onTimeRate: due.length ? met.length / due.length : 1,
					activeProjects: data.projects.filter((project) => project.status === 'active' && !project.archived).length,
					overdueTasks: data.tasks.filter((task) => task.column !== 'done' && task.dueDate < today).length,
					weekHours: live.reduce((total, task) => total + task.estimateHours, 0),
					weekCapacity: data.people.length * WEEKLY_HOURS_PER_PERSON
				},
				milestones: data.milestones
					.filter((milestone) => milestone.date >= today)
					.sort((left, right) => left.date.localeCompare(right.date))
					.slice(0, 5),
				overdue,
				activity: data.activity.slice(0, 6).map((entry) => ({
					entry,
					person: people.get(entry.personId)!,
					project: projects.get(entry.projectId)!
				}))
			};
		});
	}
}

function daysBetween(from: string, to: string): number {
	const start = Date.parse(from);
	const end = Date.parse(to);
	return Math.max(0, Math.round((end - start) / 86_400_000));
}
