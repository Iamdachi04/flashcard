import { Database } from "better-sqlite3";
import { FlashcardRow, PracticeRecordRow } from "../types";
import { Flashcard } from "../logic/flashcards";
/**
 * Creates the flashcards and practicerecords tables in the given database if
 * they do not already exist.
 * @param {Database} db - The database to create the tables in
 */
export function createTables(db: Database) {
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
        FOREIGN KEY (cardId) REFERENCES flashcards(id)
    );
    `);
}

function parseFlashcard(row: FlashcardRow) {
  if (row == null) {
    throw new Error("Null fashcard cannot be parsed");
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

export function get_flashcards(db: Database, cardId: number): Array<Flashcard> {
  //TODO
}
