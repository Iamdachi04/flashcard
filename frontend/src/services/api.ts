// frontend/src/services/api.ts

import axios from 'axios';
import {
  PracticeSession,
  AnswerDifficulty,
  Flashcard,
  ProgressStats,
  UpdateRequest, // Though we construct it inline, importing clarifies intent
} from '../types';

// Define the base URL for the backend API
// Ensure this port (3001) matches your running backend server
const API_BASE_URL = 'http://localhost:3001/api';

// Create an Axios instance with the base URL pre-configured
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches the list of cards to practice for the current day.
 * Modified to accept `day` as a query parameter to match frontend logic.
 * @param day - The current day of the practice session.
 * @returns A Promise resolving to the PracticeSession data.
 */
export const fetchPracticeCards = async (day: number): Promise<PracticeSession> => {
  try {
    // Pass day as query param ?day=0
    const response = await apiClient.get<PracticeSession>('/practice', {
      params: { day },
    });
    console.log('Fetched practice cards for day', day, ':', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching practice cards:', error);
    throw error;
  }
};


/**
 * Submits the user's answer (difficulty) for a specific card.
 * @param cardFront - The front text of the card.
 * @param cardBack - The back text of the card.
 * @param difficulty - The difficulty level chosen by the user.
 * @returns A Promise resolving when the update is successful.
 */
export const submitAnswer = async (
  cardFront: string,
  cardBack: string,
  difficulty: AnswerDifficulty
): Promise<void> => {
  try {
    const payload: UpdateRequest = { cardFront, cardBack, difficulty };
    await apiClient.post('/update', payload);
    console.log('Submitted answer for:', cardFront, 'Difficulty:', AnswerDifficulty[difficulty]);
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
};

/**
 * Fetches a hint for a given flashcard.
 * Note: Backend expects cardFront and cardBack as query parameters.
 * @param cardFront - The front text of the card.
 * @param cardBack - The back text of the card.
 * @returns A Promise resolving to the hint string.
 */
export const fetchHint = async (cardFront: string, cardBack: string): Promise<string> => {
  try {
    // Use `params` option for GET request query parameters
    const response = await apiClient.get<{ hint: string }>('/hint', {
      params: { cardFront, cardBack },
    });
    console.log('Fetched hint for:', cardFront, 'Hint:', response.data.hint);
    return response.data.hint;
  } catch (error) {
    console.error('Error fetching hint:', error);
    throw error;
  }
};

/**
 * Fetches the overall learning progress statistics.
 * @returns A Promise resolving to the ProgressStats data.
 */
export const fetchProgress = async (): Promise<ProgressStats> => {
  try {
    const response = await apiClient.get<ProgressStats>('/progress');
    console.log('Fetched progress:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

/**
 * Tells the backend to advance to the next simulation day.
 * @returns A Promise resolving to an object containing the new current day.
 */
export const advanceDay = async (): Promise<{ currentDay: number }> => {
  try {
    const response = await apiClient.post<{ currentDay: number }>('/day/next');
    console.log('Advanced to day:', response.data.currentDay);
    return response.data;
  } catch (error) {
    console.error('Error advancing day:', error);
    throw error;
  }
};