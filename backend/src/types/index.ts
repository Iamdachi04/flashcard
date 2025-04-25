import { Flashcard, AnswerDifficulty, BucketMap } from "../logic/flashcards";

export interface PracticeSession {
  cards: Flashcard[];
  day: number;
}

export interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: AnswerDifficulty;
}

export interface HintRequest {
  cardFront: string;
  cardBack: string;
}

export interface ProgressStats {
  totalCards: number;
  cardsByBucket: Record<number, number>;
  successRate: number;
  averageMovesPerCard: number;
  totalPracticeEvents: number;
}

export interface PracticeRecord {
  cardFront: string;
  cardBack: string;
  timestamp: number;
  difficulty: AnswerDifficulty;
  previousBucket: number;
  newBucket: number;
}

export interface FlashcardRow {
  id: number;
  front: string;
  back: string;
  hint: string | null;
  tags: string | null;
  scheduledDay: number;
}

export interface PracticeRecordRow {
  id: number;
  timestamp: number;
  difficulty: number;
  oldday: number;
  newday: number;
}
export { Flashcard, AnswerDifficulty, BucketMap };
