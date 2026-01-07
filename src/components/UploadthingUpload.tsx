"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { useCallback } from "react";

interface UploadthingUploadProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  onUploadError?: (error: Error) => void;
}

export function UploadthingUpload({
  onUploadComplete,
  onUploadError,
}: UploadthingUploadProps) {
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const fileUrl = res[0].fileUrl;
        const fileName = res[0].fileName || "";

        // Determine if it's an image or video based on file extension
        const isVideo = /\.(mp4|mov|webm)$/i.test(fileName);
        onUploadComplete(fileUrl, isVideo ? 'video' : 'image');
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      onUploadError?.(error);
    },
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        await startUpload([file]);
      } catch (error) {
        console.error("Upload failed:", error);
        onUploadError?.(error as Error);
      }
    },
    [startUpload, onUploadError]
  );

  return {
    uploadFile: handleFileSelect,
  };
}
