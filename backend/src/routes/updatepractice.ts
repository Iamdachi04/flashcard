import { Request, Response } from 'express';

// Using require instead of import for better-sqlite3 to avoid ESM compatibility issues
const Database = require('better-sqlite3');
const db = new Database('./flashcards.db'); // Connecting to the local database file

export const updatePractice = (req: Request, res: Response) => {
  try {
    // Get the card ID and difficulty score from the request body
    const { cardId, difficulty } = req.body;

    // Make sure we have a card ID to work with
    if (!cardId) {
      return res.status(400).json({ error: 'Card ID is required' });
    }

    // Difficulty should be between 0-5 (0-3 means harder, 4-5 means easier)
    if (difficulty === undefined || difficulty < 0 || difficulty > 5) {
      return res.status(400).json({ error: 'Difficulty must be a number between 0 and 5' });
    }

    // First, check if the card exists
    const checkCardStmt = db.prepare('SELECT scheduledDay FROM flashcards WHERE id = ?');
    const card = checkCardStmt.get(cardId);

    // If we can't find the card, let the user know
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const oldDay = card.scheduledDay;

    // Calculate the new scheduledDay based on how difficult the user found the card
    // If difficulty is 0-3, we'll increase the interval (make it show up less often)
    // If difficulty is 4-5, we'll reset to 0 (make it show up more frequently)
    const newDay = difficulty <= 3 ? oldDay + 1 : 0;

    // Current timestamp for when this practice happened
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    // We'll use a transaction to make sure all database operations succeed or fail together
    const transaction = db.transaction(() => {
      // Add a record of this practice session to the practice_records table
      const insertRecordStmt = db.prepare(
        'INSERT INTO practicerecords (cardId, timestamp, difficulty, oldday, newday) VALUES (?, ?, ?, ?, ?)'
      );
      
      insertRecordStmt.run(cardId, timestamp, difficulty, oldDay, newDay);

      // Update the card's scheduledDay value with our new calculation
      const updateCardStmt = db.prepare('UPDATE flashcards SET scheduledDay = ? WHERE id = ?');
      updateCardStmt.run(newDay, cardId);
    });

    // Run our transaction
    transaction();
    
    // Everything worked! Send back a success message with the scheduling details
    return res.status(200).json({
      success: true,
      message: 'Practice record updated successfully',
      oldDay: oldDay,
      newDay: newDay
    });
  } catch (error) {
    // Something unexpected happened - log it and let the user know
    console.error('Error updating practice record:', error);
    return res.status(500).json({ error: 'Failed to update practice record' });
  }
};

export default updatePractice;