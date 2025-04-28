export class PracticeRecord implements PracticeRecord {
  /**
   * Constructs a new PracticeRecord instance representing a flashcard practice event.
   *
   * @param cardFront - The front text of the flashcard.
   * @param cardBack - The back text of the flashcard.
   * @param timestamp - The timestamp of when the practice event occurred.
   * @param difficulty - The difficulty level of the answer.
   * @param previousBucket - The bucket the card was in before the practice event.
   * @param newBucket - The bucket the card moved to after the practice event.
   */
  constructor(
    readonly cardFront: string,
    readonly cardBack: string,
    readonly timestamp: number,
    readonly difficulty: AnswerDifficulty,
    readonly previousBucket: number,
    readonly newBucket: number
  ) {}
}

export enum AnswerDifficulty {
  Wrong = 0,
  Hard = 1,
  Easy = 2,
}
