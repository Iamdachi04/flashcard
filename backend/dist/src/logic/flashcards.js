"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerDifficulty = exports.Flashcard = void 0;
class Flashcard {
    constructor(front, back, hint, tags = []) {
        this.front = front;
        this.back = back;
        this.hint = hint;
        this.tags = tags;
    }
}
exports.Flashcard = Flashcard;
var AnswerDifficulty;
(function (AnswerDifficulty) {
    AnswerDifficulty[AnswerDifficulty["Wrong"] = 0] = "Wrong";
    AnswerDifficulty[AnswerDifficulty["Hard"] = 1] = "Hard";
    AnswerDifficulty[AnswerDifficulty["Easy"] = 2] = "Easy";
})(AnswerDifficulty || (exports.AnswerDifficulty = AnswerDifficulty = {}));
