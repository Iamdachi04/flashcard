// CameraManager.js - Handles camera access and video stream
import { UIManager } from './UIManager.js';

export class CameraManager {
    constructor() {
        this.cameraStream = null;
        this.uiManager = new UIManager();
    }

    // Request camera access
    async startCamera() {
        try {
            console.log('Requesting camera access...');
            this.uiManager.showCameraLoadingState();
            
            // Request video stream from user's camera
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    facingMode: 'user' // Front-facing camera
                } 
            });
            
            this.setupVideoStream(stream);
            
        } catch (error) {
            this.handleCameraError(error);
        }
    }

    // Set up video stream
    setupVideoStream(stream) {
        const videoElement = document.getElementById('cameraFeed');
        if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
            
            // Store stream reference for cleanup
            this.cameraStream = stream;
            
            // Hide loading state
            this.uiManager.hideCameraLoadingState();
            
            // Emit event when camera is ready
            videoElement.addEventListener('loadeddata', () => {
                console.log('Camera feed loaded successfully');
                const event = new CustomEvent('cameraReady');
                document.dispatchEvent(event);
            });
            
            console.log('Camera stream set up successfully');
        } else {
            console.error('Video element not found');
            this.showCameraError('Video display element not found');
        }
    }

    // Handle camera errors
    handleCameraError(error) {
        console.error('Camera access error:', error);
        this.uiManager.hideCameraLoadingState();
        
        let errorMessage = 'Unable to access camera. ';
        let technicalDetails = error.message;
        
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
        
        this.uiManager.showErrorMessage(errorMessage, technicalDetails, 'camera-error');
    }

    // Stop camera stream
    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
            
            const videoElement = document.getElementById('cameraFeed');
            if (videoElement) {
                videoElement.srcObject = null;
            }
            
            console.log('Camera stream stopped');
        }
    }

    // Check camera permissions
    checkPermissions() {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'camera' }).then(permission => {
                console.log('Camera permission status:', permission.state);
                alert(`Camera permission status: ${permission.state}`);
            });
        } else {
            alert('Please check your browser settings to allow camera access for this site.');
        }
    }

    // Check if camera is active
    isActive() {
        return !!this.cameraStream;
    }

    // Get video element
    getVideoElement() {
        return document.getElementById('cameraFeed');
    }
}