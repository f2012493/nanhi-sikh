import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Download, Share2, MessageSquare, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  const getUserStoriesQuery = trpc.story.getUserStories.useQuery();
  const submitFeedbackMutation = trpc.story.submitFeedback.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const stories = getUserStoriesQuery.data || [];

  const handleFeedback = async (storyId: number, feedbackType: "worked" | "partial" | "not_worked") => {
    try {
      await submitFeedbackMutation.mutateAsync({
        storyOrderId: storyId,
        feedbackType,
      });
      toast.success("Thank you for your feedback!");
      setSelectedStory(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback");
    }
  };

  const handleShare = (storyId: number) => {
    const story = stories.find((s) => s.id === storyId);
    if (story?.videoUrl) {
      const whatsappText = `Check out this personalized story for ${story.childName}! 🎬✨`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText + " " + story.videoUrl)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Stories</h1>
          <p className="text-gray-600 mb-6">All the personalized stories created for your children</p>
          <Button
            onClick={() => navigate("/create-story")}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Story
          </Button>
        </div>

        {/* Stories Grid */}
        {getUserStoriesQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : stories.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-6">No stories yet. Create your first personalized story!</p>
            <Button
              onClick={() => navigate("/create-story")}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            >
              Create Story
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition">
                {/* Thumbnail */}
                <div className="bg-gradient-to-br from-indigo-100 to-orange-100 h-48 flex items-center justify-center relative">
                  {story.videoUrl ? (
                    <>
                      <Play className="h-12 w-12 text-indigo-600 absolute" />
                      <img
                        src={story.childPhotoUrl || ""}
                        alt={story.childName}
                        className="w-full h-full object-cover opacity-50"
                      />
                    </>
                  ) : (
                    <div className="text-center">
                      {story.renderStatus === "completed" ? (
                        <Play className="h-12 w-12 text-indigo-600 mx-auto" />
                      ) : (
                        <Loader2 className="h-12 w-12 text-indigo-600 mx-auto animate-spin" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{story.childName}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {story.parentingChallenge.substring(0, 50)}...
                  </p>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        story.renderStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : story.renderStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {story.renderStatus === "completed"
                        ? "Ready to Watch"
                        : story.renderStatus === "failed"
                          ? "Generation Failed"
                          : "Generating..."}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {story.videoUrl && (
                      <>
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => story.videoUrl && window.open(story.videoUrl, "_blank")}
                        >
                          <Play className="h-4 w-4" />
                          Watch Video
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center gap-1"
                            onClick={() => handleShare(story.id)}
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center gap-1"
                            onClick={() => setSelectedStory(story.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Feedback
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">How did the story work?</h3>
              <p className="text-gray-600 mb-6">Your feedback helps us improve stories for other families.</p>

              <div className="space-y-3">
                <Button
                  onClick={() => handleFeedback(selectedStory, "worked")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  ✓ It Worked!
                </Button>
                <Button
                  onClick={() => handleFeedback(selectedStory, "partial")}
                  variant="outline"
                  className="w-full"
                >
                  Partially Worked
                </Button>
                <Button
                  onClick={() => handleFeedback(selectedStory, "not_worked")}
                  variant="outline"
                  className="w-full"
                >
                  Didn't Work
                </Button>
                <Button
                  onClick={() => setSelectedStory(null)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
