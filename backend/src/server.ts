import express, { Request, Response, } from "express";
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

/**
 * Handler to add a new flashcard to the database.
 * This endpoint expects front and back text, and optionally hint and tags.
 */
app.post("/api/addcard", (req: Request, res: Response): void => {
  try {
    // Extract data from the request body
    const { front, back, hint, tags } = req.body;

    // Ensure the front side of the flashcard is provided and is not empty/whitespace
    if (!front?.trim()) {
      res.status(400).json({ error: 'Front side of the card is required' });
      return;
    }

    // Ensure the back side of the flashcard is provided and is not empty/whitespace
    if (!back?.trim()) {
      res.status(400).json({ error: 'Back side of the card is required' });
      return;
    }

    // Trim optional fields (hint and tags) to remove extra whitespace if they exist
    const cardTags = tags?.trim?.() || '';  // If tags are missing, default to empty string
    const cardHint = hint?.trim?.() || '';  // If hint is missing, default to empty string

    // Prepare an SQL INSERT statement to add the new flashcard into the database
    // `scheduledDay` is initialized to 0 (e.g., ready to be reviewed immediately)
    const stmt = db.prepare(
      'INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES (?, ?, ?, ?, 0)'
    );

    // Run the statement with the cleaned-up input values
    const result = stmt.run(front.trim(), back.trim(), cardHint, cardTags);

    // Respond to the client with success and the ID of the newly created card
    res.status(201).json({
      success: true,
      message: 'Card added successfully',
      cardId: result.lastInsertRowid
    });

  } catch (error) {
    // Log the error for server-side debugging
    console.error('Error adding card:', error);

    // Respond with a generic 500 error if something goes wrong (e.g., DB issues)
    res.status(500).json({ error: 'Failed to add card' });
  }
});

/**
 * Handler to update a flashcard's practice record and reschedule it
 * based on the difficulty of the user's response.
 */
app.post("/api/updatepractice", (req: Request, res: Response): void => {
  try {
    // Extract cardId and difficulty from the request body
    const { cardId, difficulty } = req.body;
    
    // Get the practice day from the query parameters
    const practiceDay = Number(req.query.day);
    
    if (isNaN(practiceDay)) {
      res.status(400).json({ error: 'Valid practice day is required in query parameters' });
      return;
    }

    // Validate that a card ID was provided
    if (!cardId) {
      res.status(400).json({ error: 'Card ID is required' });
      return;
    }

    // Validate that difficulty has a valid value
    if (difficulty === undefined) {
      res.status(400).json({ error: 'Difficulty value is required' });
      return;
    }

    // Get the current scheduled day for the card
    const oldDay = utils.getCardScheduledDay(db, cardId);
    
    // If the card doesn't exist, the utility would return undefined or throw an error
    if (oldDay === undefined) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    let newDay;
    
    // Apply the correct difficulty logic as specified by Person 1
    if (difficulty === 'easy') {
      // Increment the day/bucket by 1 for easy cards
      newDay = oldDay + 1;
    } else if (difficulty === 'hard') {
      // Decrement the day/bucket by 1 for hard cards (but never below 0)
      newDay = Math.max(0, oldDay - 1);
    } else if (difficulty === 'wrong') {
      // Reset to day/bucket 0 for wrong cards
      newDay = 0;
    } else {
      res.status(400).json({ error: 'Difficulty must be "easy", "hard", or "wrong"' });
      return;
    }

    // Use the utility function to update the card's day
    utils.updateDay(db, cardId, newDay);
    
    // Insert a practice record with the correct day information
    // Note: Using timestamp field to store the practice day as per Person 1's comment
    const insertRecordStmt = db.prepare(
      'INSERT INTO practicerecords (id, timestamp, difficulty, oldday, newday) VALUES (?, ?, ?, ?, ?)'
    );
    insertRecordStmt.run(cardId, practiceDay, difficulty, oldDay, newDay);

    // Return a success response including the updated schedule info
    res.status(200).json({
      success: true,
      message: 'Practice record updated successfully',
      oldDay,
      newDay
    });

  } catch (error) {
    // Log the error for debugging
    console.error('Error updating practice record:', error);

    // Respond with a generic server error message
    res.status(500).json({ error: 'Failed to update practice record' });
  }
});

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

// GET /api/progress - Get learning progress statistics
app.get("/api/progress", (req: Request, res: Response) => {
  try {
    const currentBuckets = state.getBuckets(db);
    const completeHistory = state.getHistory(db);

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