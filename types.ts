
export interface Word {
  term: string;
  definition: string;
  translation: string;
  example?: string;
  category: string;
  partOfSpeech?: string; // n, v, adj, adv...
}

export enum AppState {
  LANDING = 'LANDING',
  LEARNING = 'LEARNING',
  FLASHCARDS = 'FLASHCARDS'
}
