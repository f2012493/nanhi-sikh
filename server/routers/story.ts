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
   * Expects childPhotoUrl to be a valid storage URL (not base64)
   */
  create: protectedProcedure
    .input(
      z.object({
        childName: z.string().min(1).max(255),
        childAge: z.number().min(2).max(10),
        childGender: z.enum(["male", "female", "other"]),
        childPhotoUrl: z.string().optional(), // Storage URL only
        childPhotoKey: z.string().optional(),
        language: z.enum(["en", "hi", "hinglish"]).default("en"),
        parentingChallenge: z.string().min(10).max(2000),
        childPersonality: z.string().max(1000).optional(),
        animationStyle: z.enum(["cartoon", "storybook", "magical"]).default("cartoon"),
        musicMood: z.enum(["playful", "calm", "adventurous"]).default("playful"),
        videoLength: z.enum(["short", "full"]).default("full"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Sanitize and prepare inputs
        const storyOrder = await createStoryOrder({
          userId: ctx.user.id,
          childName: input.childName.trim(),
          childAge: input.childAge,
          childGender: input.childGender,
          childPhotoUrl: input.childPhotoUrl || null,
          childPhotoKey: input.childPhotoKey || null,
          language: input.language,
          parentingChallenge: input.parentingChallenge.trim(),
          childPersonality: input.childPersonality ? input.childPersonality.trim() : null,
          animationStyle: input.animationStyle,
          musicMood: input.musicMood,
          videoLength: input.videoLength,
          renderStatus: "pending",
          paymentStatus: "pending",
          pricingTier: "preview",
        });

        return storyOrder;
      } catch (error) {
        console.error("[Story] Failed to create story order:", error);
        // Don't expose database errors to frontend
        throw new Error("Unable to create your video. Please try again.");
      }
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
   * Generate story script using LLM
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
      try {
        // Verify story ownership
        const story = await getStoryOrderById(input.storyOrderId);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found or unauthorized");
        }

        // Create prompt for LLM
        const characterContext = input.characterNames?.length
          ? `Supporting characters: ${input.characterNames.join(", ")}`
          : "";

        const prompt = `You are a children's story writer specializing in addressing parenting challenges through engaging narratives.

Create a 10-scene story in JSON format for a ${input.childAge}-year-old child named ${input.childName}.

Parenting Challenge: ${input.parentingChallenge}
Child Personality: ${input.childPersonality || "Not specified"}
${characterContext}
Language: ${input.language === "hi" ? "Hindi" : input.language === "hinglish" ? "Hinglish (Hindi-English mix)" : "English"}

Each scene must have exactly these fields:
- sceneNumber: number (1-10)
- narration: string (the voiceover text for this scene, in ${input.language === "hi" ? "Hindi" : input.language === "hinglish" ? "Hinglish" : "English"})
- visualDescription: string (detailed visual description for image generation)
- characterAction: string (what the main character is doing)
- hiddenLesson: string (the underlying lesson being taught)

Return ONLY valid JSON array of 10 scenes. No markdown, no code blocks, just pure JSON.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a JSON generator. Return only valid JSON, no markdown or explanations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        // Parse response
        const messageContent = response.choices[0]?.message?.content;
        if (!messageContent) {
          throw new Error("No response from LLM");
        }

        // Handle both string and array content types
        let content = typeof messageContent === "string" ? messageContent : "";
        if (Array.isArray(messageContent)) {
          const textContent = messageContent.find((c: any) => c.type === "text") as any;
          content = textContent?.text || "";
        }

        if (!content) {
          throw new Error("No text content in LLM response");
        }

        // Clean up response - remove markdown code blocks if present
        let jsonString = content;
        if (jsonString.includes("```json")) {
          jsonString = jsonString.split("```json")[1].split("```")[0];
        } else if (jsonString.includes("```")) {
          jsonString = jsonString.split("```")[1].split("```")[0];
        }

        const scenes = JSON.parse(jsonString.trim());

        // Validate scenes
        if (!Array.isArray(scenes) || scenes.length !== 10) {
          throw new Error("Invalid scene count");
        }

        scenes.forEach((scene, index) => {
          StorySceneSchema.parse(scene);
        });

        // Save script to database
        await updateStoryOrder(input.storyOrderId, {
          storyScript: JSON.stringify(scenes),
          renderStatus: "pending",
        });

        return scenes;
      } catch (error) {
        console.error("[Story] Failed to generate script:", error);
        throw new Error("Unable to generate story script. Please try again.");
      }
    }),

  /**
   * Update story script with edited scenes
   */
  updateScript: protectedProcedure
    .input(
      z.object({
        storyOrderId: z.number(),
        scenes: z.array(StorySceneSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const story = await getStoryOrderById(input.storyOrderId);
      if (!story || story.userId !== ctx.user.id) {
        throw new Error("Story not found or unauthorized");
      }

      await updateStoryOrder(input.storyOrderId, {
        storyScript: JSON.stringify(input.scenes),
      });

      return { success: true };
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
      try {
        // Verify story ownership
        const story = await getStoryOrderById(input.storyOrderId);
        if (!story || story.userId !== ctx.user.id) {
          throw new Error("Story not found or unauthorized");
        }

        await createStoryFeedback({
          storyOrderId: input.storyOrderId,
          feedbackType: input.feedbackType,
          notes: input.notes,
        });

        return { success: true };
      } catch (error) {
        console.error("[Story] Failed to submit feedback:", error);
        throw new Error("Unable to submit feedback. Please try again.");
      }
    }),
});
