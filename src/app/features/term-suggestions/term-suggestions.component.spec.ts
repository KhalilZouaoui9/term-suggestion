import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermSuggestionsComponent } from './term-suggestions.component';

describe('TermSuggestionsComponent', () => {
  let fixture: ComponentFixture<TermSuggestionsComponent>;
  let component: TermSuggestionsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TermSuggestionsComponent] }).compileComponents();
    fixture = TestBed.createComponent(TermSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts with an empty state', () => {
    expect(fixture.nativeElement.querySelector('h2')?.textContent).toContain('Start a search');
  });

  it('renders an editable choices textarea pre-filled with the default dictionary and a number input for the limit', () => {
    const textarea: HTMLTextAreaElement | null = fixture.nativeElement.querySelector('textarea');
    const numberInput: HTMLInputElement | null = fixture.nativeElement.querySelector('input[type="number"]');

    expect(textarea).toBeTruthy();
    expect(textarea?.value).toContain('gros');
    expect(numberInput).toBeTruthy();
    expect(numberInput?.value).toBe('2');
  });

  it('renders suggestions after a valid search', () => {
    const model = (component as unknown as { formModel: { set(value: { query: string; limit: number; choices: string }): void } }).formModel;
    const search = (component as unknown as { search(): void }).search;
    model.set({ query: 'gros', limit: 5, choices: 'gros, gras, graisse, agressif' });
    search.call(component);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.suggestion-row').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).toContain('gros');
  });

  it('reacts to real user interaction: typing in the input and submitting the form', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.term-field input');
    input.value = 'gros';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.suggestion-row').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).toContain('gros');
  });
});
