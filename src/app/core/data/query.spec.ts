import { queryList } from './query';

interface Row extends Record<string, unknown> {
	name: string;
	client: string;
	budget: number;
	status: string;
}

const ROWS: Row[] = [
	{ name: 'Billing migration', client: 'Basalto Bank', budget: 30000, status: 'active' },
	{ name: 'Customer portal', client: 'Meridiana Retail', budget: 12000, status: 'active' },
	{ name: 'Energy readings', client: 'Tramuntana Energy', budget: 54000, status: 'on-hold' },
	{ name: 'Support inbox', client: 'Meridiana Retail', budget: 8000, status: 'delivered' }
];

const CONFIG = { searchIn: ['name', 'client'] as const };

describe('queryList', () => {
	it('slices the page and reports the full total', () => {
		const page = queryList(ROWS, { page: 2, perPage: 2 }, CONFIG);

		expect(page.data).toHaveLength(2);
		expect(page.totalItems).toBe(4);
		expect(page.page).toBe(2);
	});

	it('searches the declared properties only, ignoring case', () => {
		const page = queryList(ROWS, { search: 'meridiana' }, CONFIG);

		expect(page.totalItems).toBe(2);
		expect(page.data.map((row) => row.name)).toEqual(['Customer portal', 'Support inbox']);
	});

	it('filters by accepted values and ignores an empty filter', () => {
		expect(queryList(ROWS, { filters: { status: ['active'] } }, CONFIG).totalItems).toBe(2);
		expect(queryList(ROWS, { filters: { status: [] } }, CONFIG).totalItems).toBe(4);
	});

	it('sorts numbers as numbers, in both directions', () => {
		const ascending = queryList(ROWS, { sort: { property: 'budget', direction: 'asc' } }, CONFIG);
		const descending = queryList(ROWS, { sort: { property: 'budget', direction: 'desc' } }, CONFIG);

		expect(ascending.data.map((row) => row.budget)).toEqual([8000, 12000, 30000, 54000]);
		expect(descending.data.map((row) => row.budget)).toEqual([54000, 30000, 12000, 8000]);
	});

	it('counts the filtered set, not the whole one', () => {
		const page = queryList(ROWS, { search: 'meridiana', page: 1, perPage: 1 }, CONFIG);

		expect(page.totalItems).toBe(2);
		expect(page.data).toHaveLength(1);
	});

	it('leaves the source array untouched', () => {
		const original = [...ROWS];
		queryList(ROWS, { sort: { property: 'budget', direction: 'desc' } }, CONFIG);

		expect(ROWS).toEqual(original);
	});
});
