// practiceSessionService.ts - Main practice session service

import { PracticeCard, HandLandmark, GestureType, SessionStatus } from './types';
import { GestureRecognition } from './gestureRecognition';
import { CameraService } from './cameraService';
import { HandTrackingService } from './handTrackingService';
import { PracticeApiService } from './practiceApiService';

export class PracticeSessionService {
  private practiceCards: PracticeCard[] = [];
  private currentDay: number = 0;
  private isSessionActive: boolean = false;
  private currentHandLandmarks: HandLandmark[] | null = null;
  private currentRecognizedGesture: GestureType = null;
  
  // Service instances
  private gestureRecognition: GestureRecognition;
  private cameraService: CameraService;
  private handTrackingService: HandTrackingService;
  private apiService: PracticeApiService;
  
  // Callbacks for UI updates
  private onStatusUpdate?: (status: Partial<SessionStatus>) => void;
  private onError?: (error: string, technicalDetails?: string) => void;
  private onGestureDetected?: (gesture: GestureType) => void;
  private onHandsDetected?: (count: number, gesture?: GestureType) => void;

  constructor(
    onStatusUpdate?: (status: Partial<SessionStatus>) => void,
    onError?: (error: string, technicalDetails?: string) => void,
    onGestureDetected?: (gesture: GestureType) => void,
    onHandsDetected?: (count: number, gesture?: GestureType) => void
  ) {
    this.gestureRecognition = new GestureRecognition();
    this.cameraService = new CameraService();
    this.handTrackingService = new HandTrackingService();
    this.apiService = new PracticeApiService();
    
    this.onStatusUpdate = onStatusUpdate;
    this.onError = onError;
    this.onGestureDetected = onGestureDetected;
    this.onHandsDetected = onHandsDetected;
  }

  // Initialize current day (for React, this would be managed by useState)
  setCurrentDay(day: number): void {
    this.currentDay = day;
    this.updateStatus({ currentDay: day });
  }

  getCurrentDay(): number {
    return this.currentDay;
  }

  incrementDay(): void {
    this.setCurrentDay(this.currentDay + 1);
  }

  async startPracticeSession(): Promise<void> {
    console.log('Starting enhanced practice session for day:', this.currentDay);
    
    try {
      this.updateStatus({ isSessionActive: false });
      
      // Fetch practice cards
      this.practiceCards = await this.apiService.fetchPracticeCards(this.currentDay);
      
      // Start camera
      const stream = await this.cameraService.startCamera();
      
      // Initialize hand tracking
      await this.handTrackingService.initializeModel();
      
      this.isSessionActive = true;
      this.updateStatus({ 
        isSessionActive: true,
        cardCount: this.practiceCards.length,
        cards: this.practiceCards,
        cameraActive: true,
        tensorFlowLoaded: true
      });
      
      // Start hand detection loop
      this.startHandDetection();
      
      console.log(`Enhanced practice session started with ${this.practiceCards.length} cards`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.handleError('Failed to start practice session', errorMessage);
    }
  }

  stopPracticeSession(): void {
    console.log('Stopping practice session...');
    
    this.isSessionActive = false;
    this.cameraService.stopCamera();
    this.handTrackingService.dispose();
    this.gestureRecognition.reset();
    
    this.currentHandLandmarks = null;
    this.currentRecognizedGesture = null;
    
    this.updateStatus({
      isSessionActive: false,
      cameraActive: false,
      tensorFlowLoaded: false,
      handDetected: false,
      currentGesture: null
    });
    
    console.log('Practice session stopped');
  }

  async processFrame(video: HTMLVideoElement): Promise<void> {
    if (!this.isSessionActive || !this.handTrackingService.isModelReady()) {
      return;
    }

    try {
      const predictions = await this.handTrackingService.detectHands(video);
      
      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        
        // Log detected landmarks to console
        console.log('Hand landmarks detected:', landmarks);
        
        // Gesture recognition
        const recognizedGesture = this.gestureRecognition.detectGesture(landmarks);
        
        if (recognizedGesture) {
          console.log(`Gesture recognized: ${recognizedGesture.toUpperCase()}`);
          this.currentRecognizedGesture = recognizedGesture;
          this.onGestureDetected?.(recognizedGesture);
        } else {
          this.currentRecognizedGesture = null;
        }
        
        // Update hand detection status
        this.onHandsDetected?.(predictions.length, recognizedGesture);
        
        // Store landmarks
        this.currentHandLandmarks = landmarks;
        
        this.updateStatus({
          handDetected: true,
          currentGesture: recognizedGesture,
          ...this.gestureRecognition.getState()
        });
        
      } else {
        this.currentHandLandmarks = null;
        this.currentRecognizedGesture = null;
        
        this.onHandsDetected?.(0, null);
        
        this.updateStatus({
          handDetected: false,
          currentGesture: null
        });
      }
      
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }

  startHandDetection(): void {
    console.log('Starting hand detection loop...');
    
    const processFrameLoop = () => {
      const video = document.getElementById('cameraFeed') as HTMLVideoElement;
      if (video) {
        this.processFrame(video);
      }
      
      if (this.isSessionActive) {
        requestAnimationFrame(processFrameLoop);
      }
    };
    
    processFrameLoop();
  }

  getPracticeCards(): PracticeCard[] {
    return this.practiceCards;
  }

  getCurrentHandLandmarks(): HandLandmark[] | null {
    return this.currentHandLandmarks;
  }

  getCurrentGesture(): GestureType {
    return this.currentRecognizedGesture;
  }

  getSessionStatus(): SessionStatus {
    return {
      currentDay: this.currentDay,
      isSessionActive: this.isSessionActive,
      cardCount: this.practiceCards.length,
      cards: this.practiceCards,
      cameraActive: !!this.cameraService.getCameraStream(),
      tensorFlowLoaded: this.handTrackingService.isModelReady(),
      handDetected: !!this.currentHandLandmarks,
      currentGesture: this.currentRecognizedGesture,
      ...this.gestureRecognition.getState()
    };
  }

  private updateStatus(status: Partial<SessionStatus>): void {
    this.onStatusUpdate?.(status);
  }

  private handleError(message: string, technicalDetails?: string): void {
    this.onError?.(message, technicalDetails);
  }

  // Retry methods
  async retrySession(): Promise<void> {
    await this.startPracticeSession();
  }

  async checkCameraPermissions(): Promise<PermissionState | null> {
    return await this.cameraService.checkCameraPermissions();
  }
}