import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, containing all your file routes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "5MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      // You can perform authentication checks here if needed

      // For now, allow all uploads (you can add auth later)
      return { userId: "anonymous" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File url:", file.url);

      // Return whatever you want to the client
      return {
        userId: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        fileKey: file.key,
      };
    }),

  videoUploader: f({
    video: {
      maxFileSize: "100MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      // You can perform authentication checks here if needed

      // For now, allow all uploads (you can add auth later)
      return { userId: "anonymous" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File url:", file.url);

      // Return whatever you want to the client
      return {
        userId: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        fileKey: file.key,
      };
    }),
};

export type OurFileRouter = typeof ourFileRouter;

// Helper function to wrap the provider
export function UploadThingProvider({ children }: { children: React.ReactNode }) {
  const { UploadThingProvider: UTProvider } = require("@uploadthing/react");
  return <UTProvider>{children}</UTProvider>;
}
