import { Injectable } from '@angular/core';

export interface TermSuggestion {
  readonly term: string;
  readonly differences: number;
  readonly lengthDelta: number;
  readonly reason: 'exact' | 'contains' | 'replacement';
}

@Injectable({ providedIn: 'root' })
export class TermSuggestionService {
  private readonly collator = new Intl.Collator('fr', { sensitivity: 'base' });

  getSuggestions(term: string, choices: readonly string[], limit: number): TermSuggestion[] {
    if (term == null || limit < 1) return [];

    const normalizedTerm = this.normalize(term);
    if (!normalizedTerm) return [];

    const suggestions: TermSuggestion[] = [];
    for (const choice of choices) {
      const suggestion = this.score(normalizedTerm, choice);
      if (suggestion !== null) suggestions.push(suggestion);
    }

    suggestions.sort(
      (a, b) =>
        a.differences - b.differences ||
        a.lengthDelta - b.lengthDelta ||
        this.collator.compare(a.term, b.term),
    );

    return suggestions.length > limit ? suggestions.slice(0, limit) : suggestions;
  }

  private score(term: string, candidate: string): TermSuggestion | null {
    const normalizedCandidate = this.normalize(candidate);
    const queryLength = term.length;
    const lengthDelta = normalizedCandidate.length - queryLength;
    if (lengthDelta < 0) return null;

    if (lengthDelta === 0 && normalizedCandidate === term) {
      return { term: candidate, differences: 0, lengthDelta: 0, reason: 'exact' };
    }

    let minDifferences = queryLength;
    for (let start = 0; start <= lengthDelta && minDifferences > 0; start++) {
      let differences = 0;
      for (let i = 0; i < queryLength && differences < minDifferences; i++) {
        if (term.charCodeAt(i) !== normalizedCandidate.charCodeAt(start + i)) differences++;
      }
      if (differences < minDifferences) minDifferences = differences;
    }

    const reason = minDifferences === 0 ? 'contains' : 'replacement';
    return { term: candidate, differences: minDifferences, lengthDelta, reason };
  }

  private normalize(value: string): string {
    return value.trim().toLocaleLowerCase('fr-FR');
  }
}
