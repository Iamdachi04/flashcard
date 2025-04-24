// frontend/src/components/FlashcardDisplay.tsx

import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import { fetchHint } from '../services/api';

// Define the props expected by this component
interface FlashcardDisplayProps {
  card: Flashcard;
  showBack: boolean; // Prop to indicate if the answer is currently shown
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ card, showBack }) => {
  // State to manage hint display and loading
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Effect to run whenever the 'card' prop changes.
  // Resets the hint state for the new card.
  useEffect(() => {
    setHint(null);
    setLoadingHint(false);
    setHintError(null);
  }, [card]); // Dependency array: re-run this effect when 'card' changes

  // Function to handle fetching the hint from the backend
  const handleGetHint = async () => {
    if (!card) {
        console.warn("Attempted to get hint without a card.");
        return;
    }

    // Set loading state and clear previous results
    setLoadingHint(true);
    setHint(null);
    setHintError(null);

    try {
      // Call the API service to fetch the hint
      const fetchedHint = await fetchHint(card.front, card.back);
      // Set the received hint into state
      setHint(fetchedHint);
    } catch (error) {
      // Handle errors during fetch
      console.error('Failed to fetch hint:', error);
      setHintError('Could not load hint.');
    } finally {
      // This runs after try or catch
      setLoadingHint(false); // End loading state
    }
  };

  // Basic inline styling for demonstration
  const cardStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '20px',
    margin: '10px 0',
    minHeight: '150px',
    position: 'relative',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  };

  const frontStyle: React.CSSProperties = {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const backStyle: React.CSSProperties = {
    fontSize: '1.2em',
    color: showBack ? '#333' : '#aaa',
    fontStyle: showBack ? 'normal' : 'italic',
  };

   const hintButtonStyle: React.CSSProperties = {
    marginTop: '15px',
    padding: '5px 10px',
    cursor: 'pointer',
   };

   const hintAreaStyle: React.CSSProperties = {
    marginTop: '10px',
    fontSize: '0.9em',
    color: '#666',
    minHeight: '20px', // Keep space reserved even if empty
   };

   const errorStyle: React.CSSProperties = {
      color: 'red',
      fontSize: '0.9em',
      marginTop: '10px',
   }

  return (
    <div style={cardStyle}>
      <div style={frontStyle}>{card.front}</div>
      <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '10px 0' }} />
      <div style={backStyle}>
        {showBack ? card.back : '???'} {/* Display back if showBack is true */}
      </div>

      {/* Only show hint button if back is hidden */}
      {!showBack && (
        <button
          style={hintButtonStyle}
          onClick={handleGetHint}
          // Disable if loading or hint/error has been fetched
          disabled={loadingHint || hint !== null || hintError !== null}
        >
          {loadingHint ? 'Loading Hint...' : 'Get Hint'}
        </button>
      )}

      {/* Display Hint, Error, or Loading message ONLY if the back is NOT shown */}
      {!showBack && (
        <div style={hintAreaStyle}>
          {loadingHint && <span>Loading Hint...</span>}
          {hint && <span>Hint: {hint}</span>}
          {hintError && <span style={errorStyle}>{hintError}</span>}
        </div>
      )}
    </div>
  );
};

export default FlashcardDisplay;