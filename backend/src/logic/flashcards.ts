import { assert } from "console";

export class Flashcard implements Flashcard {
  /**
   * Creates a new Flashcard.
   * @param front - the front of the flashcard, which is the question.
   * @param back - the back of the flashcard, which is the answer.
   * @param hint - the hint associated with the flashcard, which is a hint for the answer. If not provided, defaults to undefined.
   * @param tags - the tags associated with the flashcard, which are used for grouping. If not provided, defaults to an empty array.
   */
  constructor(
    readonly front: string,
    readonly back: string,
    readonly hint?: string,
    private readonly tags: ReadonlyArray<string> = []
  ) {
    this.checkRep();
  }
  /**
   * Rep Invariant:
   * * - The hint cannot be the same as the back of the flashcard.
   * Abstraction function: front, back, hint, and tags are the properties of the flashcard.
   * * - The front is the question, the back is the answer, the hint is a hint for the answer, tags are used for grouping.
   * Safety from rep exposure:
   * * - The front, back, and hint are readonly properties, so they cannot be modified after the object is created.
   * * - Tags array is private, readonly, and is returned as a read-only copy by the getter, so it cannot be modified from outside the class.
   * * - The constructor checks that the hint is not the same as the back, so the rep invariant is maintained.
   *  */

  /**
   * Get the tags associated with this flashcard.
   * @returns a read-only copy of the tags array.
   */
  getTags(): ReadonlyArray<string> {
    return [...this.tags];
  }

  /**
   * Check the rep invariant of the flashcard.
   * The rep invariant is that the hint is not the same as the back.
   * This is a safety check to ensure that the flashcard is in a valid state.
   * It is called by the constructor to ensure that the rep invariant is maintained when the object is created.
   */
  private checkRep() {
    assert(this.hint !== this.back, "Hint cannot be the same as back");
  }
}

export enum AnswerDifficulty {
  Wrong = 0,
  Hard = 1,
  Easy = 2,
}

// Buckets are numbered starting from 0
// Bucket 0 contains new cards and cards that were answered incorrectly
export type BucketMap = Map<number, Set<Flashcard>>;
