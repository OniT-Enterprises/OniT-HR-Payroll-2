import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

export class FileUploadService {
  private static instance: FileUploadService;

  static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  /**
   * Upload a file to Firebase Storage
   * @param file - The file to upload
   * @param path - Storage path (e.g., 'employees/123/workContract')
   * @returns Promise with download URL
   */
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Upload employee document
   * @param file - The file to upload
   * @param employeeId - Employee ID
   * @param documentType - Type of document (workContract, workingVisa, etc.)
   * @returns Promise with download URL
   */
  async uploadEmployeeDocument(
    file: File,
    employeeId: string,
    documentType: string,
  ): Promise<string> {
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${documentType}_${timestamp}.${fileExtension}`;
    const path = `employees/${employeeId}/documents/${fileName}`;

    return this.uploadFile(file, path);
  }

  /**
   * Delete a file from Firebase Storage
   * @param url - The download URL of the file to delete
   */
  async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  }

  /**
   * Generate a temporary employee ID for file uploads before employee creation
   */
  generateTempEmployeeId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const fileUploadService = FileUploadService.getInstance();
