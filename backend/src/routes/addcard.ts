import { Request, Response } from 'express';
import Database from 'better-sqlite3';

/**
 * Handler to add a new flashcard to the database.
 * This endpoint expects front and back text, and optionally hint and tags.
 */
const addCard = (req: Request, res: Response): void => {
  try {
    // Connect to the SQLite database stored in a file called 'flashcards.db'
    const db = new Database('./flashcards.db');

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
};

export default addCard;
