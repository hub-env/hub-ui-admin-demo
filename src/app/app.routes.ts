import { Routes } from '@angular/router';

/**
 * `breadcrumb` carries the translation key, not the text: the breadcrumb
 * template translates it, so the trail follows the language switch.
 */
export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{
		path: 'dashboard',
		data: { breadcrumb: 'nav.dashboard' },
		loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage)
	},
	{
		path: 'projects',
		data: { breadcrumb: 'nav.projects' },
		loadComponent: () => import('./features/projects/projects-page').then((m) => m.ProjectsPage)
	},
	{
		path: 'board',
		data: { breadcrumb: 'nav.board' },
		loadComponent: () => import('./features/board/board-page').then((m) => m.BoardPage)
	},
	{
		path: 'calendar',
		data: { breadcrumb: 'nav.calendar' },
		loadComponent: () => import('./features/calendar/calendar-page').then((m) => m.CalendarPage)
	},
	{ path: '**', redirectTo: 'dashboard' }
];
