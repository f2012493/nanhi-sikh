import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Play } from "lucide-react";

interface Scene {
  sceneNumber: number;
  narration: string;
  visualDescription: string;
  characterAction: string;
  hiddenLesson: string;
}

interface StoryScript {
  id: number;
  childName: string;
  language: string;
  parentingChallenge: string;
  animationStyle: string;
  musicMood: string;
  storyScript: string | null;
  scenes?: Scene[];
}

export default function StoryScriptReview() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/story-review/:storyId");
  const storyId = params?.storyId ? parseInt(params.storyId) : null;

  const [story, setStory] = useState<StoryScript | null>(null);
  const [editedScenes, setEditedScenes] = useState<Scene[]>([]);
  const [editingSceneId, setEditingSceneId] = useState<number | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [selectedScene, setSelectedScene] = useState(0);

  // Fetch story details
  const getStoryQuery = trpc.story.getById.useQuery(
    { id: storyId || 0 },
    { enabled: !!storyId && !!user }
  );

  // Save edited script mutation
  const updateScriptMutation = trpc.story.updateScript.useMutation();

  // Start video generation
  const generateVideoMutation = trpc.finalVideo.startFinalVideoGeneration.useMutation({
    onSuccess: (data: any) => {
      toast.success("Video generation started!");
      navigate(`/video-preview/${data.jobId}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to start video generation: ${error.message}`);
      setIsGeneratingVideo(false);
    },
  });

  // Initialize edited scenes when story loads
  useEffect(() => {
    if (getStoryQuery.data) {
      const story = getStoryQuery.data;
      setStory(story);
      try {
        const scenes = typeof story.storyScript === "string"
          ? JSON.parse(story.storyScript)
          : story.storyScript;
        setEditedScenes(Array.isArray(scenes) ? scenes : []);
      } catch (error) {
        console.error("Failed to parse story script:", error);
        toast.error("Failed to load story script");
      }
    }
  }, [getStoryQuery.data]);

  const handleSceneEdit = (sceneNumber: number, field: keyof Scene, value: string) => {
    setEditedScenes((prev) =>
      prev.map((scene) =>
        scene.sceneNumber === sceneNumber ? { ...scene, [field]: value } : scene
      )
    );
  };

  const handleProceedToVideo = async () => {
    if (!storyId || !user) {
      toast.error("Missing story information");
      return;
    }

    setIsGeneratingVideo(true);
    try {
      // Save any edits to the script before generating the video
      await updateScriptMutation.mutateAsync({
        storyOrderId: storyId,
        scenes: editedScenes,
      });

      generateVideoMutation.mutate({
        storyOrderId: storyId,
      });
    } catch (error) {
      console.error("Error proceeding to video:", error);
      toast.error("Failed to proceed to video generation");
      setIsGeneratingVideo(false);
    }
  };

  const handleGoBack = () => {
    navigate("/create-story");
  };

  if (authLoading || getStoryQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Story Not Found</CardTitle>
            <CardDescription>Unable to load the story script</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoBack} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (editedScenes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Story Scenes...</CardTitle>
            <CardDescription>Please wait while we load your story</CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="animate-spin w-8 h-8 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentScene = editedScenes[selectedScene];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Your Story</h1>
              <p className="text-gray-600">
                {story.childName}'s personalized story about {story.parentingChallenge}
              </p>
            </div>
          </div>
        </div>

        {/* Story Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Child</div>
              <div className="font-semibold text-lg">{story.childName}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Language</div>
              <div className="font-semibold text-lg capitalize">{story.language}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Animation</div>
              <div className="font-semibold text-lg capitalize">{story.animationStyle}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600">Music Mood</div>
              <div className="font-semibold text-lg capitalize">{story.musicMood}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scene List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Scenes ({editedScenes.length})</CardTitle>
                <CardDescription>Click to review and edit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {editedScenes.map((scene, index) => (
                  <button
                    key={scene.sceneNumber}
                    onClick={() => setSelectedScene(index)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedScene === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="font-semibold text-sm">Scene {scene.sceneNumber}</div>
                    <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {scene.narration}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Scene Editor */}
          <div className="lg:col-span-2">
            {currentScene && (
              <Card>
                <CardHeader>
                  <CardTitle>Scene {currentScene.sceneNumber} Details</CardTitle>
                  <CardDescription>Edit the scene content below</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Narration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Narration (Voice-over)
                    </label>
                    <Textarea
                      value={currentScene.narration}
                      onChange={(e) =>
                        handleSceneEdit(currentScene.sceneNumber, "narration", e.target.value)
                      }
                      placeholder="Edit the narration text..."
                      className="min-h-24 resize-none"
                    />
                  </div>

                  {/* Visual Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Visual Description
                    </label>
                    <Textarea
                      value={currentScene.visualDescription}
                      onChange={(e) =>
                        handleSceneEdit(
                          currentScene.sceneNumber,
                          "visualDescription",
                          e.target.value
                        )
                      }
                      placeholder="Describe what should be shown on screen..."
                      className="min-h-24 resize-none"
                    />
                  </div>

                  {/* Character Action */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Character Action
                    </label>
                    <Textarea
                      value={currentScene.characterAction}
                      onChange={(e) =>
                        handleSceneEdit(
                          currentScene.sceneNumber,
                          "characterAction",
                          e.target.value
                        )
                      }
                      placeholder="Describe what the character should do..."
                      className="min-h-20 resize-none"
                    />
                  </div>

                  {/* Hidden Lesson */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hidden Lesson
                    </label>
                    <Textarea
                      value={currentScene.hiddenLesson}
                      onChange={(e) =>
                        handleSceneEdit(
                          currentScene.sceneNumber,
                          "hiddenLesson",
                          e.target.value
                        )
                      }
                      placeholder="What should your child learn from this scene?"
                      className="min-h-20 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-end">
          <Button
            variant="outline"
            onClick={handleGoBack}
            disabled={isGeneratingVideo}
          >
            Back to Edit
          </Button>
          <Button
            onClick={handleProceedToVideo}
            disabled={isGeneratingVideo}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isGeneratingVideo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Create Final Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
