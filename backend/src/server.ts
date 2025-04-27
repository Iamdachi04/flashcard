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

// Execute a query to create the tables
utils.createTables(db);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---

// GET /api/practice - Get cards to practice for the current day
app.get("/api/practice", (req: Request, res: Response) => {
  try {
    const currentDayString = req.query.day as string;
    const currentDay = parseInt(currentDayString);
    // Get highest day flashcards
    const maxDayRows = utils.getFlashcardsByCondition(
      db,
      "scheduledDay = ( SELECT MAX(scheduledDay) FROM flashcards)"
    );
    // Get max possible day
    const maxDay = maxDayRows[0]?.scheduledDay ?? 0;
    const bucketsMap: Map<number, Set<Flashcard>> = new Map();

    // Create Bucketmap
    for (let i = 0; i <= maxDay; i++) {
      const dayRows = utils.getFlashcardsByCondition(db, `scheduledDay = ${i}`);
      const bucketSet = new Set<Flashcard>(
        dayRows.map((row) => utils.parseFlashcard(row))
      );
      bucketsMap.set(i, bucketSet);
    }

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

// GET /api/hint - Get a hint for a card
app.get("/api/hint", (req: Request, res: Response) => {
  try {
    const cardFrontQuery = req.query.cardFront;
    const cardBackQuery = req.query.cardBack;

    // Validate query parameters
    const cardFrontIsValid = typeof cardFrontQuery === "string";
    const cardBackIsValid = typeof cardBackQuery === "string";

    if (!cardFrontIsValid || !cardBackIsValid) {
      res.status(400).json({
        message:
          "Both 'cardFront' and 'cardBack' query parameters are required and must be strings.",
      });
      return;
    }

    const cardFront = cardFrontQuery as string;
    const cardBack = cardBackQuery as string;

    const targetCard = state.findCard(cardFront, cardBack);
    if (!targetCard) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    // Use getHint function
    const hintText = logic.getHint(targetCard);

    console.log(`Hint requested for card "${targetCard.front}".`);
    res.json({ hint: hintText });
  } catch (error) {
    console.error("Error getting hint:", error);
    res.status(500).json({ message: "Error getting hint" });
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

// POST /api/day/next - Advance the simulation day
app.post("/api/day/next", (req: Request, res: Response) => {
  state.incrementDay();
  const newDay = state.getCurrentDay();

  console.log(`Simulation day advanced. Current Day is now ${newDay}`);
  res.status(200).json({
    message: `Advanced simulation to day ${newDay}`,
    currentDay: newDay,
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`Initial Current Day: ${state.getCurrentDay()}`);
});
