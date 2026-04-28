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
): Promise<{ audioUrl: string | null; durationSeconds: number }> {
  console.log(
    `[FinalVideoRenderer] Generating narration audio for: "${text.substring(0, 50)}..."`
  );

  // Mock implementation - estimate duration based on text length
  // Real implementation would use ElevenLabs or similar TTS API
  const estimatedDuration = Math.ceil(text.split(" ").length / 2.5); // ~2.5 words per second

  // Return null URL so stitching uses silence instead of a fake path
  return {
    audioUrl: null,
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
): Promise<string | null> {
  console.log(
    `[FinalVideoRenderer] Generating ${mood} background music for ${durationSeconds} seconds`
  );

  // Return null - real implementation would use a music generation API
  return null;
}

/**
 * Resolve a possibly-relative /manus-storage URL to an absolute URL for fetching.
 */
function resolveStorageUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = process.env.SERVER_BASE_URL || "http://localhost:3000";
  return `${base}${url}`;
}

/**
 * Download a remote URL to a local file. Returns false if download fails.
 */
async function downloadToFile(url: string, localPath: string): Promise<boolean> {
  try {
    const resolved = resolveStorageUrl(url);
    const response = await fetch(resolved);
    if (!response.ok) return false;
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stitch scenes together into final video using FFmpeg
 */
async function stitchVideoWithFFmpeg(
  scenes: Array<{
    imageUrl: string;
    audioUrl: string | null;
    durationSeconds: number;
  }>,
  backgroundMusicUrl: string | null,
  outputPath: string
): Promise<void> {
  console.log(
    `[FinalVideoRenderer] Stitching ${scenes.length} scenes into video`
  );

  const tempDir = path.dirname(outputPath);
  const segmentPaths: string[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const imagePath = path.join(tempDir, `scene-img-${i}.png`);
    const segPath = path.join(tempDir, `segment-${i}.mp4`);

    // Download scene image
    const imageOk = await downloadToFile(scene.imageUrl, imagePath);
    if (!imageOk) {
      console.warn(`[FinalVideoRenderer] Skipping scene ${i}: image download failed (${scene.imageUrl})`);
      continue;
    }

    // Try to download audio (optional)
    let audioPath: string | null = null;
    if (scene.audioUrl) {
      const ap = path.join(tempDir, `scene-audio-${i}.mp3`);
      if (await downloadToFile(scene.audioUrl, ap)) {
        audioPath = ap;
      }
    }

    // Build per-scene FFmpeg command
    const videoFilter = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24,format=yuv420p";
    let segCmd: string;
    if (audioPath) {
      segCmd = `ffmpeg -y -loop 1 -i "${imagePath}" -i "${audioPath}" -vf "${videoFilter}" -c:v libx264 -c:a aac -t ${scene.durationSeconds} -shortest "${segPath}"`;
    } else {
      segCmd = `ffmpeg -y -loop 1 -i "${imagePath}" -f lavfi -i anullsrc=r=44100:cl=stereo -vf "${videoFilter}" -c:v libx264 -c:a aac -t ${scene.durationSeconds} "${segPath}"`;
    }

    console.log(`[FinalVideoRenderer] Rendering segment ${i}`);
    execSync(segCmd, { stdio: "pipe" });
    segmentPaths.push(segPath);
  }

  if (segmentPaths.length === 0) {
    throw new Error("No scene segments could be rendered — check that images are accessible");
  }

  // Concatenate all segments
  const concatFile = path.join(tempDir, "concat.txt");
  fs.writeFileSync(concatFile, segmentPaths.map((p) => `file '${p}'`).join("\n"));

  const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`;
  console.log(`[FinalVideoRenderer] Concatenating ${segmentPaths.length} segments`);
  execSync(concatCmd, { stdio: "pipe" });
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
        const [imageUrl, narration] = await Promise.all([
          generateSceneImage(config, scene),
          generateNarrationAudio(scene.narration, config.language, config.childName),
        ]);

        return {
          sceneNumber: scene.sceneNumber,
          imageUrl,
          audioUrl: narration.audioUrl,
          durationSeconds: narration.durationSeconds,
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
        audioUrl: backgroundMusicUrl,
        durationSeconds: intro.durationSeconds,
      },
      ...sceneAssets,
      {
        imageUrl: endScreen.imageUrl,
        audioUrl: backgroundMusicUrl,
        durationSeconds: endScreen.durationSeconds,
      },
    ];

    await stitchVideoWithFFmpeg(allScenes, backgroundMusicUrl, outputPath);

    if (!fs.existsSync(outputPath)) {
      throw new Error("FFmpeg did not produce an output file");
    }

    // Step 6: Upload to storage
    console.log("[FinalVideoRenderer] Uploading final video to storage");
    const videoBuffer = fs.readFileSync(outputPath);
    const { url: videoUrl, key: videoKey } = await storagePut(
      `videos/final/${config.storyId}.mp4`,
      videoBuffer,
      "video/mp4"
    );

    // Clean up temporary files
    try { fs.unlinkSync(outputPath); } catch { /* ignore */ }
    try { fs.unlinkSync(path.join(path.dirname(outputPath), "concat.txt")); } catch { /* ignore */ }

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
