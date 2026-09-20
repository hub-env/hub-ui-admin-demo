import {
	ActivityAction,
	ActivityEntry,
	CalendarEvent,
	CalendarEventKind,
	DemoData,
	Milestone,
	MilestoneStatus,
	Person,
	Project,
	ProjectStatus,
	Task,
	TaskColumn,
	TaskPriority
} from './models';

/**
 * Builds the whole dataset from a seed, so every run — and every screenshot —
 * gets exactly the same projects, people and tasks.
 *
 * Dates hang off an anchor rather than off `Date.now()`: the dashboard and the
 * calendar only look alive if the data sits around today, and pinning the
 * anchor is what makes a capture repeatable months later.
 */
export const DEFAULT_SEED = 20260916;

const PEOPLE: ReadonlyArray<Pick<Person, 'name' | 'role'>> = [
	{ name: 'Alba Serrano', role: 'Product lead' },
	{ name: 'Bruno Iglesias', role: 'Frontend engineer' },
	{ name: 'Carmen Vidal', role: 'Backend engineer' },
	{ name: 'Diego Ferrer', role: 'Designer' },
	{ name: 'Elena Prats', role: 'QA engineer' },
	{ name: 'Félix Otero', role: 'Data engineer' },
	{ name: 'Gala Moreno', role: 'Delivery manager' },
	{ name: 'Hugo Ribas', role: 'Frontend engineer' }
];

const CLIENTS = [
	'Meridiana Retail',
	'Costa Logística',
	'Nordwind Labs',
	'Aurora Health',
	'Tramuntana Energy',
	'Basalto Bank',
	'Vega Seguros',
	'Peñalara Foods'
];

const PROJECT_NAMES = [
	'Customer portal',
	'Warehouse dashboard',
	'Billing migration',
	'Appointment booking',
	'Field service app',
	'Loyalty programme',
	'Claims intake',
	'Supplier directory',
	'Energy readings',
	'Onboarding revamp',
	'Payment reconciliation',
	'Support inbox'
];

const TASK_TITLES = [
	'Draft the empty state',
	'Wire the filters to the service',
	'Review the accessibility pass',
	'Split the settings form',
	'Add the retry on failed save',
	'Measure the first load',
	'Write the migration notes',
	'Close the pending feedback',
	'Sync the copy with the client',
	'Prepare the release checklist',
	'Fix the column widths on mobile',
	'Replace the hardcoded labels',
	'Cover the edge case in tests',
	'Agree the date format',
	'Trim the bundle'
];

const ACTIVITY_ACTIONS: readonly ActivityAction[] = ['created', 'moved', 'commented', 'completed'];

const MILESTONE_TITLES = ['Kick-off', 'Design freeze', 'Beta with the client', 'Content complete', 'Go live'];

const EVENT_TITLES: ReadonlyArray<{ title: string; kind: CalendarEventKind }> = [
	{ title: 'Weekly sync', kind: 'meeting' },
	{ title: 'Design review', kind: 'review' },
	{ title: 'Client demo', kind: 'meeting' },
	{ title: 'Release window', kind: 'delivery' },
	{ title: 'Retrospective', kind: 'review' },
	{ title: 'Public holiday', kind: 'holiday' }
];

const STATUSES: readonly ProjectStatus[] = ['discovery', 'active', 'active', 'on-hold', 'active', 'delivered'];
const COLUMNS: readonly TaskColumn[] = ['backlog', 'in-progress', 'review', 'done'];
const PRIORITIES: readonly TaskPriority[] = ['low', 'normal', 'normal', 'high', 'urgent'];

export interface SeedOptions {
	seed?: number;
	/** Day the dataset revolves around. Defaults to today at midnight. */
	anchor?: Date;
}

export function createDemoData(options: SeedOptions = {}): DemoData {
	const random = createRandom(options.seed ?? DEFAULT_SEED);
	const anchor = startOfDay(options.anchor ?? new Date());

	const people = PEOPLE.map((person, index) => ({
		id: `person-${index + 1}`,
		name: person.name,
		role: person.role,
		initials: initialsOf(person.name),
		workload: 35 + Math.round(random() * 60)
	}));

	const projects: Project[] = PROJECT_NAMES.map((name, index) => {
		const status = STATUSES[Math.floor(random() * STATUSES.length)];
		const start = addDays(anchor, -20 - Math.floor(random() * 120));
		const due = addDays(start, 45 + Math.floor(random() * 120));
		return {
			id: `project-${index + 1}`,
			code: `PRJ-${String(index + 1).padStart(3, '0')}`,
			name,
			client: CLIENTS[Math.floor(random() * CLIENTS.length)],
			status,
			ownerId: people[Math.floor(random() * people.length)].id,
			startDate: toIsoDate(start),
			dueDate: toIsoDate(due),
			budget: (8 + Math.floor(random() * 60)) * 1000,
			progress: status === 'delivered' ? 100 : Math.round(random() * 90),
			archived: false
		};
	});

	const tasks: Task[] = [];
	const perColumn = new Map<string, number>();
	for (const project of projects) {
		const count = 8 + Math.floor(random() * 5);
		for (let index = 0; index < count; index++) {
			const column = project.status === 'delivered' ? 'done' : COLUMNS[Math.floor(random() * COLUMNS.length)];
			const key = `${project.id}:${column}`;
			const order = perColumn.get(key) ?? 0;
			perColumn.set(key, order + 1);
			tasks.push({
				id: `task-${tasks.length + 1}`,
				projectId: project.id,
				title: TASK_TITLES[Math.floor(random() * TASK_TITLES.length)],
				column,
				priority: PRIORITIES[Math.floor(random() * PRIORITIES.length)],
				assigneeId: people[Math.floor(random() * people.length)].id,
				dueDate: toIsoDate(addDays(anchor, -12 + Math.floor(random() * 45))),
				estimateHours: 1 + Math.floor(random() * 12),
				order
			});
		}
	}

	const milestones: Milestone[] = [];
	for (const project of projects) {
		const count = 2 + Math.floor(random() * 3);
		for (let index = 0; index < count; index++) {
			const date = addDays(anchor, -25 + Math.floor(random() * 90));
			milestones.push({
				id: `milestone-${milestones.length + 1}`,
				projectId: project.id,
				title: MILESTONE_TITLES[index % MILESTONE_TITLES.length],
				date: toIsoDate(date),
				status: milestoneStatus(date, anchor, random)
			});
		}
	}

	const events: CalendarEvent[] = [];
	for (let day = -18; day <= 30; day++) {
		const howMany = random() < 0.55 ? 1 + Math.floor(random() * 2) : 0;
		for (let index = 0; index < howMany; index++) {
			const template = EVENT_TITLES[Math.floor(random() * EVENT_TITLES.length)];
			const start = addHours(addDays(anchor, day), 9 + Math.floor(random() * 8));
			events.push({
				id: `event-${events.length + 1}`,
				projectId: template.kind === 'holiday' ? null : projects[Math.floor(random() * projects.length)].id,
				title: template.title,
				kind: template.kind,
				start: start.toISOString(),
				end: addHours(start, 1 + Math.floor(random() * 2)).toISOString()
			});
		}
	}

	// The feed needs its own record: a task carries no history of who touched it.
	const activity: ActivityEntry[] = [];
	for (let index = 0; index < 14; index++) {
		const task = tasks[Math.floor(random() * tasks.length)];
		activity.push({
			id: `activity-${index + 1}`,
			personId: people[Math.floor(random() * people.length)].id,
			action: ACTIVITY_ACTIONS[Math.floor(random() * ACTIVITY_ACTIONS.length)],
			projectId: task.projectId,
			subject: task.title,
			at: addHours(anchor, -Math.floor(random() * 120)).toISOString()
		});
	}
	activity.sort((left, right) => right.at.localeCompare(left.at));

	return { people, projects, tasks, milestones, events, activity };
}

/** Mulberry32: small, fast and stable across engines, which is all this needs. */
function createRandom(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function milestoneStatus(date: Date, anchor: Date, random: () => number): MilestoneStatus {
	if (date < anchor) {
		return 'met';
	}
	return random() < 0.25 ? 'at-risk' : 'pending';
}

function initialsOf(name: string): string {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function startOfDay(date: Date): Date {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function addDays(date: Date, days: number): Date {
	const copy = new Date(date);
	copy.setDate(copy.getDate() + days);
	return copy;
}

function addHours(date: Date, hours: number): Date {
	const copy = new Date(date);
	copy.setHours(copy.getHours() + hours);
	return copy;
}

function toIsoDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}
