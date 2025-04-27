import Database from "better-sqlite3";
import { FlashcardRow, PracticeRecordRow } from "../types";
import { Flashcard } from "../logic/flashcards";

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
        FOREIGN KEY (id) REFERENCES flashcards(id)
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
  const tags = flashcard.tags.length > 0 ? flashcard.tags.join(",") : null;
  db.prepare(
    `INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES (?, ?, ?, ?, ?)`
  ).run(flashcard.front, flashcard.back, flashcard.hint, tags, 0);
}
