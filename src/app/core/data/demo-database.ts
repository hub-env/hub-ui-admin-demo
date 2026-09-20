import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { DemoData } from './models';
import { createDemoData } from './seed';

export const STORAGE_KEY = 'hub-pm.data';

export interface DemoDatabaseOptions {
	/** Bounds of the fake round trip, in milliseconds. Tests pass zeros. */
	minDelay: number;
	maxDelay: number;
}

export const DEMO_DATABASE_OPTIONS = new InjectionToken<DemoDatabaseOptions>('DEMO_DATABASE_OPTIONS', {
	providedIn: 'root',
	factory: () => ({ minDelay: 300, maxDelay: 600 })
});

export class DemoNetworkError extends Error {
	constructor() {
		super('Simulated network failure');
		this.name = 'DemoNetworkError';
	}
}

/**
 * The demo's stand-in for a backend: one in-memory dataset, persisted to the
 * browser so edits survive a reload, plus the two switches the Settings screen
 * flips — reset to the seed, and fail every call.
 *
 * Services never touch the collections directly; they go through `read` and
 * `write`, which is what makes the latency and the failures apply everywhere
 * without each service remembering to simulate them.
 */
@Injectable({ providedIn: 'root' })
export class DemoDatabase {
	private readonly options = inject(DEMO_DATABASE_OPTIONS);
	private readonly state = signal<DemoData>(loadInitialData());

	readonly data = this.state.asReadonly();
	readonly failing = signal(false);
	readonly people = computed(() => this.state().people);

	/** Runs a read through the fake network. */
	read<T>(project: (data: DemoData) => T): Promise<T> {
		return this.roundTrip(() => project(this.state()));
	}

	/** Runs a mutation through the fake network and persists the result. */
	write<T>(mutate: (data: DemoData) => { data: DemoData; result: T }): Promise<T> {
		return this.roundTrip(() => {
			const { data, result } = mutate(this.state());
			this.state.set(data);
			persist(data);
			return result;
		});
	}

	/** Drops every edit and rebuilds the dataset from the seed. */
	reset(): void {
		const fresh = createDemoData();
		this.state.set(fresh);
		persist(fresh);
	}

	private async roundTrip<T>(work: () => T): Promise<T> {
		await delay(this.options.minDelay, this.options.maxDelay);
		if (this.failing()) {
			throw new DemoNetworkError();
		}
		return work();
	}
}

function delay(min: number, max: number): Promise<void> {
	const ms = min >= max ? min : min + Math.random() * (max - min);
	return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

function loadInitialData(): DemoData {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored) as DemoData;
		}
	} catch {
		/* unreadable or blocked storage: fall through to a fresh dataset */
	}
	const fresh = createDemoData();
	persist(fresh);
	return fresh;
}

function persist(data: DemoData): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		/* the session keeps working, it just will not survive a reload */
	}
}
