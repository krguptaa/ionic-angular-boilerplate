import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';

import { ToastService } from './toast.service';
import { PlatformUtils } from '../utilities';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  saveToGallery?: boolean;
  width?: number;
  height?: number;
}

export interface CameraPhoto {
  webPath?: string;
  path?: string;
  format: string;
  base64String?: string;
  dataUrl?: string;
  blob?: Blob;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor(
    private platform: Platform,
    private toastService: ToastService,
    private platformUtils: PlatformUtils
  ) {}

  /**
   * Check if camera is available on the device
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      if (!Capacitor.isPluginAvailable('Camera')) {
        return false;
      }

      // For web, check if getUserMedia is supported
      if (this.platformUtils.isWeb()) {
        return navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
      }

      return true;
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (this.platformUtils.isWeb()) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return result.state === 'granted';
      }

      // For native platforms, Capacitor handles permissions automatically
      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(options: CameraOptions = {}): Promise<CameraPhoto | null> {
    try {
      // Check camera availability
      if (!(await this.isCameraAvailable())) {
        this.toastService.showError('Camera is not available on this device');
        return null;
      }

      // Request permissions if needed
      if (!(await this.requestPermissions())) {
        this.toastService.showError('Camera permissions are required');
        return null;
      }

      const cameraOptions = {
        quality: options.quality || 85,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || CameraResultType.DataUrl,
        source: options.source || CameraSource.Camera,
        saveToGallery: options.saveToGallery || false,
        width: options.width,
        height: options.height,
        correctOrientation: true,
        promptLabelHeader: 'Photo',
        promptLabelPhoto: 'Take Photo',
        promptLabelPicture: 'Take Picture'
      };

      const photo = await Camera.getPhoto(cameraOptions);

      return this.processPhoto(photo, options.resultType || CameraResultType.DataUrl);
    } catch (error) {
      console.error('Error taking photo:', error);
      this.toastService.showError('Failed to take photo');
      return null;
    }
  }

  /**
   * Select photo from gallery
   */
  async selectFromGallery(options: CameraOptions = {}): Promise<CameraPhoto | null> {
    try {
      const cameraOptions = {
        quality: options.quality || 85,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || CameraResultType.DataUrl,
        source: CameraSource.Photos,
        saveToGallery: false,
        width: options.width,
        height: options.height,
        correctOrientation: true,
        promptLabelHeader: 'Photos',
        promptLabelPhoto: 'Choose Photo',
        promptLabelPicture: 'Choose Picture'
      };

      const photo = await Camera.getPhoto(cameraOptions);

      return this.processPhoto(photo, options.resultType || CameraResultType.DataUrl);
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      this.toastService.showError('Failed to select photo from gallery');
      return null;
    }
  }

  /**
   * Process the photo result
   */
  private async processPhoto(photo: Photo, resultType: CameraResultType): Promise<CameraPhoto> {
    const cameraPhoto: CameraPhoto = {
      webPath: photo.webPath,
      path: photo.path,
      format: photo.format
    };

    try {
      if (resultType === CameraResultType.DataUrl) {
        cameraPhoto.dataUrl = photo.dataUrl;
      } else if (resultType === CameraResultType.Base64) {
        cameraPhoto.base64String = photo.base64String;
      } else if (resultType === CameraResultType.Uri) {
        // For native platforms, convert file URI to blob if needed
        if (photo.path && !this.platformUtils.isWeb()) {
          cameraPhoto.blob = await this.convertFileUriToBlob(photo.path);
        }
      }

      // Convert to blob for web compatibility
      if (photo.dataUrl) {
        cameraPhoto.blob = await this.dataUrlToBlob(photo.dataUrl);
      } else if (photo.base64String) {
        cameraPhoto.blob = await this.base64ToBlob(photo.base64String, `image/${photo.format}`);
      }

    } catch (error) {
      console.error('Error processing photo:', error);
    }

    return cameraPhoto;
  }

  /**
   * Convert data URL to blob
   */
  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const response = fetch(dataUrl);
        resolve(response.then(res => res.blob()));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convert base64 string to blob
   */
  private async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        resolve(new Blob([byteArray], { type: mimeType }));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convert file URI to blob (for native platforms)
   */
  private async convertFileUriToBlob(filePath: string): Promise<Blob> {
    try {
      const file = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data
      });

      if (file.data instanceof Blob) {
        return file.data;
      }

      // Convert base64 to blob
      const mimeType = this.getMimeTypeFromPath(filePath);
      return await this.base64ToBlob(file.data as string, mimeType);
    } catch (error) {
      console.error('Error converting file URI to blob:', error);
      throw error;
    }
  }

  /**
   * Get MIME type from file path
   */
  private getMimeTypeFromPath(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };

    return mimeTypes[extension || ''] || 'image/jpeg';
  }

  /**
   * Save photo to device gallery
   */
  async saveToGallery(photo: CameraPhoto): Promise<boolean> {
    try {
      if (!photo.blob && !photo.dataUrl && !photo.base64String) {
        throw new Error('No photo data available to save');
      }

      let base64Data: string;

      if (photo.dataUrl) {
        base64Data = photo.dataUrl.split(',')[1];
      } else if (photo.base64String) {
        base64Data = photo.base64String;
      } else if (photo.blob) {
        base64Data = await this.blobToBase64(photo.blob);
      } else {
        throw new Error('Unable to extract photo data');
      }

      // Save to gallery using Filesystem
      const fileName = `photo_${Date.now()}.${photo.format}`;
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data
      });

      this.toastService.showSuccess('Photo saved to gallery');
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      this.toastService.showError('Failed to save photo to gallery');
      return false;
    }
  }

  /**
   * Convert blob to base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get camera capabilities
   */
  async getCameraCapabilities(): Promise<{
    hasCamera: boolean;
    hasFrontCamera: boolean;
    hasBackCamera: boolean;
    supportsFlash: boolean;
  }> {
    try {
      const hasCamera = await this.isCameraAvailable();

      return {
        hasCamera,
        hasFrontCamera: hasCamera, // Assume available if camera exists
        hasBackCamera: hasCamera,
        supportsFlash: !this.platformUtils.isWeb() // Flash typically not available on web
      };
    } catch (error) {
      console.error('Error getting camera capabilities:', error);
      return {
        hasCamera: false,
        hasFrontCamera: false,
        hasBackCamera: false,
        supportsFlash: false
      };
    }
  }
}