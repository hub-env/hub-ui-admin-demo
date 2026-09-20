import { Injectable, inject } from '@angular/core';
import { DemoDatabase } from './demo-database';
import { Person } from './models';

@Injectable({ providedIn: 'root' })
export class PeopleService {
	private readonly db = inject(DemoDatabase);

	list(): Promise<Person[]> {
		return this.db.read(({ people }) => [...people]);
	}

	get(id: string): Promise<Person | undefined> {
		return this.db.read(({ people }) => people.find((person) => person.id === id));
	}
}
