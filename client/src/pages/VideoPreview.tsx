import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Download, Share2, RotateCcw, Play } from "lucide-react";

interface RenderJob {
  id?: number;
  storyOrderId?: number;
  status: "pending" | "processing" | "completed" | "failed" | "reading_story" | "generating_scenes" | "creating_narration" | "rendering_video" | "finalizing_export";
  progress: number;
  stage: string | null;
  videoUrl?: string | null;
  videoKey?: string;
  errorMessage?: string;
  isComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function VideoPreview() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/video-preview/:jobId");
  const jobId = params?.jobId ? parseInt(params.jobId) : null;

  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  // Fetch render job status
  const getRenderJobQuery = trpc.finalVideo.getFinalVideoStatus.useQuery(
    { storyOrderId: jobId || 0 },
    { enabled: !!jobId && !!user && isPolling }
  );

  // Regenerate video mutation
  const regenerateVideoMutation = trpc.finalVideo.startFinalVideoGeneration.useMutation({
    onSuccess: () => {
      toast.success("Video regeneration started!");
      setIsPolling(true);
      setPollCount(0);
    },
    onError: (error: any) => {
      toast.error(`Failed to regenerate video: ${error.message}`);
    },
  });

  // Poll for status updates every 2 seconds
  useEffect(() => {
    if (!isPolling || !jobId) return;

    const timer = setInterval(() => {
      setPollCount((prev) => prev + 1);
      getRenderJobQuery.refetch();
    }, 2000);

    return () => clearInterval(timer);
  }, [isPolling, jobId, getRenderJobQuery]);

  // Update render job when query data changes
  useEffect(() => {
    if (getRenderJobQuery.data) {
      setRenderJob({
        id: jobId || undefined,
        storyOrderId: jobId || undefined,
        status: getRenderJobQuery.data.status,
        progress: getRenderJobQuery.data.progress,
        stage: getRenderJobQuery.data.stage,
        videoUrl: getRenderJobQuery.data.videoUrl,
        isComplete: getRenderJobQuery.data.isComplete,
      });

      // Stop polling if video is completed or failed
      if (getRenderJobQuery.data.status === "completed" || getRenderJobQuery.data.status === "failed") {
        setIsPolling(false);
      }
    }
  }, [getRenderJobQuery.data, jobId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  if (!user || authLoading) {
    return null;
  }

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>No video job ID provided</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (getRenderJobQuery.isLoading || !renderJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Video Status...</CardTitle>
            <CardDescription>Please wait while we fetch your video</CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="animate-spin w-8 h-8 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const stagePercentages: Record<string, number> = {
    "Reading Story": 10,
    "Generating Scenes": 30,
    "Creating Narration": 50,
    "Rendering Video": 80,
    "Finalizing Export": 100,
  };

  const currentProgress = (renderJob?.stage && stagePercentages[renderJob.stage]) || renderJob?.progress || 0;

  const handleDownload = () => {
    if (renderJob?.videoUrl) {
      const link = document.createElement("a");
      link.href = String(renderJob.videoUrl);
      link.download = `story-${renderJob.storyOrderId || jobId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Video download started!");
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Check out my child's personalized story video from NanhiSikh! 🎬👧\n${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
  };

  const handleShareInstagram = () => {
    toast.info("Copy the video link and share it on Instagram Reels!");
    navigator.clipboard.writeText(window.location.href);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleRegenerate = () => {
    if (confirm("Are you sure you want to regenerate this video? This will start the process again.")) {
      if (jobId) {
        regenerateVideoMutation.mutate({ storyOrderId: jobId });
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard" as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/story-review/${jobId}` as any)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Story Video</h1>
          <div className="w-12" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Video Preview</CardTitle>
                <CardDescription>
                  Status: {renderJob.status === "completed" ? "✅ Ready" : renderJob.status === "failed" ? "❌ Failed" : "⏳ Processing"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderJob.status === "completed" && renderJob.videoUrl ? (
                  <div className="space-y-4">
                    <video
                      src={renderJob.videoUrl}
                      controls
                      className="w-full rounded-lg bg-black"
                      poster="/video-placeholder.png"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        Download MP4
                      </Button>
                      <Button onClick={handleCopyLink} variant="outline" className="flex-1 gap-2">
                        <Share2 className="w-4 h-4" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                ) : renderJob.status === "failed" ? (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">Video Generation Failed</h3>
                      <p className="text-red-700 text-sm mb-4">
                        {renderJob.errorMessage || "An error occurred during video generation"}
                      </p>
                      <Button
                        onClick={handleRegenerate}
                        disabled={regenerateVideoMutation.isPending}
                        className="gap-2"
                      >
                        {regenerateVideoMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-12 flex flex-col items-center justify-center min-h-64">
                      <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">Creating Your Video</p>
                      <p className="text-gray-600 text-center mb-6">
                        {renderJob.stage || "Preparing your personalized story..."}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-semibold text-blue-600">{currentProgress}%</span>
                      </div>
                      <Progress value={currentProgress} className="h-2" />
                    </div>

                    {/* Stage Indicators */}
                    <div className="space-y-3">
                      {Object.entries(stagePercentages).map(([stage, percentage]) => (
                        <div key={stage} className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              percentage <= currentProgress
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              percentage <= currentProgress
                                ? "text-gray-900 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Share Card */}
            {renderJob.status === "completed" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={handleShareWhatsApp}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={handleShareInstagram}
                    className="w-full gap-2 bg-pink-600 hover:bg-pink-700"
                  >
                    <Share2 className="w-4 h-4" />
                    Instagram Reels
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {renderJob.status === "failed" && (
                  <Button
                    onClick={handleRegenerate}
                    disabled={regenerateVideoMutation.isPending}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    {regenerateVideoMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={handleBackToDashboard}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Job ID</p>
                  <p className="font-mono text-gray-900">{renderJob.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{renderJob.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="text-gray-900">
                    {renderJob.createdAt ? new Date(renderJob.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
