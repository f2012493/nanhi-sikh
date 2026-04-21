import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createStoryOrder,
  getStoryOrderById,
  getUserStoryOrders,
  updateStoryOrder,
  createRenderJob,
  getRenderJobByJobId,
  updateRenderJob,
  createStoryFeedback,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { nanoid } from "nanoid";

const StorySceneSchema = z.object({
  sceneNumber: z.number(),
  narration: z.string(),
  visualDescription: z.string(),
  characterAction: z.string(),
  hiddenLesson: z.string(),
});

export const storyRouter = router({
  /**
   * Create a new story order
   */
  create: protectedProcedure
    .input(
      z.object({
        childName: z.string().min(1),
        childAge: z.number().min(2).max(10),
        childGender: z.enum(["male", "female", "other"]),
        childPhotoUrl: z.string().optional(),
        childPhotoKey: z.string().optional(),
        language: z.enum(["en", "hi", "hinglish"]),
        parentingChallenge: z.string().min(10),
        childPersonality: z.string().optional(),
        animationStyle: z.enum(["cartoon", "storybook", "magical"]),
        musicMood: z.enum(["playful", "calm", "adventurous"]),
        videoLength: z.enum(["short", "full"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storyOrder = await createStoryOrder({
        userId: ctx.user.id,
        childName: input.childName,
        childAge: input.childAge,
        childGender: input.childGender,
        childPhotoUrl: input.childPhotoUrl,
        childPhotoKey: input.childPhotoKey,
        language: input.language,
        parentingChallenge: input.parentingChallenge,
        childPersonality: input.childPersonality,
        animationStyle: input.animationStyle,
        musicMood: input.musicMood,
        videoLength: input.videoLength,
        renderStatus: "pending",
        paymentStatus: "pending",
        pricingTier: "preview",
      });

      return storyOrder;
    }),

  /**
   * Get a specific story order by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const story = await getStoryOrderById(input.id);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Story not found or unauthorized");
      }
      return story;
    }),

  /**
   * Get all story orders for the current user
   */
  getUserStories: protectedProcedure.query(async ({ ctx }) => {
    return getUserStoryOrders(ctx.user.id);
  }),

  /**
   * Generate AI story script (10 scenes)
   */
  generateScript: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
        childName: z.string(),
        childAge: z.number(),
        language: z.enum(["en", "hi", "hinglish"]),
        parentingChallenge: z.string(),
        childPersonality: z.string().optional(),
        characterNames: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const story = await getStoryOrderById(input.storyOrderId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Build character list
      const characterList = input.characterNames?.join(", ") || "no additional characters";

      // Create prompt for GPT-4
      const systemPrompt = `You are a child psychologist and master storyteller. Create a 10-scene children's story that naturally teaches an important lesson without being preachy. The story should be engaging, age-appropriate, and feature the child as the hero.`;

      const userPrompt = `Create a 10-scene story for a ${input.childAge}-year-old child named ${input.childName} who is experiencing this challenge: "${input.parentingChallenge}". 
${input.childPersonality ? `Additional context about the child: ${input.childPersonality}` : ""}
Supporting characters: ${characterList}
Language: ${input.language}

Return a JSON array of exactly 10 scenes. Each scene must have:
- sceneNumber (1-10)
- narration (50 words max, in ${input.language})
- visualDescription (for image generation, descriptive)
- characterAction (what the character does)
- hiddenLesson (the lesson being taught)

Format as valid JSON array only, no markdown or extra text.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const scriptText = typeof content === "string" ? content : "[]";
        const scenes = JSON.parse(scriptText);

        // Validate the script structure
        const validatedScenes = z.array(StorySceneSchema).parse(scenes);

        // Update story with script
        await updateStoryOrder(input.storyOrderId, {
          storyScript: JSON.stringify(validatedScenes),
          renderStatus: "generating_images",
        });

        return validatedScenes;
      } catch (error) {
        console.error("Script generation error:", error);
        await updateStoryOrder(input.storyOrderId, {
          renderStatus: "failed",
        });
        throw new Error("Failed to generate story script");
      }
    }),

  /**
   * Start video rendering job
   */
  startRender: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const story = await getStoryOrderById(input.storyOrderId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      if (!story.storyScript) {
        throw new Error("Story script not generated yet");
      }

      const jobId = nanoid();

      // Create render job
      await createRenderJob({
        storyOrderId: input.storyOrderId,
        jobId,
        status: "queued",
        progress: 0,
        currentStep: "pending",
      });

      // Update story order with job ID
      await updateStoryOrder(input.storyOrderId, {
        renderJobId: jobId,
        renderStatus: "generating_images",
      });

      // TODO: Queue async video rendering job (e.g., with Bull/BullMQ or similar)
      // For now, just return the job ID
      return { jobId };
    }),

  /**
   * Get render job status
   */
  getRenderStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const job = await getRenderJobByJobId(input.jobId);
      if (!job) {
        throw new Error("Job not found");
      }
      return job;
    }),

  /**
   * Submit feedback on story effectiveness
   */
  submitFeedback: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
        feedbackType: z.enum(["worked", "partial", "not_worked"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const story = await getStoryOrderById(input.storyOrderId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const feedback = await createStoryFeedback({
        storyOrderId: input.storyOrderId,
        feedbackType: input.feedbackType,
        notes: input.notes,
      });

      return feedback;
    }),
});
