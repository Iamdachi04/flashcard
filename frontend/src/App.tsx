// frontend/src/App.tsx

import React from 'react';
import PracticeView from './components/PracticeView';
import './App.css'; // Assuming you have or will create some basic CSS

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Flashcard Learner</h1>
      </header>
      <main>
        <PracticeView />
        {/* Later you might add routing here */}
        {/* e.g., <ProgressView /> */}
      </main>
    </div>
  );
}

export default App;