// PracticeSession represents a practice session with the given cards and day number
import { Flashcard, AnswerDifficulty, BucketMap } from "../logic/flashcards";
import { PracticeRecord } from "@logic/practiceRecord";
export interface PracticeSession {
  cards: Flashcard[];
  day: number;
}

// UpdateRequest represents a request to update a flashcard with the given difficulty
export interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: AnswerDifficulty;
}

// HintRequest represents a request to get the hint for a flashcard
export interface HintRequest {
  cardFront: string;
  cardBack: string;
}

// ProgressStats represents statistics about the user's progress
export interface ProgressStats {
  // total number of cards in the user's collection
  totalCards: number;
  // number of cards in each bucket
  cardsByBucket: Record<number, number>;
  // percentage of correct answers
  successRate: number;
  // average number of moves until a card is answered correctly
  averageMovesPerCard: number;
  // total number of practice events
  totalPracticeEvents: number;
}

// FlashcardRow represents a row in the flashcards table of the database
export interface FlashcardRow {
  // unique id of the flashcard
  id: number;
  // front side of the flashcard
  front: string;
  // back side of the flashcard
  back: string;
  // hint for the flashcard
  hint: string | null;
  // tags for the flashcard
  tags: string | null;
  // day number when the flashcard should be scheduled for practice
  scheduledDay: number;
}

// PracticeRecordRow represents a row in the practice_records table of the database
export interface PracticeRecordRow {
  // unique id of the practice record
  id: number;
  // timestamp of when the practice event occurred
  timestamp: number;
  // difficulty of the answer (Wrong, Hard, or Easy)
  difficulty: number;
  // old day number when the practice event occurred
  oldday: number;
  // new day number after the practice event
  newday: number;
}

export { Flashcard, AnswerDifficulty, PracticeRecord, BucketMap };
