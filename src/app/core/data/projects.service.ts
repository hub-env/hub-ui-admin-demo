import { Injectable, inject } from '@angular/core';
import { DemoDatabase } from './demo-database';
import { Project } from './models';
import { ListQuery, Page, queryList } from './query';

export type ProjectDraft = Omit<Project, 'id' | 'code' | 'archived'>;

/**
 * Projects, shaped like the API the table expects: the page, the search, the
 * filters and the order are resolved here, not in the component, which is what
 * server-side pagination means for ng-hub-ui-paginable.
 */
@Injectable({ providedIn: 'root' })
export class ProjectsService {
	private readonly db = inject(DemoDatabase);

	list(query: ListQuery = {}): Promise<Page<Project>> {
		return this.db.read(({ projects }) =>
			queryList(
				projects.filter((project) => !project.archived),
				query,
				{ searchIn: ['name', 'client', 'code'] }
			)
		);
	}

	get(id: string): Promise<Project | undefined> {
		return this.db.read(({ projects }) => projects.find((project) => project.id === id));
	}

	create(draft: ProjectDraft): Promise<Project> {
		return this.db.write((data) => {
			const next = data.projects.length + 1;
			const project: Project = {
				...draft,
				id: `project-${next}`,
				code: `PRJ-${String(next).padStart(3, '0')}`,
				archived: false
			};
			return { data: { ...data, projects: [project, ...data.projects] }, result: project };
		});
	}

	update(id: string, changes: Partial<ProjectDraft>): Promise<Project> {
		return this.db.write((data) => {
			const projects = data.projects.map((project) => (project.id === id ? { ...project, ...changes } : project));
			const updated = projects.find((project) => project.id === id);
			if (!updated) {
				throw new Error(`Unknown project: ${id}`);
			}
			return { data: { ...data, projects }, result: updated };
		});
	}

	archive(ids: ReadonlyArray<string>): Promise<number> {
		return this.db.write((data) => {
			const projects = data.projects.map((project) =>
				ids.includes(project.id) ? { ...project, archived: true } : project
			);
			return { data: { ...data, projects }, result: ids.length };
		});
	}
}
