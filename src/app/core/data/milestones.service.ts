import { Injectable, inject } from '@angular/core';
import { DemoDatabase } from './demo-database';
import { Milestone } from './models';

@Injectable({ providedIn: 'root' })
export class MilestonesService {
	private readonly db = inject(DemoDatabase);

	/** The next milestones from today on, for the dashboard timeline. */
	upcoming(limit = 5): Promise<Milestone[]> {
		const today = new Date().toISOString().slice(0, 10);
		return this.db.read(({ milestones }) =>
			milestones
				.filter((milestone) => milestone.date >= today)
				.sort((left, right) => left.date.localeCompare(right.date))
				.slice(0, limit)
		);
	}

	listByProject(projectId: string): Promise<Milestone[]> {
		return this.db.read(({ milestones }) =>
			milestones
				.filter((milestone) => milestone.projectId === projectId)
				.sort((left, right) => left.date.localeCompare(right.date))
		);
	}
}
