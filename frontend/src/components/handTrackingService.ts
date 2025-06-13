// handTrackingService.ts - TensorFlow.js hand tracking service

import { HandLandmark, HandPrediction } from './types';

// Declare handpose as global (loaded via CDN)
declare global {
  interface Window {
    handpose: any;
    tf: any;
  }
}

export class HandTrackingService {
  private handposeModel: any = null;
  private isModelLoaded: boolean = false;

  async initializeModel(): Promise<void> {
    try {
      console.log('Initializing TensorFlow.js and hand tracking model...');
      
      // Check if TensorFlow.js is loaded
      if (typeof window.tf === 'undefined') {
        throw new Error('TensorFlow.js not loaded. Please include the CDN script.');
      }

      // Check if handpose is loaded
      if (typeof window.handpose === 'undefined') {
        throw new Error('Handpose model not loaded. Please include the CDN script.');
      }
      
      // Load handpose model
      this.handposeModel = await window.handpose.load();
      this.isModelLoaded = true;
      
      console.log('Handpose model loaded successfully');
      
    } catch (error) {
      console.error('TensorFlow.js initialization error:', error);
      throw error;
    }
  }

  async detectHands(video: HTMLVideoElement): Promise<HandPrediction[]> {
    if (this.handposeModel && video && video.readyState === 4) {
      try {
        const predictions = await this.handposeModel.estimateHands(video);
        return predictions.map((prediction: any) => ({
          landmarks: prediction.landmarks as HandLandmark[],
          confidence: prediction.confidence
        }));
      } catch (error) {
        console.error('Hand detection error:', error);
        return [];
      }
    }
    return [];
  }

  isModelReady(): boolean {
    return this.isModelLoaded && this.handposeModel !== null;
  }

  dispose(): void {
    if (this.handposeModel) {
      // Clean up model if necessary
      this.handposeModel = null;
      this.isModelLoaded = false;
    }
  }
}