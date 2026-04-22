import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { generateVideo, type VideoGenerationConfig, type StoryScene } from "../_core/videoGeneration";
import { getDb } from "../db";

/**
 * Video generation router
 * Handles async video generation jobs and status tracking
 */
export const videoRouter = router({
  /**
   * Start video generation for a story
   */
  generateStoryVideo: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
        childName: z.string(),
        childAge: z.number(),
        language: z.enum(["en", "hi"]),
        animationStyle: z.string(),
        musicMood: z.string(),
        storyScript: z.string(), // JSON string of story scenes
        childPhotoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Parse story script
        let scenes: StoryScene[] = [];
        try {
          const scriptData = JSON.parse(input.storyScript);
          // Handle both direct array and wrapped object
          scenes = Array.isArray(scriptData) ? scriptData : scriptData.scenes || [];
        } catch (error) {
          console.error("[Video Router] Failed to parse story script:", error);
          throw new Error("Invalid story script format");
        }

        if (!Array.isArray(scenes) || scenes.length === 0) {
          throw new Error("Story script must contain at least one scene");
        }

        // Create render job record
        const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const renderJob = await db
          .insert(renderJobs)
          .values({
            storyOrderId: input.storyOrderId,
            jobId,
            status: "processing",
            progress: 0,
            currentStep: "initializing",
          })
          .$returningId();

        const renderJobId = renderJob[0]?.id;
        if (!renderJobId) {
          throw new Error("Failed to create render job");
        }

        // Start video generation in background
        generateVideoAsync(
          {
            storyId: input.storyOrderId.toString(),
            userId: ctx.user.id.toString(),
            childName: input.childName,
            childAge: input.childAge,
            language: input.language as "en" | "hi",
            animationStyle: input.animationStyle,
            musicMood: input.musicMood,
            scenes,
            childPhotoUrl: input.childPhotoUrl,
          },
          renderJobId,
          input.storyOrderId
        ).catch((error) => {
          console.error("[Video Router] Background video generation failed:", error);
        });

        return {
          jobId: renderJobId,
          status: "processing",
          message: "Video generation started",
        };
      } catch (error) {
        console.error("[Video Router] Error starting video generation:", error);
        throw error;
      }
    }),

  /**
   * Get video generation status
   */
  getVideoStatus: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const job = await db
          .select()
          .from(renderJobs)
          .where(eq(renderJobs.id, input.jobId))
          .limit(1);

        if (job.length === 0) {
          throw new Error("Render job not found");
        }

        return {
          jobId: job[0].id,
          status: job[0].status,
          progress: job[0].progress,
          currentStep: job[0].currentStep,
          errorMessage: job[0].errorMessage,
          completedAt: job[0].completedAt,
        };
      } catch (error) {
        console.error("[Video Router] Error getting video status:", error);
        throw error;
      }
    }),

  /**
   * Get all videos for current user
   */
  getUserVideos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const videos = await db
        .select({
          id: storyOrders.id,
          childName: storyOrders.childName,
          videoUrl: storyOrders.videoUrl,
          createdAt: storyOrders.createdAt,
          renderStatus: storyOrders.renderStatus,
          renderProgress: storyOrders.renderProgress,
        })
        .from(storyOrders)
        .where(eq(storyOrders.userId, ctx.user.id))
        .orderBy(desc(storyOrders.createdAt));

      return videos;
    } catch (error) {
      console.error("[Video Router] Error getting user videos:", error);
      throw error;
    }
  }),

  /**
   * Delete video (for compliance - auto-deletion after 30 days)
   */
  deleteVideo: protectedProcedure
    .input(z.object({ storyOrderId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Verify ownership
        const story = await db
          .select()
          .from(storyOrders)
          .where(eq(storyOrders.id, input.storyOrderId))
          .limit(1);

        if (story.length === 0) {
          throw new Error("Story not found");
        }

        if (story[0].userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Delete associated render jobs
        await db.delete(renderJobs).where(eq(renderJobs.storyOrderId, input.storyOrderId));

        // Delete story order
        await db.delete(storyOrders).where(eq(storyOrders.id, input.storyOrderId));

        return { success: true };
      } catch (error) {
        console.error("[Video Router] Error deleting video:", error);
        throw error;
      }
    }),
});

/**
 * Async video generation function
 * Runs in background and updates render job status
 */
async function generateVideoAsync(
  config: VideoGenerationConfig,
  jobId: number,
  storyOrderId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[Video Generation] Database not available");
    return;
  }

  try {
  // Update job status to processing
  await db
    .update(renderJobs)
    .set({ status: "processing", progress: 10, currentStep: "generating_images" })
    .where(eq(renderJobs.id, jobId));

  // Generate video
    const result = await generateVideo(config);

    if (result.status === "success") {
      // Update render job with success
      await db
        .update(renderJobs)
        .set({
          status: "completed",
          progress: 100,
          currentStep: "completed",
          completedAt: new Date(),
        })
        .where(eq(renderJobs.id, jobId));

      // Update story order with video URL
      await db
        .update(storyOrders)
        .set({
          videoUrl: result.videoUrl,
          videoKey: `videos/${config.storyId}`,
          renderStatus: "completed",
          renderProgress: 100,
        })
        .where(eq(storyOrders.id, storyOrderId));

      console.log(`[Video Generation] Video generated successfully for story ${storyOrderId}`);
    } else {
      // Update render job with error
      await db
        .update(renderJobs)
        .set({
          status: "failed",
          errorMessage: result.error,
          completedAt: new Date(),
        })
        .where(eq(renderJobs.id, jobId));

      console.error(`[Video Generation] Video generation failed for story ${storyOrderId}:`, result.error);
    }
  } catch (error) {
    console.error("[Video Generation] Async video generation error:", error);

    // Update render job with error
    try {
      await db
        .update(renderJobs)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        })
        .where(eq(renderJobs.id, jobId));
    } catch (updateError) {
      console.error("[Video Generation] Failed to update render job:", updateError);
    }
  }
}

// Import database types
import { eq, desc } from "drizzle-orm";
import { storyOrders, renderJobs } from "../../drizzle/schema";
