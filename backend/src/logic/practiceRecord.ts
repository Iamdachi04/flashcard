import assert from "assert";

export class PracticeRecord {
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
  ) {
    this.checkRep();
  }
  /**
   * Rep Invariant:
   * * - The timestamp must be a positive number.
   * * - The previous and new buckets must be non-negative integers.
   * * - The difficulty must be a valid AnswerDifficulty enum value.
   * Abstraction function: cardFront, cardBack, timestamp, difficulty, previousBucket, and newBucket are the properties of the practice record.
   * * - The cardFront is the question, the cardBack is the answer, the timestamp is when the practice event occurred, difficulty is the difficulty level of the answer, previousBucket is the bucket the card was in before the practice event, and newBucket is the bucket it moved to after.
   * Safety from rep exposure:
   * * - The cardFront, cardBack, timestamp, difficulty, previousBucket, and newBucket are readonly properties, so they cannot be modified after the object is created.
   *  */

  private checkRep() {
    assert(this.timestamp >= 0, "Timestamp must be a positive number");
    assert(this.previousBucket >= 0, "Previous bucket must be non-negative");
    assert(this.newBucket >= 0, "New bucket must be non-negative");
    assert(
      Object.values(AnswerDifficulty).includes(this.difficulty),
      "Difficulty must be a valid AnswerDifficulty enum value"
    );
  }
}

export enum AnswerDifficulty {
  Wrong = 0,
  Hard = 1,
  Easy = 2,
}
