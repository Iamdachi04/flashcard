"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = createTables;
exports.parseFlashcard = parseFlashcard;
exports.parsePracticeRecord = parsePracticeRecord;
exports.getFlashcardsByCondition = getFlashcardsByCondition;
exports.getPracticerecordsByCondition = getPracticerecordsByCondition;
exports.addFlashcard = addFlashcard;
exports.addPracticeRecord = addPracticeRecord;
exports.updateDay = updateDay;
const flashcards_1 = require("../logic/flashcards");
const practiceRecord_1 = require("../logic/practiceRecord");
/**
 * Creates the flashcards and practicerecords tables in the given database if
 * they do not already exist.
 * @param {Database} db - The database to create the tables in
 */
function createTables(db) {
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
function parseFlashcard(row) {
    if (row == null) {
        throw new Error("Null fashcard cannot be parsed");
    }
    if (row.front == null || row.back == null) {
        throw new Error("Flashcard must have a front and back");
    }
    let tags = [];
    if (row.tags != null) {
        tags = row.tags
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }
    let hint;
    if (row.hint != null) {
        hint = row.hint;
    }
    return new flashcards_1.Flashcard(row.front, row.back, hint, tags);
}
/**
 * Parse a row from the practicerecords table into a PracticeRecord object
 * @param {PracticeRecordRow} row - The row to parse
 * @param {Database.Database} db - The database to query
 * @returns {PracticeRecord} The parsed practice record
 * @throws {Error} If the provided row is null, or if compulsory fields are missing,
 *                 or if the corresponding flashcard does not exist
 */
function parsePracticeRecord(row, db) {
    try {
        db.prepare("SELECT 1").get();
    }
    catch (err) {
        throw new Error("Database unreachable");
    }
    if (row == null) {
        throw new Error("Null practice record cannot be parsed");
    }
    let flashcardRow = {
        id: 0,
        front: "",
        back: "",
        hint: null,
        tags: null,
        scheduledDay: 0,
    };
    try {
        flashcardRow = getFlashcardsByCondition(db, `id = ${row.id}`)[0];
    }
    catch (error) {
        throw new Error("Error retrieving flashcard for this record with id " + row.id);
    }
    return new practiceRecord_1.PracticeRecord(flashcardRow.front, flashcardRow.back, row.timestamp, row.difficulty, row.oldday, row.newday);
}
/**
 * Retrieves an array of flashcards from the database that match the given condition.
 * @param {Database} db - The database to query
 * @param {string} condition - The condition to filter flashcards by
 * @returns {Array<FlashcardRow>} The array of matching flashcards
 * @throws {Error} If the database is unreachable
 */
function getFlashcardsByCondition(db, condition) {
    try {
        db.prepare("SELECT 1").get();
    }
    catch (err) {
        throw new Error("Database unreachable");
    }
    return db
        .prepare(`SELECT * FROM flashcards WHERE ${condition}`)
        .all();
}
/**
 * Retrieves an array of practice records from the database that match the given condition.
 * @param {Database} db - The database to query
 * @param {string} condition - The condition to filter practice records by
 * @returns {Array<PracticeRecordRow>} The array of matching practice records
 * @throws {Error} If the database is unreachable
 */
function getPracticerecordsByCondition(db, condition) {
    try {
        db.prepare("SELECT 1").get();
    }
    catch (err) {
        throw new Error("Database unreachable");
    }
    return db
        .prepare(`SELECT * FROM practicerecords WHERE ${condition}`)
        .all();
}
/**
 * Adds a new flashcard to the database.
 * @param {Database} db - The database to use
 * @param {Flashcard} flashcard - The flashcard to add
 * @throws {Error} If the database is unreachable
 */
function addFlashcard(db, flashcard) {
    try {
        db.prepare("SELECT 1").get();
    }
    catch (err) {
        throw new Error("Database unreachable");
    }
    const tags = flashcard.tags.length > 0 ? flashcard.tags.join(",") : null;
    db.prepare(`INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES (?, ?, ?, ?, ?)`).run(flashcard.front, flashcard.back, flashcard.hint, tags, 0);
}
/**
 * Adds a new practice record to the database.
 * @param {Database} db - The database to use
 * @param {PracticeRecord} practiceRecord - The practice record to add
 * @param {number} flashcardID - The id of the flashcard this practice record is associated with
 * @throws {Error} If the database is unreachable or if either the flashcard id or timestamp is invalid
 */
function addPracticeRecord(db, practiceRecord, flashcardID) {
    try {
        db.prepare("SELECT 1").get();
    }
    catch (err) {
        throw new Error("Database unreachable");
    }
    if (flashcardID < 1) {
        throw new Error("Invalid flashcard id");
    }
    if (practiceRecord.timestamp < 0) {
        throw new Error("Invalid timestamp");
    }
    db.prepare(`INSERT INTO practicerecords (id, timestamp, difficulty, oldday, newday) VALUES (?, ?, ?, ?, ?)`).run(flashcardID, practiceRecord.timestamp, practiceRecord.difficulty, practiceRecord.previousBucket, practiceRecord.newBucket);
}
function updateDay(db, id, day) {
    try {
        db.prepare("SELECT 1").get();
    }
    catch (err) {
        throw new Error("Database unreachable");
    }
    if (id < 1) {
        throw new Error("Invalid flashcard id");
    }
    if (day < 0) {
        throw new Error("Invalid day");
    }
    let flashcardRow = {
        id: 0,
        front: "",
        back: "",
        hint: "",
        tags: "",
        scheduledDay: 0,
    };
    // Retrieve flashcard
    const flashcardRows = getFlashcardsByCondition(db, `id = ${id}`);
    // If no flashcard is found, throw an error
    if (flashcardRows.length === 0) {
        throw new Error(`Flashcard with id ${id} does not exist`);
    }
    db.prepare(`UPDATE flashcards SET scheduledDay = ? WHERE id = ?`).run(day, id);
}
