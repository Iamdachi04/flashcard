// practiceApiService.ts - API service for practice cards

import { PracticeCard } from './types';

export class PracticeApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async fetchPracticeCards(day: number): Promise<PracticeCard[]> {
    const apiUrl = `${this.baseUrl}/practice?day=${day}`;
    
    console.log('Fetching practice cards from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      // Check if response is successful
      if (!response.ok) {
        throw new Error(`Failed to fetch practice cards: ${response.status} ${response.statusText}`);
      }

      // Parse JSON response
      const practiceCards = await response.json();
      
      // Validate response format
      if (!Array.isArray(practiceCards)) {
        throw new Error('Invalid response format: expected array of practice cards');
      }

      return practiceCards as PracticeCard[];
      
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async submitPracticeResult(day: number, cardId: string, result: any): Promise<void> {
    const apiUrl = `${this.baseUrl}/practice/result`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day,
          cardId,
          result,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit practice result: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Submit result error:', error);
      throw error;
    }
  }

  // Private method for authentication token (implement as needed)
  private getAuthToken(): string | null {
    // Implement your authentication logic here
    return null;
  }
}