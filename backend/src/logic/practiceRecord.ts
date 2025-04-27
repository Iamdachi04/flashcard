export class PracticeRecord {
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
