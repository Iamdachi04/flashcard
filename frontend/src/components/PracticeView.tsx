// types.ts - Put this in a separate file for shared types
export interface PracticeCard {
    sign_name: string;
    description: string;
    image_url?: string;
    // Add other card properties as needed
}

export interface SessionStatus {
    currentDay: number;
    isSessionActive: boolean;
    cardCount: number;
    cards: PracticeCard[];
    cameraActive: boolean;
    tensorFlowLoaded: boolean;
    handDetected: boolean;
    currentGesture: string | null;
    gestureHoldTime: number;
    lastGesture: string | null;
}

export type GestureType = 'easy' | 'hard' | 'wrong' | null;

// PracticeSession.ts
import { CameraManager } from './CameraManager';
import { TensorFlowManager } from './TensorFlowManager';
import { GestureRecognizer } from './GestureRecognizer';
import { UIManager } from './UIManager';
import { ApiService } from './ApiService';
import { SessionStatus, PracticeCard, GestureType } from './types';

export class PracticeSession {
    private practiceCards: PracticeCard[];
    private currentDay: number;
    private isSessionActive: boolean;
    
    // Managers
    private cameraManager: CameraManager;
    private tensorFlowManager: TensorFlowManager;
    private gestureRecognizer: GestureRecognizer;
    private uiManager: UIManager;
    private apiService: ApiService;
    
    // Practice state
    private currentHandLandmarks: any[] | null; // Consider defining a proper type for landmarks
    private currentRecognizedGesture: GestureType;

    constructor() {
        this.practiceCards = [];
        this.currentDay = this.getCurrentDay();
        this.isSessionActive = false;
        
        // Initialize managers
        this.cameraManager = new CameraManager();
        this.tensorFlowManager = new TensorFlowManager();
        this.gestureRecognizer = new GestureRecognizer();
        this.uiManager = new UIManager();
        this.apiService = new ApiService();
        
        // Practice state
        this.currentHandLandmarks = null;
        this.currentRecognizedGesture = null;
    }

    // Day management with localStorage persistence
    private getCurrentDay(): number {
        const storedDay = localStorage.getItem('currentDay');
        return storedDay ? parseInt(storedDay, 10) : 0;
    }

    private setCurrentDay(day: number): void {
        this.currentDay = day;
        localStorage.setItem('currentDay', day.toString());
    }

    public incrementDay(): void {
        this.setCurrentDay(this.currentDay + 1);
    }

    // Main practice session start
    public async startPracticeSession(): Promise<void> {
        console.log('Starting practice session for day:', this.currentDay);
        
        try {
            this.uiManager.showLoadingState();
            
            // Fetch practice cards
            const practiceCards = await this.apiService.fetchPracticeCards(this.currentDay);
            this.practiceCards = practiceCards;
            
            // Start camera
            await this.cameraManager.startCamera();
            
            // Initialize TensorFlow after camera is ready
            await this.tensorFlowManager.initialize();
            
            this.isSessionActive = true;
            this.uiManager.hideLoadingState();
            this.uiManager.initializePracticeUI(this.practiceCards);
            
            // Start hand detection loop
            this.startHandDetection();
            
            console.log(`Practice session started with ${practiceCards.length} cards`);
            
        } catch (error) {
            this.handlePracticeError(error as Error);
        }
    }

    // Stop practice session
    public stopPracticeSession(): void {
        console.log('Stopping practice session...');
        
        this.isSessionActive = false;
        this.cameraManager.stopCamera();
        this.tensorFlowManager.cleanup();
        this.gestureRecognizer.reset();
        
        this.currentHandLandmarks = null;
        this.currentRecognizedGesture = null;
        
        this.uiManager.hideGestureFeedback();
        this.uiManager.updateHandDetectionStatus(0, null);
        
        console.log('Practice session stopped');
    }

    // Hand detection processing loop
    private startHandDetection(): void {
        console.log('Starting hand detection loop...');
        this.processFrame();
    }

    private async processFrame(): Promise<void> {
        const videoElement = document.getElementById('cameraFeed') as HTMLVideoElement;
        
        if (videoElement && this.isSessionActive) {
            try {
                const predictions = await this.tensorFlowManager.detectHands(videoElement);
                
                if (predictions.length > 0) {
                    const landmarks = predictions[0].landmarks;
                    console.log('Hand landmarks detected:', landmarks);
                    
                    // Recognize gesture
                    const recognizedGesture = this.gestureRecognizer.detectGesture(landmarks);
                    
                    if (recognizedGesture) {
                        console.log(`Gesture recognized: ${recognizedGesture.toUpperCase()}`);
                        this.uiManager.showGestureFeedback(recognizedGesture);
                        this.currentRecognizedGesture = recognizedGesture;
                    } else {
                        this.currentRecognizedGesture = null;
                        this.uiManager.hideGestureFeedback();
                    }
                    
                    this.uiManager.updateHandDetectionStatus(predictions.length, recognizedGesture);
                    this.currentHandLandmarks = landmarks;
                } else {
                    this.uiManager.updateHandDetectionStatus(0, null);
                    this.currentHandLandmarks = null;
                    this.currentRecognizedGesture = null;
                    this.uiManager.hideGestureFeedback();
                }
                
            } catch (error) {
                console.error('Frame processing error:', error);
            }
        }
        
        // Continue processing frames
        if (this.isSessionActive) {
            requestAnimationFrame(() => this.processFrame());
        }
    }

    // Error handling
    private handlePracticeError(error: Error): void {
        console.error('Practice session error:', error);
        this.uiManager.hideLoadingState();
        this.isSessionActive = false;
        this.uiManager.showErrorMessage(
            'Unable to start practice session. Please check your connection and try again.',
            error.message,
            'practice-error'
        );
    }

    // Retry methods
    public async retryPracticeSession(): Promise<void> {
        this.uiManager.hideErrorMessage('practice-error');
        await this.startPracticeSession();
    }

    public async retryCamera(): Promise<void> {
        this.uiManager.hideErrorMessage('camera-error');
        await this.cameraManager.startCamera();
    }

    public async retryTensorFlow(): Promise<void> {
        this.uiManager.hideErrorMessage('tensorflow-error');
        await this.tensorFlowManager.initialize();
    }

    public checkCameraPermissions(): void {
        this.cameraManager.checkPermissions();
    }

    // Debug method
    public getSessionStatus(): SessionStatus {
        return {
            currentDay: this.currentDay,
            isSessionActive: this.isSessionActive,
            cardCount: this.practiceCards.length,
            cards: this.practiceCards,
            cameraActive: this.cameraManager.isActive(),
            tensorFlowLoaded: this.tensorFlowManager.isLoaded(),
            handDetected: !!this.currentHandLandmarks,
            currentGesture: this.currentRecognizedGesture,
            gestureHoldTime: this.gestureRecognizer.getHoldTime(),
            lastGesture: this.gestureRecognizer.getLastGesture()
        };
    }
}