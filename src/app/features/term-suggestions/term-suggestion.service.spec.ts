import { TestBed } from '@angular/core/testing';
import { TermSuggestionService } from './term-suggestion.service';

describe('TermSuggestionService', () => {
  let service: TermSuggestionService;
  const choices = ['gros', 'gras', 'graisse', 'agressif', 'go', 'ros', 'gro'];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TermSuggestionService] });
    service = TestBed.inject(TermSuggestionService);
  });

  it('returns exact and containing terms first', () => {
    const suggestions = service.getSuggestions('gros', choices, 5);
    expect(suggestions.map(({ term }) => term).slice(0, 2)).toEqual(['gros', 'gras']);
    expect(suggestions[0].differences).toBe(0);
  });

  it('matches the exact scenario from the specification', () => {
    const suggestions = service.getSuggestions('gros', choices, 2);
    expect(suggestions.map(({ term, differences }) => ({ term, differences }))).toEqual([
      { term: 'gros', differences: 0 },
      { term: 'gras', differences: 1 },
    ]);

    const fullRanking = service.getSuggestions('gros', choices, 10).map(({ term }) => term);
    expect(fullRanking).toEqual(['gros', 'gras', 'agressif', 'graisse']);
  });

  it('excludes candidates shorter than the query', () => {
    const terms = service.getSuggestions('gros', choices, 10).map(({ term }) => term);
    expect(terms).not.toContain('go');
    expect(terms).not.toContain('ros');
    expect(terms).not.toContain('gro');
  });

  it('sorts ties by length and then alphabetically', () => {
    const terms = service.getSuggestions('gras', ['zras', 'aras', 'gras'], 10).map(({ term }) => term);
    expect(terms).toEqual(['gras', 'aras', 'zras']);
  });

  it('normalizes casing and surrounding whitespace', () => {
    expect(service.getSuggestions('  GROS ', ['gros'], 1)[0].term).toBe('gros');
  });

  it('returns an empty array for a negative limit', () => {
    expect(service.getSuggestions('gros', choices, -1)).toEqual([]);
  });

  it('returns an empty array for a zero limit', () => {
    expect(service.getSuggestions('gros', choices, 0)).toEqual([]);
  });

  it('returns an empty array for an empty or whitespace-only term', () => {
    expect(service.getSuggestions('', choices, 5)).toEqual([]);
    expect(service.getSuggestions('   ', choices, 5)).toEqual([]);
  });

  it('returns an empty array for a null or undefined term', () => {
    expect(service.getSuggestions(null as unknown as string, choices, 5)).toEqual([]);
    expect(service.getSuggestions(undefined as unknown as string, choices, 5)).toEqual([]);
  });

  it('returns an empty array when there are no choices', () => {
    expect(service.getSuggestions('gros', [], 5)).toEqual([]);
  });
});
