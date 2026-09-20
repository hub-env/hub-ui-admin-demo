import { TestBed } from '@angular/core/testing';
import { ThemeStore } from './theme-store';

describe('ThemeStore', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.dataset['theme'] = 'light';
		TestBed.configureTestingModule({});
	});

	it('starts from the theme index.html already painted', () => {
		document.documentElement.dataset['theme'] = 'dark';

		expect(TestBed.inject(ThemeStore).theme()).toBe('dark');
	});

	it('writes the theme to the document and remembers it', () => {
		const store = TestBed.inject(ThemeStore);

		store.toggle();
		TestBed.tick();

		expect(store.theme()).toBe('dark');
		expect(document.documentElement.dataset['theme']).toBe('dark');
		expect(localStorage.getItem('hub-pm.theme')).toBe('dark');
	});

	it('toggles back to light', () => {
		const store = TestBed.inject(ThemeStore);

		store.toggle();
		store.toggle();
		TestBed.tick();

		expect(store.theme()).toBe('light');
		expect(document.documentElement.dataset['theme']).toBe('light');
	});
});
