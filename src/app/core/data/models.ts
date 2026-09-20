/**
 * The demo's domain. Dates travel as ISO strings because the whole dataset is
 * round-tripped through localStorage, and a Date would come back as a string
 * anyway — better to have one shape everywhere than two.
 */

export type ProjectStatus = 'discovery' | 'active' | 'on-hold' | 'delivered';

export interface Project {
	id: string;
	code: string;
	name: string;
	client: string;
	status: ProjectStatus;
	ownerId: string;
	/** ISO date, YYYY-MM-DD. */
	startDate: string;
	/** ISO date, YYYY-MM-DD. */
	dueDate: string;
	budget: number;
	/** 0 to 100. */
	progress: number;
	archived: boolean;
}

export type TaskColumn = 'backlog' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
	id: string;
	projectId: string;
	title: string;
	column: TaskColumn;
	priority: TaskPriority;
	assigneeId: string;
	/** ISO date, YYYY-MM-DD. */
	dueDate: string;
	estimateHours: number;
	/** Position inside its column, ascending. */
	order: number;
}

export interface Person {
	id: string;
	name: string;
	role: string;
	initials: string;
	/** 0 to 100, how booked the person is this week. */
	workload: number;
}

export type MilestoneStatus = 'pending' | 'at-risk' | 'met';

export interface Milestone {
	id: string;
	projectId: string;
	title: string;
	/** ISO date, YYYY-MM-DD. */
	date: string;
	status: MilestoneStatus;
}

export type CalendarEventKind = 'meeting' | 'delivery' | 'review' | 'holiday';

export interface CalendarEvent {
	id: string;
	projectId: string | null;
	title: string;
	kind: CalendarEventKind;
	/** ISO date-time. */
	start: string;
	/** ISO date-time. */
	end: string;
}

export type ActivityAction = 'created' | 'moved' | 'commented' | 'completed';

export interface ActivityEntry {
	id: string;
	personId: string;
	action: ActivityAction;
	projectId: string;
	subject: string;
	/** ISO date-time. */
	at: string;
}

export interface DemoData {
	people: Person[];
	projects: Project[];
	tasks: Task[];
	milestones: Milestone[];
	events: CalendarEvent[];
	activity: ActivityEntry[];
}

export const TASK_COLUMNS: readonly TaskColumn[] = ['backlog', 'in-progress', 'review', 'done'];
export const PROJECT_STATUSES: readonly ProjectStatus[] = ['discovery', 'active', 'on-hold', 'delivered'];
export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'normal', 'high', 'urgent'];
