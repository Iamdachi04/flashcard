// cameraService.ts - Camera management service

import { CameraError } from './types';

export class CameraService {
  private cameraStream: MediaStream | null = null;

  async startCamera(): Promise<MediaStream> {
    try {
      console.log('Requesting camera access...');
      
      // Request video stream from user's camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user' // Front-facing camera
        } 
      });
      
      this.cameraStream = stream;
      return stream;
      
    } catch (error) {
      throw this.handleCameraError(error as CameraError);
    }
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
      console.log('Camera stream stopped');
    }
  }

  getCameraStream(): MediaStream | null {
    return this.cameraStream;
  }

  private handleCameraError(error: CameraError): Error {
    console.error('Camera access error:', error);
    
    let errorMessage = 'Unable to access camera. ';
    
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        errorMessage += 'Camera permission was denied. Please allow camera access and try again.';
        break;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        errorMessage += 'No camera found on this device.';
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        errorMessage += 'Camera is already in use by another application.';
        break;
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        errorMessage += 'Camera does not meet the required specifications.';
        break;
      case 'NotSupportedError':
        errorMessage += 'Camera access is not supported in this browser.';
        break;
      default:
        errorMessage += 'An unknown error occurred while accessing the camera.';
    }
    
    return new Error(errorMessage);
  }

  async checkCameraPermissions(): Promise<PermissionState | null> {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return permission.state;
      } catch (error) {
        console.error('Error checking camera permissions:', error);
        return null;
      }
    }
    return null;
  }
}