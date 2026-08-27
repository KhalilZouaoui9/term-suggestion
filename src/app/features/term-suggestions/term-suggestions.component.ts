import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, max, min, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TermSuggestion, TermSuggestionService } from './term-suggestion.service';

const DEFAULT_CHOICES = ['gros', 'gras', 'graisse', 'agressif', 'go'];
const DEFAULT_LIMIT = 2;

@Component({
  selector: 'app-term-suggestions',
  imports: [FormField, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './term-suggestions.component.html',
  styleUrl: './term-suggestions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermSuggestionsComponent {
  private readonly suggestionService = inject(TermSuggestionService);
  protected readonly formModel = signal({ term: '', limit: DEFAULT_LIMIT, choices: DEFAULT_CHOICES.join(', ') });
  protected readonly searchForm = form(this.formModel, (path) => {
    required(path.term);
    minLength(path.term, 1);
    required(path.limit);
    min(path.limit, 1);
    max(path.limit, 50);
    required(path.choices);
    minLength(path.choices, 1);
  });
  protected readonly suggestions = signal<readonly TermSuggestion[]>([]);
  protected readonly hasSearched = signal(false);
  protected readonly resultLabel = computed(() => `${this.suggestions().length} suggestion${this.suggestions().length > 1 ? 's' : ''}`);

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.search();
  }

  protected search(): void {
    if (!this.searchForm().valid()) {
      this.suggestions.set([]);
      this.hasSearched.set(false);
      return;
    }

    const { term, limit, choices } = this.formModel();
    const dictionary = this.parseChoices(choices);
    if (!term.trim() || dictionary.length === 0) {
      this.suggestions.set([]);
      this.hasSearched.set(false);
      return;
    }
    this.suggestions.set(this.suggestionService.getSuggestions(term, dictionary, limit));
    this.hasSearched.set(true);
  }

  private parseChoices(rawChoices: string): string[] {
    return rawChoices
      .split(/[,\n]/)
      .map((term) => term.trim())
      .filter((term) => term.length > 0);
  }

  protected reset(): void {
    this.formModel.set({ term: '', limit: DEFAULT_LIMIT, choices: DEFAULT_CHOICES.join(', ') });
    this.suggestions.set([]);
    this.hasSearched.set(false);
  }
}
