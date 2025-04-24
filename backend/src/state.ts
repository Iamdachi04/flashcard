import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./types";

// --- Initial Data ---
// Define some sample flashcards
const initialCards: Flashcard[] = [
  new Flashcard(
    "Known for 'The Notorious' nickname",
    "Conor McGregor",
    "He has a left hand that would put a elephant to sleep... and a suit collection that screams 'money'.",
    ["ufc", "fighter", "ireland"]
  ),
  new Flashcard(
    "Known as 'The Spider'",
    "Anderson Silva",
    "He could dodge a fly in a phone booth and probably broke a few dance moves in the octagon.",
    ["ufc", "fighter", "brazil"]
  ),
  new Flashcard(
    "Famous for his wrestling and calling out Brock Lesnar",
    "Daniel Cormier",
    "He's a commentator now, but he used to pick people up and slam them like it was his job... oh wait.",
    ["ufc", "fighter", "usa"]
  ),
  new Flashcard(
    "Known for the 'Diaz brothers' and Stockton Slap",
    "Nate Diaz",
    "He'll tell you exactly what he thinks, doesn't matter who you are. And he's 209, what?!",
    ["ufc", "fighter", "usa"]
  ),
  new Flashcard(
    "Undefeated Lightweight Champion",
    "Khabib Nurmagomedov",
    "He'll maul you on the ground and then jump over the cage. Just needs a little tap machine.",
    ["ufc", "fighter", "russia"]
  ),
  new Flashcard(
    "Known as 'Bones'",
    "Jon Jones",
    "Master of the oblique kick and questionable life choices outside the cage. Still somehow the GOAT to many.",
    ["ufc", "fighter", "usa"]
  ),
  new Flashcard(
    "champion of multipple divisions",
    "Izzy Adesanya",
    "biggest celebration artist",
    ["ufc", "fighter", "usa"]
  ),

  new Flashcard(
    "Georgian fighter",
    "Meraaaaab , 'the machineeeeee' dvaaaaaliiiiishviliiiiiii",
    "drags you into deep waters , very , very deep waters",
    ["ufc", "fighter", "georgia"]
  ),

  new Flashcard(
    "don't boo , spam briliaaaant!!!",
    "witty alien",
    "chess player that is trully a gem in this generation",
    ["chess", "alien"]
  ),


  new Flashcard(
    "the one , the only ...",
    "Magnus Carlsen",
    "the champion of champions in chess",
    ["chess", "GOAT"]
  ),


  new Flashcard(
    "the one who tried his best against Magnus",
    "Hikaru nakamura",
    "takes,takes,takes,here,here,there there,takes check here and I just win",
    ["chess", "check"]
  ),


  new Flashcard(
    "the unckrowned king of chess",
    "Alierza firouzja",
    "the one with big glasses lol",
    ["chess", "prince"]
  ),


  new Flashcard(
    "the one who delivers chess lessons in the best way",
    "Daniel Naroditsky",
    "the 'prophet' of chess",
    ["chess", "prophet"]
  ),


  new Flashcard(
    "the most tricky player of chess",
    "Eric rosen",
    "he invented term 'oh no my queen'",
    ["chess", "trickyguy"]
  ),


  new Flashcard(
    "the one who's the biggest streamer youtuber",
    "ლივაი (levy) gothamchess",
    "the rooooooooock",
    ["chess", "rooooooooock"]
  ),

  new Flashcard(
    "they are sisters in chess",
    "botez sisters",
    "has a chess opening named after their surname",
    ["chess", "gambit","botez"]
  ),

  new Flashcard(
    "the greatest soviet player ever",
    "Michail Tal(if you do not know him,we can't talk)",
    "the MAGICIAN of chess",
    ["chess", "Magician"]
  ),

  new Flashcard(
    "the arrogant GOAT",
    "Bobby Fisher",
    "kind of a weird arrogant he was , but he delivered every single time",
    ["chess", "ego","arrogant"]
  ),




];

// --- State Variables ---
// Initialize buckets: Put all initial cards in bucket 0
let currentBuckets: BucketMap = new Map();
const initialCardSet = new Set(initialCards);
currentBuckets.set(0, initialCardSet);

// Initialize practice history
let practiceHistory: PracticeRecord[] = [];

// Current simulation day (can be incremented or managed)
let currentDay: number = 0;

// --- State Accessors and Mutators ---
export const getBuckets = (): BucketMap => currentBuckets;

export const setBuckets = (newBuckets: BucketMap): void => {
  currentBuckets = newBuckets;
};

export const getHistory = (): PracticeRecord[] => practiceHistory;

export const addHistoryRecord = (record: PracticeRecord): void => {
  practiceHistory.push(record);
};

export const getCurrentDay = (): number => currentDay;

export const incrementDay = (): void => {
  currentDay++;
};

// Helper to find a card (assuming front/back are unique identifiers for now)
export const findCard = (
  front: string,
  back: string
): Flashcard | undefined => {
  for (const [, bucketSet] of currentBuckets) {
    for (const card of bucketSet) {
      if (card.front === front && card.back === back) {
        return card;
      }
    }
  }
  // Check initial set too, in case it hasn't been placed yet (edge case)
  return initialCards.find(
    (card) => card.front === front && card.back === back
  );
};

// Helper to find the bucket of a card
export const findCardBucket = (cardToFind: Flashcard): number | undefined => {
  for (const [bucketNum, bucketSet] of currentBuckets) {
    if (bucketSet.has(cardToFind)) {
      return bucketNum;
    }
  }
  return undefined; // Should ideally always be found if state is consistent
};

console.log("Initial State Loaded:", currentBuckets);
