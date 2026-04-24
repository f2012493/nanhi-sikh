import { generateImage } from "./imageGeneration";
import { storagePut, storageGetSignedUrl } from "../storage";
import { spawnSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
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

interface RenderedScene {
  sceneNumber: number;
  imageUrl: string;
  durationSeconds: number;
}

const SCENE_DURATION_FALLBACK_SECONDS = 5;

/**
 * Estimate narration duration from word count (~2.5 words/sec).
 * Used as the on-screen time per scene since real TTS is not yet wired up.
 */
function estimateNarrationDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return SCENE_DURATION_FALLBACK_SECONDS;
  return Math.max(3, Math.ceil(words / 2.5));
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

  const styleHint =
    config.animationStyle === "cartoon"
      ? "bright, colorful cartoon"
      : config.animationStyle === "storybook"
        ? "watercolor storybook illustration"
        : "magical, enchanted forest style";

  const prompt = `Create a ${config.animationStyle} style illustration for a children's story.

Scene: ${scene.visualDescription}
Action: ${scene.characterAction}
Child's name: ${config.childName}
Child's age: ${config.childAge}

Style: ${styleHint}
Make it engaging and age-appropriate for a ${config.childAge}-year-old.
Include the child ${config.childName} as the main character if possible.`;

  const result = await generateImage({
    prompt,
    originalImages: config.childPhotoUrl
      ? [{ url: config.childPhotoUrl, mimeType: "image/jpeg" }]
      : undefined,
  });

  if (!result.url) {
    throw new Error(
      `Image generation returned no URL for scene ${scene.sceneNumber}`
    );
  }

  console.log(
    `[FinalVideoRenderer] Scene ${scene.sceneNumber} image generated: ${result.url}`
  );
  return result.url;
}

/**
 * Create intro title screen
 */
async function createIntroScreen(
  config: FinalVideoConfig
): Promise<RenderedScene> {
  console.log("[FinalVideoRenderer] Creating intro title screen");

  const prompt = `Create a beautiful, child-friendly title screen for a story called "The Adventure of ${config.childName}".

Style: ${config.animationStyle} style.
Include large, colorful title text "The Adventure of ${config.childName}" on a magical, welcoming background.
Animated feel appropriate for children aged ${config.childAge}.`;

  const result = await generateImage({ prompt });
  if (!result.url) throw new Error("Image generation returned no URL for intro screen");

  return {
    sceneNumber: 0,
    imageUrl: result.url,
    durationSeconds: 3,
  };
}

/**
 * Create end screen with lesson summary
 */
async function createEndScreen(
  config: FinalVideoConfig,
  scenes: StoryScene[]
): Promise<RenderedScene> {
  console.log("[FinalVideoRenderer] Creating end screen with lesson summary");

  const lessons = scenes.map((s) => s.hiddenLesson).join(", ");
  const prompt = `Create a beautiful, child-friendly end screen for a story.

Title: "The End"
Subtitle: "What did we learn?"
Key lessons: ${lessons}

Style: ${config.animationStyle} style.
Celebratory, happy atmosphere with stars, confetti, or magical elements.
Appropriate for children aged ${config.childAge}.`;

  const result = await generateImage({ prompt });
  if (!result.url) throw new Error("Image generation returned no URL for end screen");

  return {
    sceneNumber: scenes.length + 1,
    imageUrl: result.url,
    durationSeconds: 4,
  };
}

/**
 * Resolve a storage URL (either a `/manus-storage/<key>` proxy path or a
 * fully-qualified URL) to something fetch() can download directly.
 */
async function resolveStorageUrl(url: string): Promise<string> {
  if (url.startsWith("/manus-storage/")) {
    const key = url.slice("/manus-storage/".length);
    return storageGetSignedUrl(key);
  }
  return url;
}

async function downloadToFile(url: string, destPath: string): Promise<void> {
  const resolved = await resolveStorageUrl(url);
  const response = await fetch(resolved);
  if (!response.ok) {
    throw new Error(
      `Failed to download asset ${url} (${response.status} ${response.statusText})`
    );
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error(`Downloaded asset ${url} is empty`);
  }
  fs.writeFileSync(destPath, buffer);
}

/**
 * Verify ffmpeg is installed and callable. Throws a user-friendly error if not.
 */
function ensureFfmpegAvailable(): void {
  const probe = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (probe.error || probe.status !== 0) {
    throw new Error(
      "ffmpeg is not installed or not on PATH. Install ffmpeg on the server to enable final video rendering."
    );
  }
}

/**
 * Stitch scene images into a slideshow MP4 using FFmpeg's concat demuxer.
 * Audio narration/music is intentionally omitted for now: the upstream TTS and
 * music generators are placeholders, so wiring fake audio paths into ffmpeg
 * would only cause spurious failures. The video is silent until those land.
 */
function stitchVideoWithFFmpeg(
  localImagePaths: Array<{ filePath: string; durationSeconds: number }>,
  outputPath: string,
  workDir: string
): void {
  if (localImagePaths.length === 0) {
    throw new Error("Cannot render video: no scenes provided");
  }

  const concatFile = path.join(workDir, "concat.txt");

  // FFmpeg concat demuxer requires each entry as `file '<path>'` followed by
  // `duration <seconds>`. The final image must be repeated without a duration
  // for the last frame to be honored — see ffmpeg concat demuxer docs.
  const lines: string[] = [];
  for (const { filePath, durationSeconds } of localImagePaths) {
    lines.push(`file '${filePath.replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${durationSeconds}`);
  }
  const last = localImagePaths[localImagePaths.length - 1];
  lines.push(`file '${last.filePath.replace(/'/g, "'\\''")}'`);

  fs.writeFileSync(concatFile, lines.join("\n"));

  const args = [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatFile,
    "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
    "-r", "30",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outputPath,
  ];

  console.log(`[FinalVideoRenderer] Running ffmpeg ${args.join(" ")}`);
  const result = spawnSync("ffmpeg", args, {
    encoding: "utf8",
    timeout: 5 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.error) {
    throw new Error(`ffmpeg invocation failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderrTail = (result.stderr || "").split("\n").slice(-20).join("\n");
    throw new Error(
      `ffmpeg exited with code ${result.status}. stderr (tail):\n${stderrTail}`
    );
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error("ffmpeg reported success but produced no output file");
  }
}

function safeRmDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    console.warn(`[FinalVideoRenderer] Failed to clean up ${dir}:`, err);
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

  ensureFfmpegAvailable();

  const workDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `final-video-${config.storyId}-`)
  );
  const outputPath = path.join(workDir, "output.mp4");

  try {
    console.log("[FinalVideoRenderer] Step 1/4: Creating intro screen");
    const intro = await createIntroScreen(config);

    console.log("[FinalVideoRenderer] Step 2/4: Generating scene images");
    const sceneAssets: RenderedScene[] = [];
    for (const scene of config.scenes) {
      const imageUrl = await generateSceneImage(config, scene);
      sceneAssets.push({
        sceneNumber: scene.sceneNumber,
        imageUrl,
        durationSeconds: estimateNarrationDuration(scene.narration),
      });
    }

    console.log("[FinalVideoRenderer] Step 3/4: Creating end screen");
    const endScreen = await createEndScreen(config, config.scenes);

    const allScenes: RenderedScene[] = [intro, ...sceneAssets, endScreen];

    console.log(
      `[FinalVideoRenderer] Step 4/4: Downloading ${allScenes.length} images and rendering video`
    );
    const localImagePaths: Array<{ filePath: string; durationSeconds: number }> = [];
    for (let i = 0; i < allScenes.length; i++) {
      const scene = allScenes[i];
      const filePath = path.join(workDir, `scene-${String(i).padStart(3, "0")}.png`);
      await downloadToFile(scene.imageUrl, filePath);
      localImagePaths.push({ filePath, durationSeconds: scene.durationSeconds });
    }

    stitchVideoWithFFmpeg(localImagePaths, outputPath, workDir);

    console.log("[FinalVideoRenderer] Uploading final video to storage");
    const videoBuffer = fs.readFileSync(outputPath);
    const { url: videoUrl, key: videoKey } = await storagePut(
      `videos/final/${config.storyId}.mp4`,
      videoBuffer,
      "video/mp4"
    );

    console.log(
      `[FinalVideoRenderer] Final video generation complete: ${videoUrl}`
    );

    return { videoUrl, videoKey };
  } catch (error) {
    console.error("[FinalVideoRenderer] Error generating final video:", error);
    throw error;
  } finally {
    safeRmDir(workDir);
  }
}

/**
 * Parse story JSON and extract scenes
 */
export function parseStoryJSON(storyJsonString: string): StoryScene[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(storyJsonString);
  } catch (error) {
    throw new Error(
      `Failed to parse story JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Story JSON must be an array of scenes");
  }

  for (const scene of parsed as StoryScene[]) {
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

  return parsed as StoryScene[];
}
