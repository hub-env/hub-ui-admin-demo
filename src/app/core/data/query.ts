export type SortDirection = 'asc' | 'desc';

export interface Sort {
	property: string;
	direction: SortDirection;
}

export interface ListQuery {
	page?: number;
	perPage?: number;
	search?: string;
	sort?: Sort | null;
	/** Column to accepted values. An empty array means the filter is off. */
	filters?: Record<string, ReadonlyArray<string>>;
}

/**
 * The shape ng-hub-ui-paginable reads in server mode. It is declared here
 * rather than imported so the data layer stays independent of the UI: the
 * table sees a plain object, and so does a test.
 */
export interface Page<T> {
	page: number;
	perPage: number;
	totalItems: number;
	data: T[];
}

export interface QueryConfig<T> {
	/** Properties the free-text search looks into. */
	searchIn: ReadonlyArray<keyof T>;
}

/**
 * Search, filter, sort and slice, in that order — the order a backend would
 * use, so the totals the table shows are the totals of the filtered set.
 */
export function queryList<T>(items: ReadonlyArray<T>, query: ListQuery, config: QueryConfig<T>): Page<T> {
	const page = Math.max(1, query.page ?? 1);
	const perPage = Math.max(1, query.perPage ?? 10);

	let result = [...items];

	const search = query.search?.trim().toLowerCase();
	if (search) {
		result = result.filter((item) =>
			config.searchIn.some((property) =>
				String(item[property] ?? '')
					.toLowerCase()
					.includes(search)
			)
		);
	}

	for (const [property, accepted] of Object.entries(query.filters ?? {})) {
		if (!accepted?.length) {
			continue;
		}
		result = result.filter((item) => accepted.includes(String(valueOf(item, property))));
	}

	if (query.sort) {
		const { property, direction } = query.sort;
		const sign = direction === 'desc' ? -1 : 1;
		result.sort((left, right) => sign * compare(valueOf(left, property), valueOf(right, property)));
	}

	const totalItems = result.length;
	const from = (page - 1) * perPage;

	return { page, perPage, totalItems, data: result.slice(from, from + perPage) };
}

function valueOf<T>(item: T, property: string): unknown {
	return (item as Record<string, unknown>)[property];
}

function compare(left: unknown, right: unknown): number {
	if (typeof left === 'number' && typeof right === 'number') {
		return left - right;
	}
	return String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true, sensitivity: 'base' });
}
