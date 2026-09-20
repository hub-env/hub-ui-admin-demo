import { Injectable, inject } from '@angular/core';
import { DemoDatabase } from './demo-database';
import { Task, TaskColumn } from './models';

export interface BoardFilter {
	projectId?: string;
	assigneeId?: string;
}

/** Tasks for the board and for the dashboard's overdue list. */
@Injectable({ providedIn: 'root' })
export class TasksService {
	private readonly db = inject(DemoDatabase);

	list(filter: BoardFilter = {}): Promise<Task[]> {
		return this.db.read(({ tasks }) =>
			tasks
				.filter((task) => (filter.projectId ? task.projectId === filter.projectId : true))
				.filter((task) => (filter.assigneeId ? task.assigneeId === filter.assigneeId : true))
				.sort((left, right) => left.order - right.order)
		);
	}

	overdue(limit = 5): Promise<Task[]> {
		const today = new Date().toISOString().slice(0, 10);
		return this.db.read(({ tasks }) =>
			tasks
				.filter((task) => task.column !== 'done' && task.dueDate < today)
				.sort((left, right) => left.dueDate.localeCompare(right.dueDate))
				.slice(0, limit)
		);
	}

	update(id: string, changes: Partial<Omit<Task, 'id'>>): Promise<Task> {
		return this.db.write((data) => {
			const tasks = data.tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));
			const updated = tasks.find((task) => task.id === id);
			if (!updated) {
				throw new Error(`Unknown task: ${id}`);
			}
			return { data: { ...data, tasks }, result: updated };
		});
	}

	/**
	 * Moves a card to a column and a position, renumbering both the column it
	 * leaves and the one it lands in so the orders stay dense.
	 */
	move(id: string, column: TaskColumn, index: number): Promise<Task[]> {
		return this.db.write((data) => {
			const moved = data.tasks.find((task) => task.id === id);
			if (!moved) {
				throw new Error(`Unknown task: ${id}`);
			}

			const others = data.tasks.filter((task) => task.id !== id);
			const target = others
				.filter((task) => task.projectId === moved.projectId && task.column === column)
				.sort((left, right) => left.order - right.order);

			target.splice(Math.max(0, Math.min(index, target.length)), 0, { ...moved, column });

			const reordered = new Map(target.map((task, position) => [task.id, { ...task, column, order: position }]));
			const source = others
				.filter((task) => task.projectId === moved.projectId && task.column === moved.column)
				.sort((left, right) => left.order - right.order);
			source.forEach((task, position) => {
				if (!reordered.has(task.id)) {
					reordered.set(task.id, { ...task, order: position });
				}
			});

			const tasks = data.tasks.map((task) => reordered.get(task.id) ?? task);
			return { data: { ...data, tasks }, result: [...reordered.values()] };
		});
	}
}
