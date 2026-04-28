import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { storyOrders, finalVideoRenderJobs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  generateFinalVideo,
  parseStoryJSON,
  type FinalVideoConfig,
} from "../_core/finalVideoRenderer";

export const finalVideoRouter = router({
  /**
   * Start final video generation from story JSON
   */
  startFinalVideoGeneration: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Fetch the story order
        const story = await db
          .select()
          .from(storyOrders)
          .where(eq(storyOrders.id, input.storyOrderId))
          .limit(1);

        if (story.length === 0) {
          throw new Error("Story not found");
        }

        const storyOrder = story[0];

        // Verify user owns this story
        if (storyOrder.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Check if story script exists
        if (!storyOrder.storyScript) {
          throw new Error("Story script not generated yet");
        }

        // Parse story JSON
        const scenes = parseStoryJSON(storyOrder.storyScript);

        if (scenes.length === 0) {
          throw new Error("Story has no scenes");
        }

        // Create render job
        const jobId = `final-video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const renderJob = await db
          .insert(finalVideoRenderJobs)
          .values({
            storyOrderId: input.storyOrderId,
            jobId,
            status: "processing",
            stage: "reading_story",
            progress: 0,
          })
          .$returningId();

        const renderJobId = renderJob[0]?.id;
        if (!renderJobId) {
          throw new Error("Failed to create render job");
        }

        // Update story order with job ID
        await db
          .update(storyOrders)
          .set({
            finalVideoJobId: jobId,
            finalVideoStatus: "reading_story",
            finalVideoProgress: 0,
            finalVideoStage: "reading_story",
          })
          .where(eq(storyOrders.id, input.storyOrderId));

        // Start video generation in background
        generateFinalVideoAsync(
          {
            storyId: input.storyOrderId.toString(),
            userId: ctx.user.id.toString(),
            childName: storyOrder.childName,
            childAge: storyOrder.childAge,
            language: storyOrder.language as "en" | "hi",
            animationStyle: storyOrder.animationStyle as "cartoon" | "storybook" | "magical",
            musicMood: storyOrder.musicMood as "playful" | "calm" | "adventurous",
            scenes,
            childPhotoUrl: storyOrder.childPhotoUrl || undefined,
          },
          renderJobId,
          input.storyOrderId
        ).catch((error) => {
          console.error("[Final Video Router] Background generation failed:", error);
        });

        return {
          jobId: renderJobId,
          status: "processing",
          message: "Final video generation started",
        };
      } catch (error) {
        console.error("[Final Video Router] Error starting video generation:", error);
        throw error;
      }
    }),

  /**
   * Get final video generation status
   */
  getFinalVideoStatus: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Fetch the story order
        const story = await db
          .select()
          .from(storyOrders)
          .where(eq(storyOrders.id, input.storyOrderId))
          .limit(1);

        if (story.length === 0) {
          throw new Error("Story not found");
        }

        const storyOrder = story[0];

        // Verify user owns this story
        if (storyOrder.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        return {
          status: storyOrder.finalVideoStatus,
          progress: storyOrder.finalVideoProgress,
          stage: storyOrder.finalVideoStage,
          videoUrl: storyOrder.finalVideoUrl,
          isComplete: storyOrder.finalVideoStatus === "completed",
        };
      } catch (error) {
        console.error("[Final Video Router] Error getting status:", error);
        throw error;
      }
    }),

  /**
   * Get download link for final video
   */
  downloadFinalVideo: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Fetch the story order
        const story = await db
          .select()
          .from(storyOrders)
          .where(eq(storyOrders.id, input.storyOrderId))
          .limit(1);

        if (story.length === 0) {
          throw new Error("Story not found");
        }

        const storyOrder = story[0];

        // Verify user owns this story
        if (storyOrder.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        if (!storyOrder.finalVideoUrl) {
          throw new Error("Video not ready for download");
        }

        return {
          downloadUrl: storyOrder.finalVideoUrl,
          fileName: `${storyOrder.childName}-story.mp4`,
        };
      } catch (error) {
        console.error("[Final Video Router] Error getting download link:", error);
        throw error;
      }
    }),

  /**
   * Retry final video generation
   */
  retryFinalVideoGeneration: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Fetch the story order
        const story = await db
          .select()
          .from(storyOrders)
          .where(eq(storyOrders.id, input.storyOrderId))
          .limit(1);

        if (story.length === 0) {
          throw new Error("Story not found");
        }

        const storyOrder = story[0];

        // Verify user owns this story
        if (storyOrder.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        if (!storyOrder.storyScript) {
          throw new Error("Story script not generated yet");
        }

        const scenes = parseStoryJSON(storyOrder.storyScript);
        if (scenes.length === 0) {
          throw new Error("Story has no scenes");
        }

        // Reset status
        await db
          .update(storyOrders)
          .set({
            finalVideoStatus: "reading_story",
            finalVideoProgress: 0,
            finalVideoStage: "reading_story",
            finalVideoUrl: null,
            finalVideoKey: null,
          })
          .where(eq(storyOrders.id, input.storyOrderId));

        // Create a new render job and restart generation
        const jobId = `final-video-retry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const renderJob = await db
          .insert(finalVideoRenderJobs)
          .values({
            storyOrderId: input.storyOrderId,
            jobId,
            status: "processing",
            stage: "reading_story",
            progress: 0,
          })
          .$returningId();

        const renderJobId = renderJob[0]?.id;
        if (!renderJobId) {
          throw new Error("Failed to create render job");
        }

        await db
          .update(storyOrders)
          .set({ finalVideoJobId: jobId })
          .where(eq(storyOrders.id, input.storyOrderId));

        generateFinalVideoAsync(
          {
            storyId: input.storyOrderId.toString(),
            userId: ctx.user.id.toString(),
            childName: storyOrder.childName,
            childAge: storyOrder.childAge,
            language: storyOrder.language as "en" | "hi",
            animationStyle: storyOrder.animationStyle as "cartoon" | "storybook" | "magical",
            musicMood: storyOrder.musicMood as "playful" | "calm" | "adventurous",
            scenes,
            childPhotoUrl: storyOrder.childPhotoUrl || undefined,
          },
          renderJobId,
          input.storyOrderId
        ).catch((error) => {
          console.error("[Final Video Router] Retry background generation failed:", error);
        });

        return {
          jobId: renderJobId,
          message: "Retrying video generation",
          storyOrderId: input.storyOrderId,
        };
      } catch (error) {
        console.error("[Final Video Router] Error retrying video generation:", error);
        throw error;
      }
    }),
});

/**
 * Async final video generation function
 * Runs in background and updates render job status
 */
async function generateFinalVideoAsync(
  config: FinalVideoConfig,
  jobId: number,
  storyOrderId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[Final Video] Database not available");
    return;
  }

  try {
    // Update job status to processing
    await db
      .update(finalVideoRenderJobs)
      .set({ status: "processing", progress: 10, stage: "reading_story" })
      .where(eq(finalVideoRenderJobs.id, jobId));

    // Update story order
    await db
      .update(storyOrders)
      .set({
        finalVideoStatus: "reading_story",
        finalVideoProgress: 10,
        finalVideoStage: "reading_story",
      })
      .where(eq(storyOrders.id, storyOrderId));

    // Generate video
    console.log("[Final Video] Starting video generation process");

    // Update progress: generating scenes
    await db
      .update(finalVideoRenderJobs)
      .set({ progress: 25, stage: "generating_scenes" })
      .where(eq(finalVideoRenderJobs.id, jobId));

    await db
      .update(storyOrders)
      .set({
        finalVideoStatus: "generating_scenes",
        finalVideoProgress: 25,
        finalVideoStage: "generating_scenes",
      })
      .where(eq(storyOrders.id, storyOrderId));

    // Update progress: creating narration
    await db
      .update(finalVideoRenderJobs)
      .set({ progress: 50, stage: "creating_narration" })
      .where(eq(finalVideoRenderJobs.id, jobId));

    await db
      .update(storyOrders)
      .set({
        finalVideoStatus: "creating_narration",
        finalVideoProgress: 50,
        finalVideoStage: "creating_narration",
      })
      .where(eq(storyOrders.id, storyOrderId));

    // Update progress: rendering video
    await db
      .update(finalVideoRenderJobs)
      .set({ progress: 75, stage: "rendering_video" })
      .where(eq(finalVideoRenderJobs.id, jobId));

    await db
      .update(storyOrders)
      .set({
        finalVideoStatus: "rendering_video",
        finalVideoProgress: 75,
        finalVideoStage: "rendering_video",
      })
      .where(eq(storyOrders.id, storyOrderId));

    // Generate the actual video
    const result = await generateFinalVideo(config);

    // Update progress: finalizing export
    await db
      .update(finalVideoRenderJobs)
      .set({ progress: 90, stage: "finalizing_export" })
      .where(eq(finalVideoRenderJobs.id, jobId));

    await db
      .update(storyOrders)
      .set({
        finalVideoStatus: "finalizing_export",
        finalVideoProgress: 90,
        finalVideoStage: "finalizing_export",
      })
      .where(eq(storyOrders.id, storyOrderId));

    // Update render job with success
    await db
      .update(finalVideoRenderJobs)
      .set({
        status: "completed",
        progress: 100,
        stage: "completed",
        completedAt: new Date(),
      })
      .where(eq(finalVideoRenderJobs.id, jobId));

    // Update story order with video URL
    await db
      .update(storyOrders)
      .set({
        finalVideoUrl: result.videoUrl,
        finalVideoKey: result.videoKey,
        finalVideoStatus: "completed",
        finalVideoProgress: 100,
        finalVideoStage: "completed",
      })
      .where(eq(storyOrders.id, storyOrderId));

    console.log("[Final Video] Video generation completed successfully");
  } catch (error) {
    console.error("[Final Video] Video generation failed:", error);

    // Update render job with error
    try {
      await db
        .update(finalVideoRenderJobs)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        })
        .where(eq(finalVideoRenderJobs.id, jobId));

      await db
        .update(storyOrders)
        .set({
          finalVideoStatus: "failed",
          finalVideoStage: "error",
        })
        .where(eq(storyOrders.id, storyOrderId));
    } catch (updateError) {
      console.error("[Final Video] Failed to update error status:", updateError);
    }
  }
}
