"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerDifficulty = exports.PracticeRecord = void 0;
class PracticeRecord {
    constructor(cardFront, cardBack, timestamp, difficulty, previousBucket, newBucket) {
        this.cardFront = cardFront;
        this.cardBack = cardBack;
        this.timestamp = timestamp;
        this.difficulty = difficulty;
        this.previousBucket = previousBucket;
        this.newBucket = newBucket;
    }
}
exports.PracticeRecord = PracticeRecord;
var AnswerDifficulty;
(function (AnswerDifficulty) {
    AnswerDifficulty[AnswerDifficulty["Wrong"] = 0] = "Wrong";
    AnswerDifficulty[AnswerDifficulty["Hard"] = 1] = "Hard";
    AnswerDifficulty[AnswerDifficulty["Easy"] = 2] = "Easy";
})(AnswerDifficulty || (exports.AnswerDifficulty = AnswerDifficulty = {}));
