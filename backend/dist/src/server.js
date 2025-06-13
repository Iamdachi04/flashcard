"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logic = __importStar(require("./logic/algorithm"));
const state = __importStar(require("./state"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const utils = __importStar(require("./utils/database"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// --- Database ---
const db = new better_sqlite3_1.default(":memory:");
// Execute queries to create the tables and populate them
utils.createTables(db);
state.initializeState(db);
// --- Middleware ---
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- API Routes ---
// GET /api/practice - Get cards to practice for the current day
app.get("/api/practice", (req, res) => {
    try {
        const currentDayString = req.query.day;
        const currentDay = parseInt(currentDayString);
        const bucketsMap = state.getBuckets(db);
        // Convert Map to Array<Set> for the practice function
        const bucketSetsArray = logic.toBucketSets(bucketsMap);
        const cardsToPracticeSet = logic.practice(bucketSetsArray, currentDay);
        // Convert Set to Array for JSON response
        const cardsToPracticeArray = Array.from(cardsToPracticeSet);
        console.log(`Day ${currentDay}: Practice ${cardsToPracticeArray.length} cards`);
        res.json({ cards: cardsToPracticeArray, day: currentDay });
    }
    catch (error) {
        console.error("Error getting practice cards:", error);
        res.status(500).json({ message: "Error fetching practice cards" });
    }
});
// // POST /api/update - Update a card's bucket after practice
// app.post("/api/update", (req: Request, res: Response) => {
//   /**
//    * TODO:
//    * Reimplement this function to accept batch updates instead of getting them one at a time
//    * Frontend will send batch updates. Backend must process them
//    * Update request will contain current day as req.query.day
//    */
//   try {
//     const updateData = req.body as UpdateRequest;
//     const cardFrontFromRequest = updateData.cardFront;
//     const cardBackFromRequest = updateData.cardBack;
//     const difficultyFromRequest = updateData.difficulty;
//     // Validate difficulty
//     const validDifficulties = Object.values(AnswerDifficulty);
//     const difficultyIsValid = validDifficulties.includes(difficultyFromRequest);
//     if (!difficultyIsValid) {
//       res.status(400).json({ message: "Invalid difficulty level provided" });
//       return;
//     }
//     const targetCard = state.findCard(
//       cardFrontFromRequest,
//       cardBackFromRequest
//     );
//     if (!targetCard) {
//       res.status(404).json({ message: "Card not found" });
//       return;
//     }
//     const currentBuckets = state.getBuckets();
//     const previousBucket = state.findCardBucket(targetCard);
//     // Use update function to calculate the new bucket configuration
//     const updatedBuckets = logic.update(
//       currentBuckets,
//       targetCard,
//       difficultyFromRequest
//     );
//     // Update the application state with the new buckets
//     state.setBuckets(updatedBuckets);
//     // Determine the card's new bucket after the state update
//     const newBucket = state.findCardBucket(targetCard);
//     // Prepare data for history record
//     const cardFrontForHistory = targetCard.front;
//     const cardBackForHistory = targetCard.back;
//     const timestampForHistory = Date.now();
//     const difficultyForHistory = difficultyFromRequest;
//     const previousBucketForHistory = previousBucket ?? -1;
//     const newBucketForHistory = newBucket ?? -1;
//     // Create history record object
//     const historyRecord: PracticeRecord = {
//       cardFront: cardFrontForHistory,
//       cardBack: cardBackForHistory,
//       timestamp: timestampForHistory,
//       difficulty: difficultyForHistory,
//       previousBucket: previousBucketForHistory,
//       newBucket: newBucketForHistory,
//     };
//     // Add to history
//     state.addHistoryRecord(historyRecord);
//     console.log(
//       `Updated card "${targetCard.front}" with difficulty "${AnswerDifficulty[difficultyFromRequest]}". Moved from bucket ${previousBucket} to ${newBucket}.`
//     );
//     res.status(200).json({ message: "Card updated successfully" });
//   } catch (error) {
//     console.error("Error updating card:", error);
//     res.status(500).json({ message: "Error updating card" });
//   }
// });
// GET /api/progress - Get learning progress statistics
app.get("/api/progress", (req, res) => {
    try {
        const currentBuckets = state.getBuckets(db);
        const completeHistory = state.getHistory(db);
        // Use computeProgress function
        const progressStats = logic.computeProgress(currentBuckets, completeHistory);
        res.json(progressStats);
    }
    catch (error) {
        console.error("Error computing progress:", error);
        res.status(500).json({ message: "Error computing progress" });
    }
});
// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log(`Initial Current Day: 0`);
});
