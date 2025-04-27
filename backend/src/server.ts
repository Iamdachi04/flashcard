import express, { Request, Response } from "express";
import cors from "cors";
import * as logic from "./logic/algorithm";
import { Flashcard, AnswerDifficulty } from "./logic/flashcards";
import * as state from "./state";
import { UpdateRequest, ProgressStats, PracticeRecord } from "./types";
import Database from "better-sqlite3";
import * as utils from "./utils/database";
import { parse } from "path";

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database ---
const db = new Database(":memory:");

// Execute queries to create the tables and populate them
utils.createTables(db);
state.initializeState(db);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
// GET /api/practice - Get cards to practice for the current day
app.get("/api/practice", (req: Request, res: Response) => {
  try {
    const currentDayString = req.query.day as string;
    const currentDay = parseInt(currentDayString);
    const bucketsMap = state.getBuckets(db);

    // Convert Map to Array<Set> for the practice function
    const bucketSetsArray = logic.toBucketSets(bucketsMap);
    const cardsToPracticeSet = logic.practice(bucketSetsArray, currentDay);

    // Convert Set to Array for JSON response
    const cardsToPracticeArray = Array.from(cardsToPracticeSet);

    console.log(
      `Day ${currentDay}: Practice ${cardsToPracticeArray.length} cards`
    );
    res.json({ cards: cardsToPracticeArray, day: currentDay });
  } catch (error) {
    console.error("Error getting practice cards:", error);
    res.status(500).json({ message: "Error fetching practice cards" });
  }
});

// POST /api/update - Update a card's bucket after practice
app.post("/api/update", (req: Request, res: Response) => {
  try {
    const updateData = req.body as UpdateRequest;
    const cardFrontFromRequest = updateData.cardFront;
    const cardBackFromRequest = updateData.cardBack;
    const difficultyFromRequest = updateData.difficulty;

    // Validate difficulty
    const validDifficulties = Object.values(AnswerDifficulty);
    const difficultyIsValid = validDifficulties.includes(difficultyFromRequest);

    if (!difficultyIsValid) {
      res.status(400).json({ message: "Invalid difficulty level provided" });
      return;
    }

    const targetCard = state.findCard(
      cardFrontFromRequest,
      cardBackFromRequest
    );
    if (!targetCard) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    const currentBuckets = state.getBuckets();
    const previousBucket = state.findCardBucket(targetCard);

    // Use update function to calculate the new bucket configuration
    const updatedBuckets = logic.update(
      currentBuckets,
      targetCard,
      difficultyFromRequest
    );

    // Update the application state with the new buckets
    state.setBuckets(updatedBuckets);

    // Determine the card's new bucket after the state update
    const newBucket = state.findCardBucket(targetCard);

    // Prepare data for history record
    const cardFrontForHistory = targetCard.front;
    const cardBackForHistory = targetCard.back;
    const timestampForHistory = Date.now();
    const difficultyForHistory = difficultyFromRequest;
    const previousBucketForHistory = previousBucket ?? -1;
    const newBucketForHistory = newBucket ?? -1;

    // Create history record object
    const historyRecord: PracticeRecord = {
      cardFront: cardFrontForHistory,
      cardBack: cardBackForHistory,
      timestamp: timestampForHistory,
      difficulty: difficultyForHistory,
      previousBucket: previousBucketForHistory,
      newBucket: newBucketForHistory,
    };

    // Add to history
    state.addHistoryRecord(historyRecord);

    console.log(
      `Updated card "${targetCard.front}" with difficulty "${AnswerDifficulty[difficultyFromRequest]}". Moved from bucket ${previousBucket} to ${newBucket}.`
    );
    res.status(200).json({ message: "Card updated successfully" });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Error updating card" });
  }
});

// GET /api/progress - Get learning progress statistics
app.get("/api/progress", (req: Request, res: Response) => {
  try {
    const currentBuckets = state.getBuckets();
    const completeHistory = state.getHistory();

    // Use computeProgress function
    const progressStats: ProgressStats = logic.computeProgress(
      currentBuckets,
      completeHistory
    );

    res.json(progressStats);
  } catch (error) {
    console.error("Error computing progress:", error);
    res.status(500).json({ message: "Error computing progress" });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Initial Current Day: 0`);
});
