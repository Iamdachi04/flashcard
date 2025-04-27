/// <reference types="node" />
import assert from "assert";
import {
  parseFlashcard,
  parsePracticeRecord,
  createTables,
  getFlashcardsByCondition,
  getPracticerecordsByCondition,
  addFlashcard,
  addPracticeRecord,
  updateDay,
} from "../src/utils/database";
import { Flashcard } from "../src/logic/flashcards";
import { PracticeRecord } from "../src/logic/practiceRecord";
import { PracticeRecordRow, FlashcardRow } from "../src/types";
import Database from "better-sqlite3";
import { get } from "http";

/*
 * Testing strategy for parseFlashcard ():
 *
 * Cover partitions:
 *    Null flashcard
 *    Non-null flashcard:
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

/**
 *
 * Testign strategy for parsePracticeRecord():
 *
 * Cover Partitions:
 *    Database unreachable
 *    Null practice record
 *    Invalid flashcard id
 *
 */
describe("parsePracticeRecord", () => {
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

  it("Covers database unreachable", () => {
    const invalidDb: any = {};
    const practiceRecordRow: any = {
      id: 1,
      timestamp: 1,
      difficulty: 1,
      oldday: 1,
      newday: 1,
    };
    assert.throws(
      () => parsePracticeRecord(practiceRecordRow, invalidDb),
      Error,
      "Database unreachable"
    );
  });

  it("Covers null practice record", () => {
    assert.throws(
      () => parsePracticeRecord(null as any, db),
      Error,
      "Null practice record cannot be parsed"
    );
  });

  it("Covers invalid flashcard id", () => {
    const practiceRecordRow: any = {
      id: 5,
      timestamp: 1,
      difficulty: 1,
      oldday: 1,
      newday: 1,
    };
    assert.throws(
      () => parsePracticeRecord(practiceRecordRow, db),
      Error,
      "Error retrieving flashcard for this record with id 5"
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
        `INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES ('front1', 'back1', 'hint1', 'tags1', 0), ('front2', 'back2', 'hint2', 'tags2', 1), ('front3', 'back3', 'hint3', 'tags3', 2);`
      );
      done();
    }, 100);
  });

  it("Covers database unreachable", () => {
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
 * Testing strategy for getPracticerecordsByCondition():
 *
 * Cover partitions:
 *    Database unreachable
 *    Database reachable:
 *        No flashcards
 *        One flashcard
 *        Multiple flashcards
 *        Invalid condition
 */
describe("getPracticerecordsByCondition()", () => {
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

  it("Covers database unreachable", () => {
    const invalidDb: any = { jj: 8 };
    assert.throws(
      () => getPracticerecordsByCondition(invalidDb, "id = 1"),
      Error,
      "Database unreachable"
    );
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

/*
 * Testing strategy for addFlashcard():
 *
 * Cover partitions:
 *    Database unreachable
 *    Database reachable:
 *        Valid flashcard without hints
 *        Valid flashcard without tags
 *        Full valid flashcard
 *
 */
describe("addFlashcard", () => {
  let db: Database.Database;

  beforeEach(function (done) {
    setTimeout(() => {
      db = new Database();
      createTables(db);
      done();
    }, 100);
  });

  it("Covers database unreachable", () => {
    const invalidDb: any = {};
    let flashcard: Flashcard = new Flashcard("front1", "back1", undefined, [
      "hint",
    ]);
    assert.throws(
      () => addFlashcard(invalidDb, flashcard),
      Error,
      "Database unreachable"
    );
  });

  it("Covers valid flashcard without hints", () => {
    let flashcard: Flashcard = new Flashcard("front1", "back1", undefined, [
      "hint",
    ]);
    addFlashcard(db, flashcard);
    assert.deepEqual(
      parseFlashcard(getFlashcardsByCondition(db, "front = 'front1'")[0]),
      flashcard
    );
  });

  it("Covers valid flashcard without tags", () => {
    let flashcard: Flashcard = new Flashcard("front1", "back1", "hint1", []);
    addFlashcard(db, flashcard);
    assert.deepEqual(
      parseFlashcard(getFlashcardsByCondition(db, "front = 'front1'")[0]),
      flashcard
    );
  });

  it("Covers full valid flashcard", () => {
    let flashcard: Flashcard = new Flashcard("front1", "back1", "hint1", [
      "tag1",
      "tag2",
    ]);
    addFlashcard(db, flashcard);
    assert.deepEqual(
      parseFlashcard(getFlashcardsByCondition(db, "front = 'front1'")[0]),
      flashcard
    );
  });
});

/*
 * Testing strategy for addPracticeRecord():
 *
 * Cover partitions:
 *    Database unreachable
 *    Database reachable:
 *        PracticeRecord with valid key
 *        PracticeRecord with invalid timestamp
 *        PractiecRecord with invalid id
 *        Duplicate practiceRecord
 *
 *
 */
describe("addPracticeRecord", () => {
  let db: Database.Database;

  beforeEach((done) => {
    setTimeout(() => {
      db = new Database();
      createTables(db);
      done();
    }, 100);
  });

  it("Covers database unreachable", () => {
    const invalidDb: any = { jj: 8 };
    const practiceRecord: PracticeRecord = new PracticeRecord(
      "",
      "",
      0,
      0,
      0,
      0
    );
    assert.throws(
      () => addPracticeRecord(invalidDb, practiceRecord, 1),
      Error,
      "Database unreachable"
    );
  });

  it("Covers practiceRecord with invalid id", () => {
    assert.throws(
      () => addPracticeRecord(db, new PracticeRecord("", "", 0, 0, 0, 0), 0),
      Error,
      "Invalid flashcard id"
    );
  });

  it("Covers practiceRecord with invalid timestamp", () => {
    assert.throws(
      () => addPracticeRecord(db, new PracticeRecord("", "", 0, 0, 0, 1), 1),
      Error,
      "Invalid timestamp"
    );
  });

  it("Covers duplicate practiceRecord", () => {
    const flashcard = new Flashcard("front1", "back1", "hint1", []);
    addFlashcard(db, flashcard);
    addPracticeRecord(db, new PracticeRecord("", "", 0, 0, 0, 1), 1);
    assert.throws(
      () => addPracticeRecord(db, new PracticeRecord("", "", 0, 0, 0, 1), 1),
      Error
    );
  });
});

/*
 * Testing strategy for updateDay():
 *
 * Cover partitions:
 *    Database unreachable
 *    Database reachable:
 *        Invalid Flashcard Id
 *        Invalid day
 *        NonExistent flashcard
 *
 */
describe("updateDay", () => {
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

  it("Covers database unreachable", () => {
    const invalidDb: any = { jj: 8 };
    assert.throws(
      () => updateDay(invalidDb, 1, 1),
      Error,
      "Database unreachable"
    );
  });

  it("Covers invalid flashcard id", () => {
    assert.throws(() => updateDay(db, 0, 1), Error, "Invalid flashcard id");
  });

  it("Covers invalid day", () => {
    assert.throws(() => updateDay(db, 1, -1), Error, "Invalid day");
  });

  it("Covers non-existent flashcard", () => {
    assert.throws(
      () => updateDay(db, 10, 10),
      Error,
      "Flashcard with id 10 does not exist"
    );
  });
});
