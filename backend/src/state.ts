import Database from "better-sqlite3";
import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./logic/practiceRecord";
import { PracticeRecordRow, FlashcardRow } from "./types";
import * as utils from "./utils/database";

// --- State ---
/**
 * The state of the application has mainly been moved to the database.
 * Cards are stored in the "flashcards" table, and the practice history is stored in the "PracticeRecords" table.
 * Current day has been moved to frontend thus rendering the backend stateless to prevent mismatch.
 * Any API request that depends on "Day" will contain the current day.
 */

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
    ["chess", "gambit", "botez"]
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
    ["chess", "ego", "arrogant"]
  ),
];

// --- State Variables ---
// Initialize buckets: Put all initial cards in bucket 0

/**
 * Initializes the flashcards database with the initial set of cards.
 *
 * @param db Database instance, passed in by the caller.
 */
export function initializeState(db: Database.Database) {
  initialCards.forEach((card) => {
    utils.addFlashcard(db, card);
  });
}

// --- State Accessors and Mutators ---

/**
 * Retrieves a BucketMap containing sets of flashcards organized by their scheduled day.
 *
 * @param db - The database instance used to query flashcards.
 * @returns A BucketMap where each key is a day number (starting from 0) and
 *          the value is a set of flashcards scheduled for that day.
 *
 * The function queries the database to find the maximum scheduled day
 * and iterates from day 0 to this maximum day, collecting flashcards
 * for each day and organizing them into sets stored in the map.
 */
export const getBuckets = (db: Database.Database): BucketMap => {
  // Get highest day flashcards
  const maxDayRows = utils.getFlashcardsByCondition(
    db,
    "scheduledDay = ( SELECT MAX(scheduledDay) FROM flashcards)"
  );
  // Get max possible day
  const maxDay = maxDayRows[0]?.scheduledDay ?? 0;
  const bucketsMap: Map<number, Set<Flashcard>> = new Map();

  // Create Bucketmap
  for (let i = 0; i <= maxDay; i++) {
    const dayRows = utils.getFlashcardsByCondition(db, `scheduledDay = ${i}`);
    const bucketSet = new Set<Flashcard>(
      dayRows.map((row) => utils.parseFlashcard(row))
    );
    bucketsMap.set(i, bucketSet);
  }

  return bucketsMap;
};

/**
 * Retrieves the practice history from the database.
 *
 * @param db - The database instance used to query practice records.
 * @returns An array of PracticeRecord objects representing the practice history.
 *
 * The function queries all practice records from the database and maps each
 * record row to a PracticeRecord object using the parsePracticeRecord utility.
 */ export const getHistory = (db: Database.Database): PracticeRecord[] => {
  const PracticeRecordRows: PracticeRecordRow[] =
    utils.getPracticerecordsByCondition(db, "true");
  return PracticeRecordRows.map((row) => utils.parsePracticeRecord(row, db));
};

/**
 * Adds a new practice record to the database.
 *
 * @param db - The database to query and write to.
 * @param record - The practice record to add.
 *
 * The function first finds the Flashcard associated with the practice record
 * by querying the database with the card's front and back sides. It then uses
 * the found card's id to add the practice record to the database.
 */
export const addHistoryRecord = (
  db: Database.Database,
  record: PracticeRecord
): void => {
  const recordedCard = utils.getFlashcardsByCondition(
    db,
    `front = '${record.cardFront}' AND back = '${record.cardBack}'`
  )[0];

  utils.addPracticeRecord(db, record, recordedCard.id);
};

/**
 * Finds a FlashcardRow in the database given its front and back sides.
 *
 * @param db The database to query.
 * @param front The front side of the flashcard.
 * @param back The back side of the flashcard.
 * @returns The FlashcardRow matching the given front and back sides, or undefined if not found.
 */
export function findCardRow(
  db: Database.Database,
  front: string,
  back: string
): FlashcardRow {
  const recordedCard: FlashcardRow = utils.getFlashcardsByCondition(
    db,
    `front = '${front}' AND back = '${back}'`
  )[0];

  return recordedCard;
}
