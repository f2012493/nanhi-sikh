import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

/**
 * Upload router for handling file uploads
 * Files are uploaded to S3 and only URLs are returned
 */
export const uploadRouter = router({
  /**
   * Upload a child photo
   * Accepts base64 or file data and uploads to storage
   */
  uploadChildPhoto: protectedProcedure
    .input(
      z.object({
        base64Data: z.string().min(100), // Base64 encoded image
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 to buffer
        const base64String = input.base64Data.split(",")[1] || input.base64Data;
        const buffer = Buffer.from(base64String, "base64");

        // Validate file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error("Image file too large. Maximum size is 5MB.");
        }

        // Upload to storage
        const fileKey = `child-photos/${ctx.user.id}/${nanoid()}.jpg`;
        const { url, key } = await storagePut(fileKey, buffer, "image/jpeg");

        return {
          success: true,
          url,
          key,
        };
      } catch (error) {
        console.error("[Upload] Failed to upload child photo:", error);
        throw new Error("Failed to upload image. Please try again.");
      }
    }),

  /**
   * Upload a character photo
   */
  uploadCharacterPhoto: protectedProcedure
    .input(
      z.object({
        base64Data: z.string().min(100),
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 to buffer
        const base64String = input.base64Data.split(",")[1] || input.base64Data;
        const buffer = Buffer.from(base64String, "base64");

        // Validate file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error("Image file too large. Maximum size is 5MB.");
        }

        // Upload to storage
        const fileKey = `character-photos/${ctx.user.id}/${nanoid()}.jpg`;
        const { url, key } = await storagePut(fileKey, buffer, "image/jpeg");

        return {
          success: true,
          url,
          key,
        };
      } catch (error) {
        console.error("[Upload] Failed to upload character photo:", error);
        throw new Error("Failed to upload image. Please try again.");
      }
    }),
});
