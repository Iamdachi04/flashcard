import {
  PracticeRecord,
  ProgressStats,
  Flashcard,
  AnswerDifficulty,
  BucketMap,
} from "../types";

/**
 * Converts a BucketMap to an Array of Sets of Flashcards where
 * each Set represents all the flashcards in a bucket of the same number.
 * The array length is one more than the highest bucket number in the input.
 * @param buckets The BucketMap to convert
 * @returns An array of Sets of flashcards where each Set represents a bucket
 */
export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  const result: Array<Set<Flashcard>> = [];
  let maxBucket = 0;
  for (const bucketNum of buckets.keys()) {
    maxBucket = Math.max(maxBucket, bucketNum);
  }

  for (let i = 0; i <= maxBucket; i++) {
    const emptySet = new Set<Flashcard>();
    result.push(emptySet);
  }

  for (const [bucketNum, cards] of buckets.entries()) {
    result[bucketNum] = cards;
  }

  return result;
}

/**
 * Given an array of sets of flashcards, each set representing a bucket of cards of the same number,
 * and a day number, returns a set of flashcards to practice for that day.
 * The algorithm is as follows: for each card in bucket 0, add it to the practice set.
 * Then, for each bucket number n, if day % 2^n is 0, add all the cards in that bucket to the practice set.
 * The result is a set of all the flashcards that should be practiced on the given day.
 * @param buckets The array of sets of flashcards, each set representing a bucket of cards of the same number.
 * @param day The day number to select practice cards for.
 * @returns A set of flashcards to practice for the given day.
 */
export function practice(
  buckets: Array<Set<Flashcard>>,
  day: number
): Set<Flashcard> {
  // Create a set to hold the cards selected for practice
  const cardsToPractice = new Set<Flashcard>();

  // Always include cards from bucket 0 in the practice session
  const bucketZeroSet = buckets[0];
  if (bucketZeroSet) {
    // Iterate over each card in bucket 0
    for (const card of bucketZeroSet) {
      // Add the card to the practice set
      cardsToPractice.add(card);
    }
  }
  for (let bucketNum = 1; bucketNum < buckets.length; bucketNum++) {
    const interval = Math.pow(2, bucketNum);

    const isPracticeDayForBucket = day % interval === 0;

    const currentBucketCards = buckets[bucketNum];
    if (isPracticeDayForBucket && currentBucketCards) {
      for (const card of currentBucketCards) {
        cardsToPractice.add(card);
      }
    }
  }

  return cardsToPractice;
}

/**
 * Updates the card's bucket based on the answer difficulty.
 * If the card was previously in a bucket, it is removed from that bucket.
 * If the card was not previously in a bucket, it is added to the correct bucket.
 * The result is a new BucketMap with the card's updated bucket.
 * @param buckets The buckets to update
 * @param card The card to update
 * @param difficulty The difficulty of the user's answer
 * @returns The updated buckets
 */
export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  // Find the current bucket number of the card
  let currentBucket = -1;
  // Iterate through the existing buckets to find the card
  for (const [bucketNum, cards] of buckets.entries()) {
    if (cards.has(card)) {
      currentBucket = bucketNum;
      // Stop searching once the card is found
      break;
    }
  }

  // Create a new Map to store the updated buckets
  const newBuckets = new Map<number, Set<Flashcard>>();
  // Copy the contents of the original buckets into the new map
  // It's important to create new Set instances here
  for (const [bucketNum, cards] of buckets.entries()) {
    const copiedSet = new Set<Flashcard>(cards);
    newBuckets.set(bucketNum, copiedSet);
  }

  // If the card was found in a bucket (meaning it's an existing card)
  if (currentBucket !== -1) {
    // Get the set for the current bucket from the new map
    const currentSet = newBuckets.get(currentBucket);
    // If the set exists in the new map (which it should if copied correctly)
    if (currentSet) {
      // Remove the card from its previous bucket in the new map
      currentSet.delete(card);
    }
  } else {
    // If the card was not found in any bucket (likely a new card being added)
    // Ensure bucket 0 exists in the new map to potentially add it there
    if (!newBuckets.has(0)) {
      newBuckets.set(0, new Set<Flashcard>());
    }
  }

  // Determine the target bucket number based on the answer difficulty and current bucket
  let newBucket: number;
  if (difficulty === AnswerDifficulty.Wrong) {
    // If answered wrong, the card moves back to bucket 0
    newBucket = 0;
  } else if (difficulty === AnswerDifficulty.Hard) {
    // If answered hard, the card stays in its current bucket
    // If the card was new (currentBucket === -1), it stays in bucket 0
    newBucket = currentBucket === -1 ? 0 : currentBucket;
  } else {
    // AnswerDifficulty.Easy
    // If answered easy, the card moves to the next bucket
    // If the card was new, it starts at bucket 0 then moves to bucket 1
    const effectiveCurrentBucket = currentBucket === -1 ? 0 : currentBucket;
    newBucket = effectiveCurrentBucket + 1;
  }

  // Ensure the target bucket exists in the new map before adding the card
  const targetSet = newBuckets.get(newBucket);
  if (!targetSet) {
    // If the set for the target bucket does not exist, create a new empty set
    const emptySetForNewBucket = new Set<Flashcard>();
    newBuckets.set(newBucket, emptySetForNewBucket);
  }

  // Add the card to its calculated new bucket
  // We can safely use non-null assertion here because we just ensured the bucket exists
  const bucketToAddTo = newBuckets.get(newBucket);
  bucketToAddTo!.add(card);

  return newBuckets;
}

/**
 * Retrieves the hint for a given flashcard.
 * If the flashcard has a hint, it returns the hint string.
 * Otherwise, it returns a default message indicating no hint is available.
 * @param card - The flashcard object containing the hint property.
 * @returns The hint string if available, otherwise a default message.
 */

export function getHint(card: Flashcard): string {
  // Check if the card object has a truthy 'hint' property
  if (card.hint) {
    // If a hint exists, return it
    return card.hint;
  }
  // If no hint is available, return a default message
  return "No hint available for this card.";
}

/**
 * Computes the learning progress statistics based on the current state of buckets and practice history.
 *
 * @param buckets - A map where each key is a bucket number and the value is a set of flashcards in that bucket.
 * @param history - An array of practice records detailing past interactions with flashcards.
 * @returns An object containing overall statistics including total number of cards, cards by bucket,
 *          success rate of answers, average number of moves per card, and total number of practice events.
 */

export function computeProgress(
  buckets: BucketMap,
  history: PracticeRecord[]
): ProgressStats {
  // Calculate total number of cards and count cards per bucket
  let totalCards = 0;
  const cardsByBucket: Record<number, number> = {};

  // Iterate through each bucket in the current state
  for (const [bucketNum, cards] of buckets.entries()) {
    // Add the size of the current bucket to the total count
    totalCards += cards.size;
    // Record the count of cards for this specific bucket number
    cardsByBucket[bucketNum] = cards.size;
  }

  // Determine the maximum bucket number encountered to ensure the stats cover all buckets up to the max
  let maxBucketNumber = 0;
  const bucketNumbers = Object.keys(cardsByBucket);
  if (bucketNumbers.length > 0) {
    const numericBucketNumbers = bucketNumbers.map((key) => Number(key));
    maxBucketNumber = Math.max(...numericBucketNumbers);
  }

  // Ensure the cardsByBucket object includes all bucket numbers from 0 up to the max,
  // initializing counts to 0 if a bucket was not present or empty in the map.
  for (let i = 0; i <= maxBucketNumber; i++) {
    if (!(i in cardsByBucket)) {
      cardsByBucket[i] = 0;
    }
  }

  // Calculate the success rate from the history records
  // Total number of answers is the total number of history records
  const totalAnswers = history.length;
  let correctAnswers = 0;

  // Count correct answers (Easy or Hard difficulty) from history
  for (const record of history) {
    const difficulty = record.difficulty;
    const isCorrect =
      difficulty === AnswerDifficulty.Easy ||
      difficulty === AnswerDifficulty.Hard;
    if (isCorrect) {
      correctAnswers++;
    }
  }

  // Calculate the success rate percentage
  let successRate = 0;
  if (totalAnswers > 0) {
    successRate = (correctAnswers / totalAnswers) * 100;
  }

  // Calculate the average number of moves (practice events) per card based on history
  const cardMoves: Record<string, number> = {};
  // Populate the cardMoves object by counting occurrences of each card in history
  for (const record of history) {
    // Create a unique identifier for the card
    const cardKey = `${record.cardFront}:${record.cardBack}`;

    // Initialize the count for this card if it's the first time seeing it
    if (!(cardKey in cardMoves)) {
      cardMoves[cardKey] = 0;
    }
    // Increment the count for this card
    cardMoves[cardKey]++;
  }

  // Sum up the total number of moves recorded across all unique cards
  let totalMovesSum = 0;
  const movesCounts = Object.values(cardMoves);
  for (const count of movesCounts) {
    totalMovesSum += count;
  }

  // Get the number of unique cards present in the history
  const numUniqueCardsInHistory = Object.keys(cardMoves).length;

  // Calculate the average moves per unique card
  let averageMovesPerCard = 0;
  if (numUniqueCardsInHistory > 0) {
    averageMovesPerCard = totalMovesSum / numUniqueCardsInHistory;
  }

  // Return the calculated statistics
  return {
    totalCards,
    cardsByBucket,
    successRate,
    averageMovesPerCard,
    totalPracticeEvents: totalAnswers,
  };
}
