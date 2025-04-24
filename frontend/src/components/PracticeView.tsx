// frontend/src/components/PracticeView.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, AnswerDifficulty, PracticeSession } from '../types';
import { fetchPracticeCards, submitAnswer, advanceDay } from '../services/api';
import FlashcardDisplay from './FlashcardDisplay';

const PracticeView: React.FC = () => {
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [showBack, setShowBack] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<number>(0);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Prevent double clicks

  // Function to load cards for the current day
  const loadPracticeCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSessionFinished(false);
    setPracticeCards([]); // Clear old cards immediately
    setCurrentCardIndex(0);
    setShowBack(false);

    try {
      const data: PracticeSession = await fetchPracticeCards();
      setPracticeCards(data.cards);
      setDay(data.day);
      if (data.cards.length === 0) {
        setSessionFinished(true); // No cards left for today
      }
    } catch (err) {
      console.error('Failed to load practice cards:', err);
      setError('Failed to load practice cards. Please try again later.');
      // Optionally: Add a retry button here
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies, safe to memoize

  // Load cards when the component mounts
  useEffect(() => {
    loadPracticeCards();
  }, [loadPracticeCards]); // Include loadPracticeCards in dependency array

  // Handler to reveal the back of the card
  const handleShowBack = () => {
    setShowBack(true);
  };

  // Handler for when the user selects a difficulty
  const handleAnswer = async (difficulty: AnswerDifficulty) => {
    if (isSubmitting || currentCardIndex >= practiceCards.length) return; // Prevent multiple submissions or out-of-bounds access

    const currentCard = practiceCards[currentCardIndex];
    if (!currentCard) return; // Safety check

    setIsSubmitting(true); // Indicate submission is in progress
    setError(null); // Clear previous errors

    try {
      await submitAnswer(currentCard.front, currentCard.back, difficulty);

      // Move to the next card or finish the session
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= practiceCards.length) {
        setSessionFinished(true);
      } else {
        setCurrentCardIndex(nextIndex);
        setShowBack(false); // Hide back for the new card
        // Hint state is managed within FlashcardDisplay, will reset on re-render
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError('Failed to submit answer. Please try again.');
      // Keep the user on the current card to allow retry
    } finally {
       setIsSubmitting(false); // Re-enable buttons
    }
  };

  // Handler for the "Go to Next Day" button
  const handleNextDay = async () => {
     setError(null); // Clear previous errors before trying again
     setIsLoading(true); // Show loading indicator for day change + fetch
     try {
       await advanceDay();
       await loadPracticeCards(); // Reload cards for the new day
     } catch (err) {
        console.error('Failed to advance day or load new cards:', err);
        setError('Failed to advance to the next day. Please try again.');
        setIsLoading(false); // Ensure loading is turned off on error
     }
     // setIsLoading(false) is handled by loadPracticeCards' finally block on success
  };

  // --- Rendering Logic ---

  if (isLoading && practiceCards.length === 0) { // Show initial loading
    return <div>Loading practice session...</div>;
  }

  if (error && !isLoading) { // Show error only if not loading (prevents flash of error during load)
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (sessionFinished) {
    return (
      <div>
        <h2>Session Complete for Day {day}!</h2>
        <p>You have reviewed all cards scheduled for today.</p>
        <button onClick={handleNextDay} disabled={isLoading}>
          {isLoading ? 'Loading Next Day...' : 'Go to Next Day'}
        </button>
         {error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>}
      </div>
    );
  }

  // Ensure we have a card to display
  if (practiceCards.length === 0 || currentCardIndex >= practiceCards.length) {
      // This might happen briefly or if loading failed silently
      return <div>No cards available or loading...</div>;
  }

  const currentCard = practiceCards[currentCardIndex];

  // Basic layout styling
  const viewStyle: React.CSSProperties = {
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
  };

  const controlsStyle: React.CSSProperties = {
      marginTop: '20px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
  };

  const buttonStyle: React.CSSProperties = {
      padding: '10px 20px',
      fontSize: '1em',
      cursor: 'pointer',
  };

  const infoStyle: React.CSSProperties = {
      textAlign: 'center',
      marginBottom: '15px',
      color: '#555',
  };


  return (
    <div style={viewStyle}>
       <div style={infoStyle}>
          Day: {day} | Card {currentCardIndex + 1} of {practiceCards.length}
       </div>

      <FlashcardDisplay card={currentCard} showBack={showBack} />

      {error && <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>Error: {error}</div>}


      <div style={controlsStyle}>
        {!showBack ? (
          <button style={buttonStyle} onClick={handleShowBack} disabled={isSubmitting || isLoading}>
            Show Answer
          </button>
        ) : (
          <>
            <button
              style={{...buttonStyle, backgroundColor: '#ffdddd'}} // Reddish for wrong
              onClick={() => handleAnswer(AnswerDifficulty.Wrong)}
              disabled={isSubmitting || isLoading}
            >
              Wrong
            </button>
            <button
              style={{...buttonStyle, backgroundColor: '#ffffcc'}} // Yellowish for hard
              onClick={() => handleAnswer(AnswerDifficulty.Hard)}
              disabled={isSubmitting || isLoading}
            >
              Hard
            </button>
            <button
               style={{...buttonStyle, backgroundColor: '#ddffdd'}} // Greenish for easy
              onClick={() => handleAnswer(AnswerDifficulty.Easy)}
              disabled={isSubmitting || isLoading}
            >
              Easy
            </button>
          </>
        )}
      </div>
         {/* Show loading indicator during submissions or day changes */}
         {(isSubmitting || isLoading) && <div style={{textAlign: 'center', marginTop: '10px'}}>Processing...</div>}
    </div>
  );
};

export default PracticeView;