import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { invokeLLM } from "./llm";
import { generateImage } from "./imageGeneration";
import { transcribeAudio } from "./voiceTranscription";
import { storagePut } from "../storage";

/**
 * Story Scene structure from AI generation
 */
export interface StoryScene {
  sceneNumber: number;
  narration: string;
  visualDescription: string;
  characterAction: string;
  hiddenLesson: string;
}

/**
 * Video generation job configuration
 */
export interface VideoGenerationConfig {
  storyId: string;
  userId: string;
  childName: string;
  childAge: number;
  language: "en" | "hi";
  animationStyle: string;
  musicMood: string;
  scenes: StoryScene[];
  childPhotoUrl?: string;
  supportingCharacterUrls?: string[];
}

/**
 * Video generation result
 */
export interface VideoGenerationResult {
  videoUrl: string;
  duration: number;
  status: "success" | "failed";
  error?: string;
}

/**
 * Generate images for each scene using AI image generation
 */
export async function generateSceneImages(
  scenes: StoryScene[],
  animationStyle: string,
  childName: string,
  language: "en" | "hi",
  childPhotoUrl?: string
): Promise<string[]> {
  const imageUrls: string[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    // Create a detailed prompt for image generation
    const prompt = createImagePrompt(
      scene,
      animationStyle,
      childName,
      language,
      i + 1,
      scenes.length,
      childPhotoUrl
    );

    try {
      console.log(`[Video Generation] Generating image for scene ${i + 1}/${scenes.length}`);

      const result = await generateImage({
        prompt,
        originalImages: childPhotoUrl
          ? [{ url: childPhotoUrl, mimeType: "image/jpeg" }]
          : undefined,
      });

      if (result.url) {
        imageUrls.push(result.url);
      }
    } catch (error) {
      console.error(`[Video Generation] Failed to generate image for scene ${i + 1}:`, error);
      throw new Error(`Failed to generate image for scene ${i + 1}`);
    }
  }

  return imageUrls;
}

/**
 * Create a detailed image generation prompt
 */
function createImagePrompt(
  scene: StoryScene,
  animationStyle: string,
  childName: string,
  language: "en" | "hi",
  sceneNumber: number,
  totalScenes: number,
  _childPhotoUrl?: string
): string {
  const styleGuide = getAnimationStyleGuide(animationStyle);

  const prompt = `
Scene ${sceneNumber}/${totalScenes}: ${scene.visualDescription}

Character: A child named ${childName} performing: ${scene.characterAction}

Style: ${styleGuide}

Art Direction:
- Warm, engaging, and age-appropriate for children
- Bright, cheerful colors
- Clear character expressions showing emotion
- Safe, nurturing environment
- Consistency with previous scenes in the story

Narration Context: "${scene.narration}"

Create a beautiful, engaging scene that brings this moment to life for a young child.
`;

  return prompt;
}

/**
 * Get animation style guide
 */
function getAnimationStyleGuide(style: string): string {
  const guides: Record<string, string> = {
    cartoon: "Colorful cartoon style with exaggerated expressions, similar to Disney or Pixar animations",
    storybook: "Illustrated storybook style with watercolor-like textures, warm and gentle",
    magical: "Magical fantasy style with glowing effects, sparkles, and whimsical elements",
    realistic: "Realistic but child-friendly illustration style with soft, warm tones",
  };

  return guides[style] || guides.cartoon;
}

/**
 * Generate voiceover narration using TTS
 */
export async function generateVoiceover(
  scenes: StoryScene[],
  language: "en" | "hi",
  childName: string
): Promise<{ audioUrl: string; duration: number }[]> {
  const voiceoverData: { audioUrl: string; duration: number }[] = [];

  // Map language to voice ID (would need to be configured with actual TTS service)
  const voiceId = language === "hi" ? "hindi-female" : "english-female";

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    // Personalize narration with child's name
    const personalizedNarration = scene.narration.replace(/\{childName\}/g, childName);

    try {
      console.log(`[Video Generation] Generating voiceover for scene ${i + 1}/${scenes.length}`);

      // Call TTS service (using mock for now, would integrate with ElevenLabs or similar)
      const result = await generateTextToSpeech(personalizedNarration, voiceId, language);

      voiceoverData.push(result);
    } catch (error) {
      console.error(`[Video Generation] Failed to generate voiceover for scene ${i + 1}:`, error);
      throw new Error(`Failed to generate voiceover for scene ${i + 1}`);
    }
  }

  return voiceoverData;
}

/**
 * Generate text-to-speech audio
 */
async function generateTextToSpeech(
  text: string,
  voiceId: string,
  language: "en" | "hi"
): Promise<{ audioUrl: string; duration: number }> {
  // Mock implementation - would integrate with ElevenLabs API
  // For now, return a placeholder that would be replaced with real TTS

  const mockDuration = Math.ceil(text.split(" ").length / 2.5); // Rough estimate: 2.5 words per second

  return {
    audioUrl: `https://mock-tts-service.example.com/audio/${voiceId}/${Date.now()}.mp3`,
    duration: mockDuration,
  };
}

/**
 * Create video from images and voiceover using FFmpeg
 */
export async function createVideoWithFFmpeg(
  imageUrls: string[],
  voiceoverData: { audioUrl: string; duration: number }[],
  musicMood: string,
  outputPath: string
): Promise<number> {
  // Create temporary directory for processing
  const tempDir = path.join("/tmp", `video-gen-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Download images and voiceover files
    console.log("[Video Generation] Downloading assets...");
    const localImagePaths = await downloadAssets(imageUrls, tempDir, "image");
    const localAudioPaths = await downloadAssets(
      voiceoverData.map((v) => v.audioUrl),
      tempDir,
      "audio"
    );

    // Create FFmpeg filter complex
    const filterComplex = createFFmpegFilterComplex(
      localImagePaths,
      localAudioPaths,
      voiceoverData
    );

    // Build FFmpeg command
    const ffmpegCmd = buildFFmpegCommand(
      localImagePaths,
      localAudioPaths,
      filterComplex,
      musicMood,
      outputPath
    );

    console.log("[Video Generation] Running FFmpeg...");
    console.log("[Video Generation] Command:", ffmpegCmd);

    // Execute FFmpeg
    execSync(ffmpegCmd, { stdio: "inherit" });

    // Verify output file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error("FFmpeg failed to create output video");
    }

    // Get video duration
    const duration = getVideoDuration(outputPath);

    console.log(`[Video Generation] Video created successfully. Duration: ${duration}s`);

    return duration;
  } finally {
    // Cleanup temporary directory
    try {
      execSync(`rm -rf ${tempDir}`);
    } catch (error) {
      console.warn("[Video Generation] Failed to cleanup temp directory:", error);
    }
  }
}

/**
 * Download assets (images and audio) to local storage
 */
async function downloadAssets(
  urls: string[],
  tempDir: string,
  type: "image" | "audio"
): Promise<string[]> {
  const localPaths: string[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const ext = type === "image" ? "png" : "mp3";
    const localPath = path.join(tempDir, `${type}-${i}.${ext}`);

    try {
      console.log(`[Video Generation] Downloading ${type} ${i + 1}/${urls.length}`);
      const resolved = url.startsWith("http") ? url : `${process.env.SERVER_BASE_URL || "http://localhost:3000"}${url}`;
      const response = await fetch(resolved);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${resolved}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
      localPaths.push(localPath);
    } catch (error) {
      console.error(`[Video Generation] Failed to download ${type} from ${url}:`, error);
      throw error;
    }
  }

  return localPaths;
}

/**
 * Create FFmpeg filter complex for video composition
 */
function createFFmpegFilterComplex(
  imagePaths: string[],
  audioPaths: string[],
  voiceoverData: { audioUrl: string; duration: number }[]
): string {
  // Build filter complex that:
  // 1. Scales images to standard size
  // 2. Displays each image for duration of corresponding voiceover
  // 3. Adds fade transitions between scenes
  // 4. Combines audio tracks

  const filters: string[] = [];

  // Image sequence with durations
  for (let i = 0; i < imagePaths.length; i++) {
    const duration = voiceoverData[i]?.duration || 3;
    filters.push(`[${i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${i}]`);
  }

  // Concatenate video and audio
  let concat = "";
  for (let i = 0; i < imagePaths.length; i++) {
    concat += `[v${i}][${i}:a]`;
  }
  concat += `concat=n=${imagePaths.length}:v=1:a=1[outv][outa]`;

  filters.push(concat);

  return filters.join(";");
}

/**
 * Build FFmpeg command
 */
function buildFFmpegCommand(
  imagePaths: string[],
  audioPaths: string[],
  filterComplex: string,
  musicMood: string,
  outputPath: string
): string {
  let cmd = "ffmpeg -y";

  // Add image inputs
  for (const imagePath of imagePaths) {
    cmd += ` -loop 1 -i "${imagePath}"`;
  }

  // Add audio inputs
  for (const audioPath of audioPaths) {
    cmd += ` -i "${audioPath}"`;
  }

  // Add filter complex
  cmd += ` -filter_complex "${filterComplex}"`;

  // Add output options
  cmd += ` -c:v libx264 -preset medium -crf 23`;
  cmd += ` -c:a aac -b:a 128k`;
  cmd += ` -movflags +faststart`;
  cmd += ` "${outputPath}"`;

  return cmd;
}

/**
 * Get video duration using FFprobe
 */
function getVideoDuration(videoPath: string): number {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_wrappers=1 "${videoPath}"`,
      { encoding: "utf-8" }
    );

    return Math.round(parseFloat(output.trim()));
  } catch (error) {
    console.warn("[Video Generation] Failed to get video duration:", error);
    return 0;
  }
}

/**
 * Main video generation orchestrator
 */
export async function generateVideo(
  config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
  const outputPath = path.join("/tmp", `video-${config.storyId}-${Date.now()}.mp4`);

  try {
    console.log(`[Video Generation] Starting video generation for story ${config.storyId}`);

    // Step 1: Generate images for each scene
    console.log("[Video Generation] Step 1: Generating scene images...");
    const imageUrls = await generateSceneImages(
      config.scenes,
      config.animationStyle,
      config.childName,
      config.language,
      config.childPhotoUrl
    );

    // Step 2: Generate voiceover narration
    console.log("[Video Generation] Step 2: Generating voiceover narration...");
    const voiceoverData = await generateVoiceover(config.scenes, config.language, config.childName);

    // Step 3: Create video with FFmpeg
    console.log("[Video Generation] Step 3: Creating video with FFmpeg...");
    const duration = await createVideoWithFFmpeg(
      imageUrls,
      voiceoverData,
      config.musicMood,
      outputPath
    );

    // Step 4: Upload video to storage
    console.log("[Video Generation] Step 4: Uploading video to storage...");
    const videoUrl = await uploadVideoToStorage(outputPath, config.storyId);

    console.log(`[Video Generation] Video generation completed successfully`);

    return {
      videoUrl,
      duration,
      status: "success",
    };
  } catch (error) {
    console.error("[Video Generation] Video generation failed:", error);

    return {
      videoUrl: "",
      duration: 0,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    // Cleanup output file
    try {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    } catch (error) {
      console.warn("[Video Generation] Failed to cleanup output file:", error);
    }
  }
}

/**
 * Upload video to storage (S3)
 */
async function uploadVideoToStorage(videoPath: string, storyId: string): Promise<string> {
  const videoBuffer = fs.readFileSync(videoPath);
  const { url } = await storagePut(`videos/${storyId}-${Date.now()}.mp4`, videoBuffer, "video/mp4");
  console.log(`[Video Generation] Uploaded video: ${url}`);
  return url;
}
