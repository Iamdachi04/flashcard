import Database from "better-sqlite3";
import { FlashcardRow, PracticeRecordRow } from "../types";
import { Flashcard } from "../logic/flashcards";
import { PracticeRecord } from "../logic/practiceRecord";
import { get } from "http";

/**
 * Creates the flashcards and practicerecords tables in the given database if
 * they do not already exist.
 * @param {Database} db - The database to create the tables in
 */
export function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        hint TEXT,
        tags TEXT,
        scheduledDay INTEGER NOT NULL DEFAULT 0
    );
    `);

  // Execute a query to create a table
  db.exec(`
    CREATE TABLE IF NOT EXISTS practicerecords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER  NOT NULL,
        difficulty INTEGER  NOT NULL,
        oldday INTEGER  NOT NULL,
        newday INTEGER  NOT NULL,
        FOREIGN KEY (id) REFERENCES flashcards(id),
        UNIQUE (id, timestamp)
    );
    `);
}

/**
 * Parse a row from the flashcards table into a Flashcard object
 * @param {FlashcardRow} row - The row to parse
 * @returns {Flashcard} The parsed flashcard
 * @throws {Error} If the provided row is null, or if compulsory fields are missing
 */
export function parseFlashcard(row: FlashcardRow): Flashcard {
  if (row == null) {
    throw new Error("Null fashcard cannot be parsed");
  }
  if (row.front == null || row.back == null) {
    throw new Error("Flashcard must have a front and back");
  }
  let tags: string[] = [];
  if (row.tags != null) {
    tags = row.tags
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  let hint: string | undefined;
  if (row.hint != null) {
    hint = row.hint;
  }
  return new Flashcard(row.front, row.back, hint, tags);
}

/**
 * Parse a row from the practicerecords table into a PracticeRecord object
 * @param {PracticeRecordRow} row - The row to parse
 * @param {Database.Database} db - The database to query
 * @returns {PracticeRecord} The parsed practice record
 * @throws {Error} If the provided row is null, or if compulsory fields are missing,
 *                 or if the corresponding flashcard does not exist
 */
export function parsePracticeRecord(
  row: PracticeRecordRow,
  db: Database.Database
): PracticeRecord {
  try {
    db.prepare("SELECT 1").get();
  } catch (err) {
    throw new Error("Database unreachable");
  }
  if (row == null) {
    throw new Error("Null practice record cannot be parsed");
  }

  let flashcardRow: FlashcardRow = {
    id: 0,
    front: "",
    back: "",
    hint: null,
    tags: null,
    scheduledDay: 0,
  };
  try {
    flashcardRow = getFlashcardsByCondition(db, `id = ${row.id}`)[0];
  } catch (error) {
    throw new Error(
      "Error retrieving flashcard for this record with id " + row.id
    );
  }
  return new PracticeRecord(
    flashcardRow.front,
    flashcardRow.back,
    row.timestamp,
    row.difficulty,
    row.oldday,
    row.newday
  );
}

/**
 * Gets the current scheduled day for a flashcard
 * @param {Database} db - The database to query
 * @param {string|number} cardId - The ID of the card to check
 * @returns {number|undefined} The scheduled day value or undefined if card not found
 * @throws {Error} If the database is unreachable
 */
export function getCardScheduledDay(db: Database.Database, cardId: string | number): number | undefined {
  try {
    db.prepare("SELECT 1").get();
  } catch (err) {
    throw new Error("Database unreachable");
  }
  
  const result = db.prepare('SELECT scheduledDay FROM flashcards WHERE id = ?').get(cardId);
  return result ? (result as { scheduledDay: number }).scheduledDay : undefined;
}

/**
 * Retrieves an array of flashcards from the database that match the given condition.
 * @param {Database} db - The database to query
 * @param {string} condition - The condition to filter flashcards by
 * @returns {Array<FlashcardRow>} The array of matching flashcards
 * @throws {Error} If the database is unreachable
 */
export function getFlashcardsByCondition(
  db: Database.Database,
  condition: string
): Array<FlashcardRow> {
  try {
    db.prepare("SELECT 1").get();
  } catch (err) {
    throw new Error("Database unreachable");
  }
  return db
    .prepare(`SELECT * FROM flashcards WHERE ${condition}`)
    .all() as FlashcardRow[];
}

/**
 * Retrieves an array of practice records from the database that match the given condition.
 * @param {Database} db - The database to query
 * @param {string} condition - The condition to filter practice records by
 * @returns {Array<PracticeRecordRow>} The array of matching practice records
 * @throws {Error} If the database is unreachable
 */
export function getPracticerecordsByCondition(
  db: Database.Database,
  condition: string
): Array<PracticeRecordRow> {
  try {
    db.prepare("SELECT 1").get();
  } catch (err) {
    throw new Error("Database unreachable");
  }
  return db
    .prepare(`SELECT * FROM practicerecords WHERE ${condition}`)
    .all() as PracticeRecordRow[];
}

/**
 * Adds a new flashcard to the database.
 * @param {Database} db - The database to use
 * @param {Flashcard} flashcard - The flashcard to add
 * @throws {Error} If the database is unreachable
 */
export function addFlashcard(db: Database.Database, flashcard: Flashcard) {
  try {
    db.prepare("SELECT 1").get();
  } catch (err) {
    throw new Error("Database unreachable");
  }
  const tags =
    flashcard.getTags().length > 0 ? flashcard.getTags().join(",") : null;
  db.prepare(
    `INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES (?, ?, ?, ?, ?)`
  ).run(flashcard.front, flashcard.back, flashcard.hint, tags, 0);
}

/**
 * Adds a new practice record to the database.
 * @param {Database} db - The database to use
 * @param {PracticeRecord} practiceRecord - The practice record to add
 * @param {number} flashcardID - The id of the flashcard this practice record is associated with
 * @throws {Error} If the database is unreachable or if either the flashcard id or timestamp is invalid
 */
export function addPracticeRecord(
  db: Database.Database,
  practiceRecord: PracticeRecord,
  flashcardID: number
) {
  try {
    db.prepare("SELECT 1").get();
  } catch (err) {
    throw new Error("Database unreachable");
  }
  if (flashcardID < 1) {
    throw new Error("Invalid flashcard id");
  }
  if (practiceRecord.timestamp < 0) {
    throw new Error("Invalid timestamp");
  }
  db.prepare(
    `INSERT INTO practicerecords (id, timestamp, difficulty, oldday, newday) VALUES (?, ?, ?, ?, ?)`
  ).run(
    flashcardID,
    practiceRecord.timestamp,
    practiceRecord.difficulty,
    practiceRecord.previousBucket,
    practiceRecord.newBucket
  );
}

/**
 * Updates the scheduled day for a flashcard
 * @param {Database} db - The database to use
 * @param {number|string} id - The id of the flashcard to update
 * @param {number} day - The new scheduled day value
 * @throws {Error} If the database is unreachable, flashcard id is invalid, day is invalid, or flashcard doesn't exist
 */
export function updateDay(db: Database.Database, id: number | string, day: number) {
  try {
    db.prepare("SELECT 1").get();
  } catch (err) {
    throw new Error("Database unreachable");
  }
  
  // Convert id to number if it's a string
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(numericId) || numericId < 1) {
    throw new Error("Invalid flashcard id");
  }
  if (day < 0) {
    throw new Error("Invalid day");
  }
  
  // Retrieve flashcard to check if it exists
  const flashcardRows = getFlashcardsByCondition(db, `id = ${numericId}`);

  // If no flashcard is found, throw an error
  if (flashcardRows.length === 0) {
    throw new Error(`Flashcard with id ${numericId} does not exist`);
  }
  
  db.prepare(`UPDATE flashcards SET scheduledDay = ? WHERE id = ?`).run(
    day,
    numericId
  );
}