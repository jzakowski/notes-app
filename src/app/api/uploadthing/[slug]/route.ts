import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing";

export const runtime = "nodejs";

// Export the route handler with our file router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    // You can add custom configuration here
    callbackUrl: process.env.UPLOADTHING_URL,
  },
});
