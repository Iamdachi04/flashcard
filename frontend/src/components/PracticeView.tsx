import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flashcard, AnswerDifficulty, PracticeSession } from '../types';
import { fetchPracticeCards, submitAnswer, advanceDay } from '../services/api';
import FlashcardDisplay from './FlashcardDisplay';

const LOCAL_STORAGE_DAY_KEY = 'currentPracticeDay';

const PracticeView: React.FC = () => {
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [showBack, setShowBack] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<number>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_DAY_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Load flashcards
  const loadPracticeCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSessionFinished(false);
    setPracticeCards([]);
    setCurrentCardIndex(0);
    setShowBack(false);

    try {
      const data: PracticeSession = await fetchPracticeCards(day);
      setPracticeCards(data.cards);
      setDay(data.day);
      localStorage.setItem(LOCAL_STORAGE_DAY_KEY, data.day.toString());
      if (data.cards.length === 0) {
        setSessionFinished(true);
      }
    } catch (err) {
      console.error('Failed to load practice cards:', err);
      setError('Failed to load practice cards. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [day]);

  useEffect(() => {
    loadPracticeCards();
  }, [loadPracticeCards]);

  // Request and display camera feed
  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError('Unable to access your camera. Please allow camera access in your browser settings.');
      }
    };

    requestCameraAccess();
  }, []);

  const handleShowBack = () => setShowBack(true);

  const handleAnswer = async (difficulty: AnswerDifficulty) => {
    if (isSubmitting || currentCardIndex >= practiceCards.length) return;
    const currentCard = practiceCards[currentCardIndex];
    if (!currentCard) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitAnswer(currentCard.front, currentCard.back, difficulty);
      const nextIndex = currentCardIndex + 1;
      if (nextIndex >= practiceCards.length) {
        setSessionFinished(true);
      } else {
        setCurrentCardIndex(nextIndex);
        setShowBack(false);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextDay = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await advanceDay();
      setDay(result.currentDay);
      localStorage.setItem(LOCAL_STORAGE_DAY_KEY, result.currentDay.toString());
      await loadPracticeCards();
    } catch (err) {
      console.error('Failed to advance day or load new cards:', err);
      setError('Failed to advance to the next day. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading && practiceCards.length === 0) {
    return <div>Loading practice session...</div>;
  }

  if (error && !isLoading) {
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

  if (practiceCards.length === 0 || currentCardIndex >= practiceCards.length) {
    return <div>No cards available or loading...</div>;
  }

  const currentCard = practiceCards[currentCardIndex];

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

  const videoStyle: React.CSSProperties = {
    width: '100%',
    maxHeight: '240px',
    marginTop: '15px',
    borderRadius: '8px',
    backgroundColor: '#000',
  };

  return (
    <div style={viewStyle}>
      <div style={infoStyle}>
        Day: {day} | Card {currentCardIndex + 1} of {practiceCards.length}
      </div>

      <FlashcardDisplay card={currentCard} showBack={showBack} />

      {error && (
        <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>Error: {error}</div>
      )}

      <div style={controlsStyle}>
        {!showBack ? (
          <button style={buttonStyle} onClick={handleShowBack} disabled={isSubmitting || isLoading}>
            Show Answer
          </button>
        ) : (
          <>
            <button
              style={{ ...buttonStyle, backgroundColor: '#ffdddd' }}
              onClick={() => handleAnswer(AnswerDifficulty.Wrong)}
              disabled={isSubmitting || isLoading}
            >
              Wrong
            </button>
            <button
              style={{ ...buttonStyle, backgroundColor: '#ffffcc' }}
              onClick={() => handleAnswer(AnswerDifficulty.Hard)}
              disabled={isSubmitting || isLoading}
            >
              Hard
            </button>
            <button
              style={{ ...buttonStyle, backgroundColor: '#ddffdd' }}
              onClick={() => handleAnswer(AnswerDifficulty.Easy)}
              disabled={isSubmitting || isLoading}
            >
              Easy
            </button>
          </>
        )}
      </div>

      {(isSubmitting || isLoading) && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>Processing...</div>
      )}

      {/* Camera Feed */}
      <video
        ref={videoRef}
        id="cameraFeed"
        autoPlay
        playsInline
        muted
        style={videoStyle}
      ></video>

      {cameraError && (
        <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{cameraError}</div>
      )}
    </div>
  );
};

export default PracticeView;
