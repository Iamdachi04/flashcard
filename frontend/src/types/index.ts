
export interface Flashcard {
  readonly front: string;
  readonly back: string;
  readonly hint?: string; // Hint is optional as requested
  readonly tags: ReadonlyArray<string>;
}


export enum AnswerDifficulty {
  Wrong = 0,
  Hard = 1,
  Easy = 2,
}


export interface PracticeSession {
  day: number;
  cards: Flashcard[];

}


export interface UpdateRequest {
  cardFront: string;
  difficulty: AnswerDifficulty;
  cardBack: string;

}


export interface ProgressStats {
  averageMovesPerCard: number;
  totalCards: number;
  totalPracticeEvents: number;
  successRate: number; // Percentage
  cardsByBucket: Record<number, number>;
}

// Optional: response from POST /advanceDay
export interface AdvanceDayResponse {
  currentDay: number;
}