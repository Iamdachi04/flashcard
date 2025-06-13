"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node" />
const assert_1 = __importDefault(require("assert"));
const database_1 = require("../src/utils/database");
const flashcards_1 = require("../src/logic/flashcards");
const practiceRecord_1 = require("../src/logic/practiceRecord");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
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
        assert_1.default.throws(() => (0, database_1.parseFlashcard)(null), Error, "Null fashcard cannot be parsed");
    });
    it("Covers non-null fashcard X Hint missing", () => {
        let flashcard = new flashcards_1.Flashcard("front", "back", undefined, [
            "tags",
        ]);
        let row = {
            id: 0,
            front: "front",
            back: "back",
            hint: null,
            tags: "tags",
            scheduledDay: 0,
        };
        assert_1.default.deepStrictEqual((0, database_1.parseFlashcard)(row), flashcard);
    });
    it("Covers non-null fashcard X Tags missing", () => {
        let flashcard = new flashcards_1.Flashcard("front", "back", "hint", []);
        let row = {
            id: 0,
            front: "front",
            back: "back",
            hint: "hint",
            tags: null,
            scheduledDay: 0,
        };
        assert_1.default.deepStrictEqual((0, database_1.parseFlashcard)(row), flashcard);
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
    let db;
    before(function (done) {
        setTimeout(() => {
            db = new better_sqlite3_1.default();
            (0, database_1.createTables)(db);
            db.exec(`INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES ('front1', 'back1', 'hint1', 'tags1', 0), ('front2', 'back2', 'hint2', 'tags2', 1), ('front3', 'back3', 'hint3', 'tags3', 2);`);
            done();
        }, 100);
    });
    it("Covers database unreachable", () => {
        const invalidDb = {};
        const practiceRecordRow = {
            id: 1,
            timestamp: 1,
            difficulty: 1,
            oldday: 1,
            newday: 1,
        };
        assert_1.default.throws(() => (0, database_1.parsePracticeRecord)(practiceRecordRow, invalidDb), Error, "Database unreachable");
    });
    it("Covers null practice record", () => {
        assert_1.default.throws(() => (0, database_1.parsePracticeRecord)(null, db), Error, "Null practice record cannot be parsed");
    });
    it("Covers invalid flashcard id", () => {
        const practiceRecordRow = {
            id: 5,
            timestamp: 1,
            difficulty: 1,
            oldday: 1,
            newday: 1,
        };
        assert_1.default.throws(() => (0, database_1.parsePracticeRecord)(practiceRecordRow, db), Error, "Error retrieving flashcard for this record with id 5");
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
    let db;
    before(function (done) {
        setTimeout(() => {
            db = new better_sqlite3_1.default();
            (0, database_1.createTables)(db);
            db.exec(`INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES ('front1', 'back1', 'hint1', 'tags1', 0), ('front2', 'back2', 'hint2', 'tags2', 1), ('front3', 'back3', 'hint3', 'tags3', 2);`);
            done();
        }, 100);
    });
    it("Covers database unreachable", () => {
        const invalidDb = { jj: 8 };
        assert_1.default.throws(() => (0, database_1.getFlashcardsByCondition)(invalidDb, "id = 1"), Error, "Database unreachable");
    });
    it("Covers no flashcards", () => {
        assert_1.default.deepEqual((0, database_1.getFlashcardsByCondition)(db, "id > 5"), []);
    });
    it("Covers one flashcard", () => {
        let flashcardRow = {
            id: 1,
            front: "front1",
            back: "back1",
            hint: "hint1",
            tags: "tags1",
            scheduledDay: 0,
        };
        let result = [flashcardRow];
        assert_1.default.deepEqual((0, database_1.getFlashcardsByCondition)(db, "id = 1"), result);
    });
    it("Covers multiple flashcards", () => {
        let flashcardRow1 = {
            id: 1,
            front: "front1",
            back: "back1",
            hint: "hint1",
            tags: "tags1",
            scheduledDay: 0,
        };
        let flashcardRow2 = {
            id: 2,
            front: "front2",
            back: "back2",
            hint: "hint2",
            tags: "tags2",
            scheduledDay: 1,
        };
        let flashcardRow3 = {
            id: 3,
            front: "front3",
            back: "back3",
            hint: "hint3",
            tags: "tags3",
            scheduledDay: 2,
        };
        let result = [flashcardRow1, flashcardRow2, flashcardRow3];
        assert_1.default.deepEqual((0, database_1.getFlashcardsByCondition)(db, "id > 0"), result);
    });
    it("Covers invalid condition", () => {
        assert_1.default.throws(() => (0, database_1.getFlashcardsByCondition)(db, "id_value > 'invalidValue'"), Error);
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
    let db;
    before(function (done) {
        setTimeout(() => {
            db = new better_sqlite3_1.default();
            (0, database_1.createTables)(db);
            db.exec(`INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES ('front1', 'back1', 'hint1', 'tags1', 0), ('front2', 'back2', 'hint2', 'tags2', 1), ('front3', 'back3', 'hint3', 'tags3', 2);
         INSERT INTO practicerecords (id, timestamp, difficulty, oldday, newday) VALUES  (1, 1, 1, 1, 1), (2, 2, 2, 2, 2), (3, 3, 3, 3, 3);`);
            done();
        }, 100);
    });
    it("Covers database unreachable", () => {
        const invalidDb = { jj: 8 };
        assert_1.default.throws(() => (0, database_1.getPracticerecordsByCondition)(invalidDb, "id = 1"), Error, "Database unreachable");
    });
    it("Covers no flashcards", () => {
        assert_1.default.deepEqual((0, database_1.getPracticerecordsByCondition)(db, "id > 5"), []);
    });
    it("Covers one flashcard", () => {
        let practiceRecordRow = {
            id: 1,
            timestamp: 1,
            difficulty: 1,
            oldday: 1,
            newday: 1,
        };
        let result = [practiceRecordRow];
        assert_1.default.deepEqual((0, database_1.getPracticerecordsByCondition)(db, "id = 1"), result);
    });
    it("Covers multiple flashcards", () => {
        let practiceRecordRow1 = {
            id: 1,
            timestamp: 1,
            difficulty: 1,
            oldday: 1,
            newday: 1,
        };
        let practiceRecordRow2 = {
            id: 2,
            timestamp: 2,
            difficulty: 2,
            oldday: 2,
            newday: 2,
        };
        let practiceRecordRow3 = {
            id: 3,
            timestamp: 3,
            difficulty: 3,
            oldday: 3,
            newday: 3,
        };
        let result = [
            practiceRecordRow1,
            practiceRecordRow2,
            practiceRecordRow3,
        ];
        assert_1.default.deepEqual((0, database_1.getPracticerecordsByCondition)(db, "id > 0"), result);
    });
    it("Covers invalid condition", () => {
        assert_1.default.throws(() => (0, database_1.getPracticerecordsByCondition)(db, "id_value > 'invalidValue'"), Error);
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
    let db;
    beforeEach(function (done) {
        setTimeout(() => {
            db = new better_sqlite3_1.default();
            (0, database_1.createTables)(db);
            done();
        }, 100);
    });
    it("Covers database unreachable", () => {
        const invalidDb = {};
        let flashcard = new flashcards_1.Flashcard("front1", "back1", undefined, [
            "hint",
        ]);
        assert_1.default.throws(() => (0, database_1.addFlashcard)(invalidDb, flashcard), Error, "Database unreachable");
    });
    it("Covers valid flashcard without hints", () => {
        let flashcard = new flashcards_1.Flashcard("front1", "back1", undefined, [
            "hint",
        ]);
        (0, database_1.addFlashcard)(db, flashcard);
        assert_1.default.deepEqual((0, database_1.parseFlashcard)((0, database_1.getFlashcardsByCondition)(db, "front = 'front1'")[0]), flashcard);
    });
    it("Covers valid flashcard without tags", () => {
        let flashcard = new flashcards_1.Flashcard("front1", "back1", "hint1", []);
        (0, database_1.addFlashcard)(db, flashcard);
        assert_1.default.deepEqual((0, database_1.parseFlashcard)((0, database_1.getFlashcardsByCondition)(db, "front = 'front1'")[0]), flashcard);
    });
    it("Covers full valid flashcard", () => {
        let flashcard = new flashcards_1.Flashcard("front1", "back1", "hint1", [
            "tag1",
            "tag2",
        ]);
        (0, database_1.addFlashcard)(db, flashcard);
        assert_1.default.deepEqual((0, database_1.parseFlashcard)((0, database_1.getFlashcardsByCondition)(db, "front = 'front1'")[0]), flashcard);
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
    let db;
    beforeEach((done) => {
        setTimeout(() => {
            db = new better_sqlite3_1.default();
            (0, database_1.createTables)(db);
            done();
        }, 100);
    });
    it("Covers database unreachable", () => {
        const invalidDb = { jj: 8 };
        const practiceRecord = new practiceRecord_1.PracticeRecord("", "", 0, 0, 0, 0);
        assert_1.default.throws(() => (0, database_1.addPracticeRecord)(invalidDb, practiceRecord, 1), Error, "Database unreachable");
    });
    it("Covers practiceRecord with invalid id", () => {
        assert_1.default.throws(() => (0, database_1.addPracticeRecord)(db, new practiceRecord_1.PracticeRecord("", "", 0, 0, 0, 0), 0), Error, "Invalid flashcard id");
    });
    it("Covers practiceRecord with invalid timestamp", () => {
        assert_1.default.throws(() => (0, database_1.addPracticeRecord)(db, new practiceRecord_1.PracticeRecord("", "", 0, 0, 0, 1), 1), Error, "Invalid timestamp");
    });
    it("Covers duplicate practiceRecord", () => {
        const flashcard = new flashcards_1.Flashcard("front1", "back1", "hint1", []);
        (0, database_1.addFlashcard)(db, flashcard);
        (0, database_1.addPracticeRecord)(db, new practiceRecord_1.PracticeRecord("", "", 0, 0, 0, 1), 1);
        assert_1.default.throws(() => (0, database_1.addPracticeRecord)(db, new practiceRecord_1.PracticeRecord("", "", 0, 0, 0, 1), 1), Error);
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
    let db;
    before(function (done) {
        setTimeout(() => {
            db = new better_sqlite3_1.default();
            (0, database_1.createTables)(db);
            db.exec(`INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES ('front1', 'back1', 'hint1', 'tags1', 0), ('front2', 'back2', 'hint2', 'tags2', 1), ('front3', 'back3', 'hint3', 'tags3', 2);`);
            done();
        }, 100);
    });
    it("Covers database unreachable", () => {
        const invalidDb = { jj: 8 };
        assert_1.default.throws(() => (0, database_1.updateDay)(invalidDb, 1, 1), Error, "Database unreachable");
    });
    it("Covers invalid flashcard id", () => {
        assert_1.default.throws(() => (0, database_1.updateDay)(db, 0, 1), Error, "Invalid flashcard id");
    });
    it("Covers invalid day", () => {
        assert_1.default.throws(() => (0, database_1.updateDay)(db, 1, -1), Error, "Invalid day");
    });
    it("Covers non-existent flashcard", () => {
        assert_1.default.throws(() => (0, database_1.updateDay)(db, 10, 10), Error, "Flashcard with id 10 does not exist");
    });
});
