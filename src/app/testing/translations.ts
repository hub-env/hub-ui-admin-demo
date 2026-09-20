/** The strings the component tests assert on, kept out of every spec. */
export const en = {
	app: { name: 'Hub PM', tagline: 'Built with Hub UI' },
	theme: { toLight: 'Light', toDark: 'Dark' },
	language: { label: 'Language' },
	nav: { dashboard: 'Dashboard', projects: 'Projects', board: 'Board', calendar: 'Calendar' },
	common: { comingSoon: 'Coming soon' },
	dashboard: {
		subtitle: 'How the projects are doing',
		summary: 'Summary',
		onTime: 'Delivered on time',
		onTimeNote: 'Milestones met',
		activeProjects: 'Active projects',
		activeProjectsNote: 'Of twelve',
		overdue: 'Overdue tasks',
		needsAttention: 'Needs attention',
		allClear: 'All clear',
		weekHours: 'Hours in flight',
		weekHoursNote: 'Of {{capacity}} hours, {{used}}%',
		capacity: 'Capacity',
		milestones: 'Upcoming milestones',
		overdueTasks: 'Running late',
		activity: 'Recent activity',
		daysLate: '{{days}}d late'
	},
	activity: {
		created: '{{name}} created',
		moved: '{{name}} moved',
		commented: '{{name}} commented on',
		completed: '{{name}} completed'
	},
	milestoneState: { complete: 'Met', active: 'At risk', pending: 'Pending' },
	states: { empty: 'Nothing here yet.', error: 'The data could not be loaded.', retry: 'Try again' }
};

export const es = {
	app: { name: 'Hub PM', tagline: 'Hecha con Hub UI' },
	theme: { toLight: 'Claro', toDark: 'Oscuro' },
	language: { label: 'Idioma' },
	nav: { dashboard: 'Panel', projects: 'Proyectos', board: 'Tablero', calendar: 'Calendario' },
	common: { comingSoon: 'Próximamente' },
	dashboard: {
		subtitle: 'Cómo van los proyectos',
		summary: 'Resumen',
		onTime: 'Entregado a tiempo',
		onTimeNote: 'Hitos cumplidos',
		activeProjects: 'Proyectos activos',
		activeProjectsNote: 'De doce',
		overdue: 'Tareas atrasadas',
		needsAttention: 'Requiere atención',
		allClear: 'Al día',
		weekHours: 'Horas en marcha',
		weekHoursNote: 'De {{capacity}} horas, {{used}}%',
		capacity: 'Capacidad',
		milestones: 'Próximos hitos',
		overdueTasks: 'Van con retraso',
		activity: 'Actividad reciente',
		daysLate: '{{days}} d de retraso'
	},
	activity: {
		created: '{{name}} ha creado',
		moved: '{{name}} ha movido',
		commented: '{{name}} ha comentado',
		completed: '{{name}} ha terminado'
	},
	milestoneState: { complete: 'Cumplido', active: 'En riesgo', pending: 'Pendiente' },
	states: { empty: 'Todavía no hay nada.', error: 'No se han podido cargar los datos.', retry: 'Reintentar' }
};
