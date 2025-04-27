/// <reference types="node" />
import assert from "assert";
import {
  parseFlashcard,
  createTables,
  getFlashcardsByCondition,
  getPracticerecordsByCondition,
} from "../src/utils/database";
import { Flashcard } from "../src/logic/flashcards";
import { PracticeRecordRow, FlashcardRow } from "../src/types";
import Database from "better-sqlite3";
import { get } from "http";

/*
 * Testing strategy for parseFlashcard ():
 *
 * Cover partitions:
 *    Null flashcard
 *    Non-null flashcard:
 *        Font missing
 *        Back missing
 *        Hint missing
 *        Tags missing
 *
 */
describe("parseFlashcard", () => {
  it("Covers null fashcard", () => {
    assert.throws(
      () => parseFlashcard(null as any),
      Error,
      "Null fashcard cannot be parsed"
    );
  });

  it("Covers non-null fashcard X Front missing", () => {
    assert.throws(
      () =>
        parseFlashcard({
          front: null,
          back: "back",
          hint: "hint",
          tags: "tags",
          scheduledDay: 0,
        } as any),
      Error,
      "Flashcard must have a front and back"
    );
  });
  it("Covers non-null fashcard X Back missing", () => {
    assert.throws(
      () =>
        parseFlashcard({
          front: "front",
          back: null,
          hint: "hint",
          tags: "tags",
          scheduledDay: 0,
        } as any),
      Error,
      "Flashcard must have a front and back"
    );
  });
  it("Covers non-null fashcard X Hint missing", () => {
    let flashcard: Flashcard = new Flashcard("front", "back", undefined, [
      "tags",
    ]);
    let row: FlashcardRow = {
      id: 0,
      front: "front",
      back: "back",
      hint: null,
      tags: "tags",
      scheduledDay: 0,
    };
    assert.deepStrictEqual(parseFlashcard(row), flashcard);
  });
  it("Covers non-null fashcard X Tags missing", () => {
    let flashcard: Flashcard = new Flashcard("front", "back", "hint", []);
    let row: FlashcardRow = {
      id: 0,
      front: "front",
      back: "back",
      hint: "hint",
      tags: null,
      scheduledDay: 0,
    };
    assert.deepStrictEqual(parseFlashcard(row), flashcard);
  });
});

/*
 * Testing strategy for getFlashcardsByCondition():
 *
 * Cover partitions:
 *    Database unreachable
 *    Database reachable:
 *        No flashcards
 *        One flashcard
 *        Multiple flashcards
 *        Invalid condition
 */
describe("getFlashcardsByCondition", () => {
  let db: Database.Database;

  before(function (done) {
    setTimeout(() => {
      db = new Database();
      createTables(db);
      db.exec(
        `INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES ('front1', 'back1', 'hint1', 'tags1', 0), ('front2', 'back2', 'hint2', 'tags2', 1), ('front3', 'back3', 'hint3', 'tags3', 2);`
      );
      done();
    }, 100);
  });

  it("Covers invalid database", () => {
    const invalidDb: any = { jj: 8 };
    assert.throws(
      () => getFlashcardsByCondition(invalidDb, "id = 1"),
      Error,
      "Database unreachable"
    );
  });

  it("Covers no flashcards", () => {
    assert.deepEqual(getFlashcardsByCondition(db, "id > 5"), []);
  });
  it("Covers one flashcard", () => {
    let flashcardRow: FlashcardRow = {
      id: 1,
      front: "front1",
      back: "back1",
      hint: "hint1",
      tags: "tags1",
      scheduledDay: 0,
    };
    let result: FlashcardRow[] = [flashcardRow];
    assert.deepEqual(getFlashcardsByCondition(db, "id = 1"), result);
  });

  it("Covers multiple flashcards", () => {
    let flashcardRow1: FlashcardRow = {
      id: 1,
      front: "front1",
      back: "back1",
      hint: "hint1",
      tags: "tags1",
      scheduledDay: 0,
    };
    let flashcardRow2: FlashcardRow = {
      id: 2,
      front: "front2",
      back: "back2",
      hint: "hint2",
      tags: "tags2",
      scheduledDay: 1,
    };
    let flashcardRow3: FlashcardRow = {
      id: 3,
      front: "front3",
      back: "back3",
      hint: "hint3",
      tags: "tags3",
      scheduledDay: 2,
    };
    let result: FlashcardRow[] = [flashcardRow1, flashcardRow2, flashcardRow3];
    assert.deepEqual(getFlashcardsByCondition(db, "id > 0"), result);
  });

  it("Covers invalid condition", () => {
    assert.throws(
      () => getFlashcardsByCondition(db, "id_value > 'invalidValue'"),
      Error
    );
  });
});

/*
 * Testing strategy for getFlashcardsByCondition():
 *
 * Cover partitions:
 *    Database unreachable
 *    Database reachable:
 *        No flashcards
 *        One flashcard
 *        Multiple flashcards
 *        Invalid condition
 */
describe("getFlashcardsByCondition", () => {
  let db: Database.Database;

  before(function (done) {
    setTimeout(() => {
      db = new Database();
      createTables(db);
      db.exec(
        `INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES ('front1', 'back1', 'hint1', 'tags1', 0), ('front2', 'back2', 'hint2', 'tags2', 1), ('front3', 'back3', 'hint3', 'tags3', 2);
         INSERT INTO practicerecords (id, timestamp, difficulty, oldday, newday) VALUES  (1, 1, 1, 1, 1), (2, 2, 2, 2, 2), (3, 3, 3, 3, 3);`
      );
      done();
    }, 100);
  });

  it("Covers no flashcards", () => {
    assert.deepEqual(getPracticerecordsByCondition(db, "id > 5"), []);
  });
  it("Covers one flashcard", () => {
    let practiceRecordRow: PracticeRecordRow = {
      id: 1,
      timestamp: 1,
      difficulty: 1,
      oldday: 1,
      newday: 1,
    };
    let result: PracticeRecordRow[] = [practiceRecordRow];
    assert.deepEqual(getPracticerecordsByCondition(db, "id = 1"), result);
  });

  it("Covers multiple flashcards", () => {
    let practiceRecordRow1: PracticeRecordRow = {
      id: 1,
      timestamp: 1,
      difficulty: 1,
      oldday: 1,
      newday: 1,
    };
    let practiceRecordRow2: PracticeRecordRow = {
      id: 2,
      timestamp: 2,
      difficulty: 2,
      oldday: 2,
      newday: 2,
    };
    let practiceRecordRow3: PracticeRecordRow = {
      id: 3,
      timestamp: 3,
      difficulty: 3,
      oldday: 3,
      newday: 3,
    };
    let result: PracticeRecordRow[] = [
      practiceRecordRow1,
      practiceRecordRow2,
      practiceRecordRow3,
    ];
    assert.deepEqual(getPracticerecordsByCondition(db, "id > 0"), result);
  });

  it("Covers invalid condition", () => {
    assert.throws(
      () => getPracticerecordsByCondition(db, "id_value > 'invalidValue'"),
      Error
    );
  });
});
