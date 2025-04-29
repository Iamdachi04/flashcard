import Database from 'better-sqlite3';

// Singleton database instance
const db = new Database('./flashcards.db');
export default db;
