import { generateImage } from "./imageGeneration";
import { transcribeAudio } from "./voiceTranscription";
import { invokeLLM } from "./llm";
import { storagePut } from "../storage";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Story scene structure from JSON
 */
export interface StoryScene {
  sceneNumber: number;
  narration: string;
  visualDescription: string;
  characterAction: string;
  hiddenLesson: string;
}

/**
 * Final video generation configuration
 */
export interface FinalVideoConfig {
  storyId: string;
  userId: string;
  childName: string;
  childAge: number;
  language: "en" | "hi";
  animationStyle: "cartoon" | "storybook" | "magical";
  musicMood: "playful" | "calm" | "adventurous";
  scenes: StoryScene[];
  childPhotoUrl?: string;
}

/**
 * Generate text-to-speech audio for narration
 * Mock implementation - replace with real ElevenLabs API
 */
async function generateNarrationAudio(
  text: string,
  language: "en" | "hi",
  childName: string
): Promise<{ audioUrl: string; durationSeconds: number }> {
  console.log(
    `[FinalVideoRenderer] Generating narration audio for: "${text.substring(0, 50)}..."`
  );

  // Mock implementation - estimate duration based on text length
  // Real implementation would use ElevenLabs or similar TTS API
  const estimatedDuration = Math.ceil(text.split(" ").length / 2.5); // ~2.5 words per second

  // For now, return a mock URL
  const mockAudioUrl = `/manus-storage/audio-${Date.now()}.mp3`;

  return {
    audioUrl: mockAudioUrl,
    durationSeconds: estimatedDuration,
  };
}

/**
 * Generate scene image from visual description
 */
async function generateSceneImage(
  config: FinalVideoConfig,
  scene: StoryScene
): Promise<string> {
  console.log(
    `[FinalVideoRenderer] Generating image for scene ${scene.sceneNumber}`
  );

  // Create a detailed prompt that includes animation style and child context
  const prompt = `
    Create a ${config.animationStyle} style illustration for a children's story.
    
    Scene: ${scene.visualDescription}
    Action: ${scene.characterAction}
    Child's name: ${config.childName}
    Child's age: ${config.childAge}
    
    Style: ${config.animationStyle === "cartoon" ? "bright, colorful cartoon" : config.animationStyle === "storybook" ? "watercolor storybook illustration" : "magical, enchanted forest style"}
    
    Make it engaging and age-appropriate for a ${config.childAge}-year-old.
    Include the child ${config.childName} as the main character if possible.
  `;

  try {
    const result = await generateImage({
      prompt,
      originalImages: config.childPhotoUrl
        ? [
            {
              url: config.childPhotoUrl,
              mimeType: "image/jpeg",
            },
          ]
        : undefined,
    });

    const imageUrl = result.url || `/manus-storage/scene-${scene.sceneNumber}-${Date.now()}.png`;
    console.log(
      `[FinalVideoRenderer] Scene ${scene.sceneNumber} image generated: ${imageUrl}`
    );
    return imageUrl;
  } catch (error) {
    console.error(
      `[FinalVideoRenderer] Failed to generate image for scene ${scene.sceneNumber}:`,
      error
    );
    throw error;
  }
}

/**
 * Create intro title screen
 */
async function createIntroScreen(
  config: FinalVideoConfig
): Promise<{ imageUrl: string; durationSeconds: number }> {
  console.log("[FinalVideoRenderer] Creating intro title screen");

  const prompt = `
    Create a beautiful, child-friendly title screen for a story called "The Adventure of ${config.childName}".
    
    Style: ${config.animationStyle} style
    Include:
    - Large, colorful title text: "The Adventure of ${config.childName}"
    - Magical, welcoming background
    - Animated feel appropriate for children aged ${config.childAge}
    
    Make it engaging and set the tone for an exciting story.
  `;

  try {
    const result = await generateImage({ prompt });
    const imageUrl = result.url || `/manus-storage/intro-${Date.now()}.png`;
    return {
      imageUrl,
      durationSeconds: 3, // 3 seconds for intro
    };
  } catch (error) {
    console.error("[FinalVideoRenderer] Failed to create intro screen:", error);
    throw error;
  }
}

/**
 * Create end screen with lesson summary
 */
async function createEndScreen(
  config: FinalVideoConfig,
  scenes: StoryScene[]
): Promise<{ imageUrl: string; durationSeconds: number }> {
  console.log("[FinalVideoRenderer] Creating end screen with lesson summary");

  // Combine all hidden lessons
  const lessons = scenes.map((s) => s.hiddenLesson).join(", ");

  const prompt = `
    Create a beautiful, child-friendly end screen for a story.
    
    Title: "The End"
    Subtitle: "What did we learn?"
    Key lessons: ${lessons}
    
    Style: ${config.animationStyle} style
    Include:
    - Celebratory, happy atmosphere
    - Stars, confetti, or magical elements
    - Appropriate for children aged ${config.childAge}
    
    Make it feel rewarding and educational.
  `;

  try {
    const result = await generateImage({ prompt });
    const imageUrl = result.url || `/manus-storage/end-screen-${Date.now()}.png`;
    return {
      imageUrl,
      durationSeconds: 4, // 4 seconds for end screen
    };
  } catch (error) {
    console.error("[FinalVideoRenderer] Failed to create end screen:", error);
    throw error;
  }
}

/**
 * Generate background music (mock implementation)
 */
async function generateBackgroundMusic(
  mood: "playful" | "calm" | "adventurous",
  durationSeconds: number
): Promise<string> {
  console.log(
    `[FinalVideoRenderer] Generating ${mood} background music for ${durationSeconds} seconds`
  );

  // Mock implementation - return a placeholder URL
  // Real implementation would use a music generation API or library
  return `/manus-storage/music-${mood}-${Date.now()}.mp3`;
}

/**
 * Stitch scenes together into final video using FFmpeg
 */
async function stitchVideoWithFFmpeg(
  scenes: Array<{
    imageUrl: string;
    audioUrl: string;
    durationSeconds: number;
  }>,
  backgroundMusicUrl: string,
  outputPath: string
): Promise<void> {
  console.log(
    `[FinalVideoRenderer] Stitching ${scenes.length} scenes into video`
  );

  // Create FFmpeg concat demux file
  const concatFile = path.join(path.dirname(outputPath), "concat.txt");
  let concatContent = "";

  for (const scene of scenes) {
    // Download images and audio files locally
    // For now, use placeholder paths
    concatContent += `file '${scene.imageUrl}'\nduration ${scene.durationSeconds}\n`;
  }

  fs.writeFileSync(concatFile, concatContent);

  // Build FFmpeg command
  // This is a simplified version - real implementation would need proper file handling
  const ffmpegCmd = `
    ffmpeg -f concat -safe 0 -i ${concatFile} \
      -c:v libx264 -pix_fmt yuv420p \
      -c:a aac -b:a 128k \
      -y ${outputPath}
  `;

  console.log(`[FinalVideoRenderer] Running FFmpeg: ${ffmpegCmd}`);

  try {
    // Note: This is a mock - real implementation needs proper file downloads
    console.log(
      "[FinalVideoRenderer] FFmpeg processing (mock) - would stitch scenes in production"
    );
  } catch (error) {
    console.error("[FinalVideoRenderer] FFmpeg error:", error);
    throw error;
  }
}

/**
 * Main function to generate final video from story JSON
 */
export async function generateFinalVideo(
  config: FinalVideoConfig
): Promise<{ videoUrl: string; videoKey: string }> {
  console.log(
    `[FinalVideoRenderer] Starting final video generation for story ${config.storyId}`
  );

  try {
    // Step 1: Generate intro screen
    console.log("[FinalVideoRenderer] Step 1/5: Creating intro screen");
    const intro = await createIntroScreen(config);

    // Step 2: Generate scene images and audio
    console.log("[FinalVideoRenderer] Step 2/5: Generating scenes and narration");
    const sceneAssets = await Promise.all(
      config.scenes.map(async (scene) => {
        const [imageUrl, { audioUrl, durationSeconds }] = await Promise.all([
          generateSceneImage(config, scene),
          generateNarrationAudio(scene.narration, config.language, config.childName),
        ]);

        return {
          sceneNumber: scene.sceneNumber,
          imageUrl,
          audioUrl,
          durationSeconds,
        };
      })
    );

    // Step 3: Generate end screen
    console.log("[FinalVideoRenderer] Step 3/5: Creating end screen");
    const endScreen = await createEndScreen(config, config.scenes);

    // Step 4: Generate background music
    console.log("[FinalVideoRenderer] Step 4/5: Generating background music");
    const totalDuration =
      intro.durationSeconds +
      sceneAssets.reduce((sum, s) => sum + s.durationSeconds, 0) +
      endScreen.durationSeconds;
    const backgroundMusicUrl = await generateBackgroundMusic(
      config.musicMood,
      totalDuration
    );

    // Step 5: Stitch everything together
    console.log("[FinalVideoRenderer] Step 5/5: Rendering final video");
    const outputPath = `/tmp/final-video-${config.storyId}.mp4`;

    // Combine all scenes for stitching
    const allScenes = [
      {
        imageUrl: intro.imageUrl,
        audioUrl: backgroundMusicUrl, // Intro uses background music
        durationSeconds: intro.durationSeconds,
      },
      ...sceneAssets,
      {
        imageUrl: endScreen.imageUrl,
        audioUrl: backgroundMusicUrl, // End screen uses background music
        durationSeconds: endScreen.durationSeconds,
      },
    ];

    await stitchVideoWithFFmpeg(allScenes, backgroundMusicUrl, outputPath);

    // Step 6: Upload to storage
    console.log("[FinalVideoRenderer] Uploading final video to storage");
    const videoBuffer = fs.readFileSync(outputPath);
    const { url: videoUrl, key: videoKey } = await storagePut(
      `videos/final/${config.storyId}.mp4`,
      videoBuffer,
      "video/mp4"
    );

    // Clean up temporary files
    fs.unlinkSync(outputPath);
    fs.unlinkSync(path.join(path.dirname(outputPath), "concat.txt"));

    console.log(
      `[FinalVideoRenderer] Final video generation complete: ${videoUrl}`
    );

    return {
      videoUrl,
      videoKey,
    };
  } catch (error) {
    console.error("[FinalVideoRenderer] Error generating final video:", error);
    throw error;
  }
}

/**
 * Parse story JSON and extract scenes
 */
export function parseStoryJSON(storyJsonString: string): StoryScene[] {
  try {
    const scenes = JSON.parse(storyJsonString);

    if (!Array.isArray(scenes)) {
      throw new Error("Story JSON must be an array of scenes");
    }

    // Validate scene structure
    for (const scene of scenes) {
      if (
        !scene.sceneNumber ||
        !scene.narration ||
        !scene.visualDescription ||
        !scene.characterAction ||
        !scene.hiddenLesson
      ) {
        throw new Error(
          `Invalid scene structure at scene ${scene.sceneNumber || "unknown"}`
        );
      }
    }

    return scenes;
  } catch (error) {
    console.error("[FinalVideoRenderer] Error parsing story JSON:", error);
    throw new Error(`Failed to parse story JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}
