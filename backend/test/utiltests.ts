/// <reference types="node" />
import assert from "assert";
import { parseFlashcard } from "../src/utils/database";
import { Flashcard } from "../src/logic/flashcards";
import { PracticeRecord, FlashcardRow } from "../src/types";

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
