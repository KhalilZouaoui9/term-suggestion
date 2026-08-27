import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./features/term-suggestions/term-suggestions.component').then((m) => m.TermSuggestionsComponent),
	},
	{ path: '**', redirectTo: '' },
];
