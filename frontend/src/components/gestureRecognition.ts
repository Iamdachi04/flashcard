// UIManager.js - Handles all UI updates and interactions
export class UIManager {
    constructor() {
        // UI element references will be cached for performance
        this.elements = {};
    }

    // Get element with caching
    getElement(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    }

    // Practice loading states
    showLoadingState() {
        const loadingElement = this.getElement('practice-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
            loadingElement.textContent = 'Loading practice cards...';
        }
    }

    hideLoadingState() {
        const loadingElement = this.getElement('practice-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Camera loading states
    showCameraLoadingState() {
        const loadingElement = this.getElement('camera-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
            loadingElement.textContent = 'Accessing camera...';
        }
    }

    hideCameraLoadingState() {
        const loadingElement = this.getElement('camera-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // TensorFlow loading states
    showTensorFlowLoadingState() {
        const loadingElement = this.getElement('tensorflow-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
            loadingElement.textContent = 'Loading hand tracking model...';
        }
    }

    hideTensorFlowLoadingState() {
        const loadingElement = this.getElement('tensorflow-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Error message handling
    showErrorMessage(userMessage, technicalMessage = '', elementId = 'practice-error') {
        const errorElement = this.getElement(elementId);
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${userMessage}</p>
                    ${technicalMessage ? `<details><summary>Technical Details</summary><p>${technicalMessage}</p></details>` : ''}
                    <button onclick="practiceSession.retryPracticeSession()">Try Again</button>
                </div>
            `;
        }
    }

    hideErrorMessage(elementId = 'practice-error') {
        const errorElement = this.getElement(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // Hand detection status
    updateHandDetectionStatus(handCount, gesture = null) {
        const statusElement = this.getElement('hand-detection-status');
        if (statusElement) {
            if (handCount > 0) {
                let statusText = `✓ Hand detected (${handCount})`;
                if (gesture) {
                    statusText += ` - Gesture: ${gesture.toUpperCase()}`;
                }
                statusElement.textContent = statusText;
                statusElement.className = 'status-success';
            } else {
                statusElement.textContent = '⚠ No hand detected';
                statusElement.className = 'status-warning';
            }
        }
    }

    // Gesture feedback
    showGestureFeedback(gesture) {
        const feedbackElement = this.getElement('gesture-feedback');
        const videoElement = this.getElement('cameraFeed');
        
        if (feedbackElement) {
            let feedbackText, feedbackClass, feedbackColor;
            
            switch (gesture) {
                case 'easy':
                    feedbackText = '👍 EASY!';
                    feedbackClass = 'gesture-easy';
                    feedbackColor = '#4CAF50'; // Green
                    break;
                case 'hard':
                    feedbackText = '👎 HARD!';
                    feedbackClass = 'gesture-hard';
                    feedbackColor = '#FF5722'; // Red-orange
                    break;
                case 'wrong':
                    feedbackText = '✋ WRONG!';
                    feedbackClass = 'gesture-wrong';
                    feedbackColor = '#FF9800'; // Orange
                    break;
                default:
                    feedbackText = `${gesture.toUpperCase()}!`;
                    feedbackClass = 'gesture-custom';
                    feedbackColor = '#2196F3'; // Blue
            }
            
            feedbackElement.textContent = feedbackText;
            feedbackElement.className = `gesture-feedback ${feedbackClass}`;
            feedbackElement.style.display = 'block';
            
            // Change video border color
            if (videoElement) {
                videoElement.style.borderColor = feedbackColor;
                videoElement.style.borderWidth = '4px';
            }
        }
    }
    
    hideGestureFeedback() {
        const feedbackElement = this.getElement('gesture-feedback');
        const videoElement = this.getElement('cameraFeed');
        
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
        }
        
        // Reset video border
        if (videoElement) {
            videoElement.style.borderColor = '#ddd';
            videoElement.style.borderWidth = '2px';
        }
    }

    // Initialize practice UI
    initializePracticeUI(practiceCards) {
        console.log('Initializing practice UI with cards:', practiceCards);
        
        // Display first card if available
        if (practiceCards && practiceCards.length > 0) {
            this.displayPracticeCard(practiceCards[0], 0);
        }

        // Update UI elements
        this.updateCurrentDay();
    }

    // Display practice card
    displayPracticeCard(card, index = 0) {
        if (!card) return;
        
        console.log('Displaying card:', card);
        
        const cardElement = this.getElement('current-practice-card');
        if (cardElement) {
            cardElement.innerHTML = `
                <div class="practice-card">
                    <h3>${card.sign_name || 'Practice Sign'}</h3>
                    <p>${card.description || 'Practice this sign'}</p>
                    ${card.image_url ? `<img src="${card.image_url}" alt="${card.sign_name}" class="practice-card-image">` : ''}
                    <div class="card-info">
                        <span class="difficulty">${card.difficulty || 'Unknown'}</span>
                        <span class="card-number">Card ${index + 1}</span>
                    </div>
                </div>
            `;
        }
    }
}
