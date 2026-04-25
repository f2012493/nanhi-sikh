import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Upload, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type StoryFormData = {
  childName: string;
  childAge: number;
  childGender: "male" | "female" | "other";
  childPhotoFile: File | null;
  childPhotoUrl: string;
  childPhotoKey: string;
  language: "en" | "hi" | "hinglish";
  parentingChallenge: string;
  childPersonality: string;
  characterPhotos: Array<{ file: File; name: string; role: string }>;
  animationStyle: "cartoon" | "storybook" | "magical";
  musicMood: "playful" | "calm" | "adventurous";
  videoLength: "short" | "full";
  storyScript: string;
};

const PARENTING_CHALLENGES = [
  { emoji: "🥦", label: "Won't eat vegetables" },
  { emoji: "👫", label: "Won't share toys" },
  { emoji: "🌙", label: "Scared of the dark" },
  { emoji: "👊", label: "Hits when angry" },
  { emoji: "😤", label: "Doesn't say sorry" },
  { emoji: "🪥", label: "Won't brush teeth" },
  { emoji: "📱", label: "Too much screen time" },
  { emoji: "🤥", label: "Lies about small things" },
];

export default function CreateStory() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyOrderId, setStoryOrderId] = useState<number | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState<StoryFormData>({
    childName: "",
    childAge: 5,
    childGender: "other",
    childPhotoFile: null,
    childPhotoUrl: "",
    childPhotoKey: "",
    language: "en",
    parentingChallenge: "",
    childPersonality: "",
    characterPhotos: [],
    animationStyle: "cartoon",
    musicMood: "playful",
    videoLength: "full",
    storyScript: "",
  });

  const createStoryMutation = trpc.story.create.useMutation();
  const generateScriptMutation = trpc.story.generateScript.useMutation();
  const uploadPhotoMutation = trpc.upload.uploadChildPhoto.useMutation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.childName.trim()) newErrors.childName = "Child's name is required";
      if (formData.childAge < 2 || formData.childAge > 10) newErrors.childAge = "Age must be between 2 and 10";
      if (!formData.childPhotoUrl) newErrors.childPhoto = "Child's photo is required";
    } else if (step === 2) {
      if (formData.parentingChallenge.length < 10) {
        newErrors.parentingChallenge = "Please describe the challenge in at least 10 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof StoryFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (field: "childPhotoFile", file: File) => {
    try {
      setIsUploadingPhoto(true);
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        try {
          // Upload to storage via API
          const result = await uploadPhotoMutation.mutateAsync({
            base64Data,
            fileName: file.name,
          });

          // Store only the URL and key, not the base64
          setFormData((prev) => ({
            ...prev,
            [field]: file,
            childPhotoUrl: result.url,
            childPhotoKey: result.key,
          }));

          toast.success("Photo uploaded successfully!");
        } catch (error: any) {
          toast.error(error.message || "Failed to upload photo");
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("Failed to read file");
      setIsUploadingPhoto(false);
    }
  };

  const handleCharacterPhotoAdd = (file: File, name: string, role: string) => {
    setFormData((prev) => ({
      ...prev,
      characterPhotos: [
        ...prev.characterPhotos,
        { file, name, role },
      ].slice(0, 3),
    }));
  };

  const handleGenerateStory = async () => {
    if (!validateStep(5)) return;

    setIsGenerating(true);
    try {
      // Step 1: Create story order with storage URL (not base64)
      const result = await createStoryMutation.mutateAsync({
        childName: formData.childName,
        childAge: formData.childAge,
        childGender: formData.childGender,
        childPhotoUrl: formData.childPhotoUrl, // Storage URL only
        childPhotoKey: formData.childPhotoKey,
        language: formData.language as "en" | "hi" | "hinglish",
        parentingChallenge: formData.parentingChallenge,
        childPersonality: formData.childPersonality,
        animationStyle: formData.animationStyle as "cartoon" | "storybook" | "magical",
        musicMood: formData.musicMood as "playful" | "calm" | "adventurous",
        videoLength: formData.videoLength as "short" | "full",
      });

      setStoryOrderId(result.id);

      // Step 2: Generate script
      const characterNames = formData.characterPhotos.map((c) => c.name);
      const scriptResult = await generateScriptMutation.mutateAsync({
        storyOrderId: result.id,
        childName: formData.childName,
        childAge: formData.childAge,
        language: formData.language as "en" | "hi" | "hinglish",
        parentingChallenge: formData.parentingChallenge,
        childPersonality: formData.childPersonality,
        characterNames: characterNames.length > 0 ? characterNames : undefined,
      });

      // Navigate to story review page
      toast.success("Story script generated! Review and customize if needed.");
      navigate(`/story-review/${result.id}`);
    } catch (error: any) {
      // Show user-friendly error message
      const errorMessage = error.message || "Unable to create your video. Please try again.";
      toast.error(errorMessage);
      console.error("[CreateStory] Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Tell us about your child</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Child's Name *</label>
              <Input
                value={formData.childName}
                onChange={(e) => handleInputChange("childName", e.target.value)}
                placeholder="e.g., Aditya"
                className={errors.childName ? "border-red-500" : ""}
              />
              {errors.childName && <p className="text-red-500 text-sm mt-1">{errors.childName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age *</label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.childAge}
                  onChange={(e) => handleInputChange("childAge", parseInt(e.target.value))}
                  className={errors.childAge ? "border-red-500" : ""}
                />
                {errors.childAge && <p className="text-red-500 text-sm mt-1">{errors.childAge}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender *</label>
                <Select value={formData.childGender} onValueChange={(value) => handleInputChange("childGender", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Boy</SelectItem>
                    <SelectItem value="female">Girl</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Child's Photo *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload("childPhotoFile", e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="childPhoto"
                  disabled={isUploadingPhoto}
                />
                <label htmlFor="childPhoto" className="cursor-pointer block">
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p>Uploading...</p>
                    </>
                  ) : formData.childPhotoUrl ? (
                    <>
                      <img src={formData.childPhotoUrl} alt="Child" className="h-32 w-32 mx-auto rounded mb-2 object-cover" />
                      <p className="text-sm text-green-600">Photo uploaded ✓</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Click to upload or drag and drop</p>
                    </>
                  )}
                </label>
              </div>
              {errors.childPhoto && <p className="text-red-500 text-sm mt-1">{errors.childPhoto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language *</label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="hinglish">Hinglish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What's the parenting challenge?</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Describe the challenge *</label>
              <Textarea
                value={formData.parentingChallenge}
                onChange={(e) => handleInputChange("parentingChallenge", e.target.value)}
                placeholder="e.g., My child refuses to share toys with siblings and gets angry when others touch his belongings..."
                className={`min-h-32 ${errors.parentingChallenge ? "border-red-500" : ""}`}
              />
              {errors.parentingChallenge && <p className="text-red-500 text-sm mt-1">{errors.parentingChallenge}</p>}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Quick suggestions:</p>
              <div className="grid grid-cols-2 gap-2">
                {PARENTING_CHALLENGES.map((challenge) => (
                  <button
                    key={challenge.label}
                    onClick={() => handleInputChange("parentingChallenge", challenge.label)}
                    className="p-2 border rounded hover:bg-blue-50 transition text-left text-sm"
                  >
                    <span className="mr-2">{challenge.emoji}</span>
                    {challenge.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Child's personality (optional)</label>
              <Input
                value={formData.childPersonality}
                onChange={(e) => handleInputChange("childPersonality", e.target.value)}
                placeholder="e.g., Shy, outgoing, creative, adventurous..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Add supporting characters (optional)</h2>
            <p className="text-gray-600">Upload photos of family members or friends to include in the story</p>
            
            <div className="space-y-3">
              {formData.characterPhotos.map((char, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded flex items-center justify-between">
                  <div>
                    <p className="font-medium">{char.name}</p>
                    <p className="text-sm text-gray-600">{char.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        characterPhotos: prev.characterPhotos.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {formData.characterPhotos.length < 3 && (
              <button
                onClick={() => {
                  const name = prompt("Character name:");
                  if (name) {
                    const role = prompt("Character role (e.g., sibling, friend, pet):");
                    if (role) {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e: any) => {
                        if (e.target.files?.[0]) {
                          handleCharacterPhotoAdd(e.target.files[0], name, role);
                        }
                      };
                      input.click();
                    }
                  }
                }}
                className="w-full p-3 border-2 border-dashed rounded text-center hover:bg-blue-50 transition"
              >
                + Add Character
              </button>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Customize the story</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Animation Style</label>
              <Select value={formData.animationStyle} onValueChange={(value) => handleInputChange("animationStyle", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="storybook">Storybook</SelectItem>
                  <SelectItem value="magical">Magical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Music Mood</label>
              <Select value={formData.musicMood} onValueChange={(value) => handleInputChange("musicMood", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="adventurous">Adventurous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video Length</label>
              <Select value={formData.videoLength} onValueChange={(value) => handleInputChange("videoLength", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (3-5 min)</SelectItem>
                  <SelectItem value="full">Full (7-10 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Generate My Video</h2>
            <p className="text-gray-600">Review your story details and click below to generate the personalized video</p>
            
            <Card className="p-4 bg-blue-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Child Name:</p>
                  <p>{formData.childName}</p>
                </div>
                <div>
                  <p className="font-medium">Age:</p>
                  <p>{formData.childAge}</p>
                </div>
                <div>
                  <p className="font-medium">Language:</p>
                  <p>{formData.language}</p>
                </div>
                <div>
                  <p className="font-medium">Animation Style:</p>
                  <p>{formData.animationStyle}</p>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Video...
                </>
              ) : (
                "Generate My Video"
              )}
            </Button>

            {formData.storyScript && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-bold mb-2">Story Script Preview</h3>
                <pre className="text-xs overflow-auto max-h-64">{formData.storyScript}</pre>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 mx-1 rounded ${
                    step <= currentStep ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">Step {currentStep} of 5</p>
          </div>

          {/* Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1}
              variant="outline"
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
