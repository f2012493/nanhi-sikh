import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Loader2, Download, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FinalVideoCreatorProps {
  storyOrderId: number;
  onVideoReady?: (videoUrl: string) => void;
}

const STAGES = [
  { id: "reading_story", label: "Reading Story", order: 1 },
  { id: "generating_scenes", label: "Generating Scenes", order: 2 },
  { id: "creating_narration", label: "Creating Narration", order: 3 },
  { id: "rendering_video", label: "Rendering Video", order: 4 },
  { id: "finalizing_export", label: "Finalizing Export", order: 5 },
];

export function FinalVideoCreator({ storyOrderId, onVideoReady }: FinalVideoCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const startMutation = trpc.finalVideo.startFinalVideoGeneration.useMutation();
  const statusQuery = trpc.finalVideo.getFinalVideoStatus.useQuery(
    { storyOrderId },
    { enabled: isPolling, refetchInterval: 2000 }
  );
  const retryMutation = trpc.finalVideo.retryFinalVideoGeneration.useMutation();

  // Handle status updates
  useEffect(() => {
    if (statusQuery.data) {
      setProgress(statusQuery.data.progress);
      setCurrentStage(statusQuery.data.stage);
      setVideoUrl(statusQuery.data.videoUrl || null);

      if (statusQuery.data.isComplete) {
        setIsPolling(false);
        setIsGenerating(false);
        if (statusQuery.data.videoUrl) {
          toast.success("Video generation complete!");
          onVideoReady?.(statusQuery.data.videoUrl);
        }
      }
    }
  }, [statusQuery.data, onVideoReady]);

  const handleStartGeneration = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      setIsPolling(true);
      setProgress(0);
      setCurrentStage("reading_story");

      await startMutation.mutateAsync({ storyOrderId });
      toast.success("Video generation started!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start video generation");
      setIsGenerating(false);
      setIsPolling(false);
      toast.error("Failed to start video generation");
    }
  };

  const handleRetry = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      setIsPolling(true);
      setProgress(0);
      setCurrentStage("reading_story");
      setVideoUrl(null);

      await retryMutation.mutateAsync({ storyOrderId });
      toast.success("Retrying video generation...");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry video generation");
      setIsGenerating(false);
      setIsPolling(false);
      toast.error("Failed to retry video generation");
    }
  };

  const handleDownload = async () => {
    try {
      if (videoUrl) {
        // Create a link and trigger download
        const link = document.createElement("a");
        link.href = videoUrl;
        link.download = "story-video.mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      }
    } catch (err) {
      toast.error("Failed to download video");
    }
  };

  const getStageStatus = (stageId: string) => {
    const stageOrder = STAGES.find((s) => s.id === stageId)?.order || 0;
    const currentOrder = STAGES.find((s) => s.id === currentStage)?.order || 0;

    if (currentOrder > stageOrder) return "completed";
    if (currentOrder === stageOrder) return "active";
    return "pending";
  };

  return (
    <div className="space-y-6">
      {/* Main Action Button */}
      {!isGenerating && !videoUrl && (
        <Button
          onClick={handleStartGeneration}
          disabled={startMutation.isPending}
          size="lg"
          className="w-full"
        >
          {startMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            "Create Final Video"
          )}
        </Button>
      )}

      {/* Progress Section */}
      {isGenerating && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Video Generation Progress</h3>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{progress}% Complete</p>
          </div>

          {/* Stage Indicators */}
          <div className="space-y-3">
            {STAGES.map((stage) => {
              const status = getStageStatus(stage.id);
              return (
                <div key={stage.id} className="flex items-center gap-3">
                  {status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {status === "active" && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  {status === "pending" && (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span
                    className={`text-sm ${
                      status === "completed"
                        ? "text-green-600 font-medium"
                        : status === "active"
                          ? "text-blue-600 font-medium"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900">Generation Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Video Ready State */}
      {videoUrl && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-green-700">Video Ready!</h3>
          </div>

          {/* Video Preview */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
              autoPlay
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download MP4
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>

          {/* Share Options */}
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Share Video</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = encodeURIComponent("Check out this amazing story video!");
                  const whatsappUrl = `https://wa.me/?text=${text}`;
                  window.open(whatsappUrl, "_blank");
                }}
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Share the video link with your Instagram followers!");
                }}
              >
                Instagram
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
