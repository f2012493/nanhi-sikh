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

  const [formData, setFormData] = useState<StoryFormData>({
    childName: "",
    childAge: 5,
    childGender: "other",
    childPhotoFile: null,
    childPhotoUrl: "",
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
      if (!formData.childPhotoFile) newErrors.childPhoto = "Child's photo is required";
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

  const handleFileUpload = (field: "childPhotoFile", file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        [field]: file,
        childPhotoUrl: url,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCharacterPhotoAdd = (file: File, name: string, role: string) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        characterPhotos: [
          ...prev.characterPhotos,
          { file, name, role },
        ].slice(0, 3),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateStory = async () => {
    if (!validateStep(5)) return;

    setIsGenerating(true);
    try {
      // Step 1: Create story order
      const result = await createStoryMutation.mutateAsync({
        childName: formData.childName,
        childAge: formData.childAge,
        childGender: formData.childGender,
        childPhotoUrl: formData.childPhotoUrl,
        language: formData.language,
        parentingChallenge: formData.parentingChallenge,
        childPersonality: formData.childPersonality,
        animationStyle: formData.animationStyle,
        musicMood: formData.musicMood,
        videoLength: formData.videoLength,
      });

      setStoryOrderId(result.id);

      // Step 2: Generate script
      const characterNames = formData.characterPhotos.map((c) => c.name);
      const scriptResult = await generateScriptMutation.mutateAsync({
        storyOrderId: result.id,
        childName: formData.childName,
        childAge: formData.childAge,
        language: formData.language,
        parentingChallenge: formData.parentingChallenge,
        childPersonality: formData.childPersonality,
        characterNames: characterNames.length > 0 ? characterNames : undefined,
      });

      setFormData((prev) => ({
        ...prev,
        storyScript: JSON.stringify(scriptResult, null, 2),
      }));

      toast.success("Story script generated! Review and customize if needed.");
      setCurrentStep(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate story");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">About Your Child</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Child's Name *
                </label>
                <Input
                  placeholder="e.g., Aditya"
                  value={formData.childName}
                  onChange={(e) => handleInputChange("childName", e.target.value)}
                  className={`w-full ${errors.childName ? "border-red-500" : ""}`}
                />
                {errors.childName && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.childName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age *
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={formData.childAge}
                    onChange={(e) => handleInputChange("childAge", parseInt(e.target.value) || 5)}
                    className={`w-full ${errors.childAge ? "border-red-500" : ""}`}
                  />
                  {errors.childAge && (
                    <p className="text-sm text-red-600 mt-1">{errors.childAge}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Child's Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload("childPhotoFile", e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="childPhotoInput"
                  />
                  <label htmlFor="childPhotoInput" className="cursor-pointer block">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                  </label>
                </div>
                {formData.childPhotoFile && (
                  <p className="text-sm text-green-600 mt-2">✓ {formData.childPhotoFile.name} uploaded</p>
                )}
                {formData.childPhotoUrl && (
                  <img src={formData.childPhotoUrl} alt="Child preview" className="mt-4 h-32 w-32 object-cover rounded-lg" />
                )}
                {errors.childPhoto && (
                  <p className="text-sm text-red-600 mt-1">{errors.childPhoto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Language
                </label>
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">What's the Challenge?</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Describe the behavior or habit you want to address *
              </label>
              <Textarea
                placeholder="e.g., My son throws tantrums when screen time ends and refuses to go to bed..."
                value={formData.parentingChallenge}
                onChange={(e) => handleInputChange("parentingChallenge", e.target.value)}
                className={`w-full min-h-32 ${errors.parentingChallenge ? "border-red-500" : ""}`}
              />
              {errors.parentingChallenge && (
                <p className="text-sm text-red-600 mt-1">{errors.parentingChallenge}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quick Suggestions (click to select)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PARENTING_CHALLENGES.map((challenge) => (
                  <button
                    key={challenge.label}
                    onClick={() => handleInputChange("parentingChallenge", challenge.label)}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      formData.parentingChallenge === challenge.label
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <span className="text-lg">{challenge.emoji}</span> {challenge.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Anything else we should know? (optional)
              </label>
              <Textarea
                placeholder="e.g., He loves dinosaurs, his best friend is Rohan, he's very imaginative..."
                value={formData.childPersonality}
                onChange={(e) => handleInputChange("childPersonality", e.target.value)}
                className="w-full min-h-24"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Supporting Characters (Optional)</h2>

            <p className="text-gray-600">
              Upload photos of siblings, friends, or pets to make the story even more personal (up to 3 characters)
            </p>

            <div className="space-y-4">
              {formData.characterPhotos.map((char, idx) => (
                <Card key={idx} className="p-4 bg-gray-50">
                  <p className="font-semibold text-gray-900">{char.name} ({char.role})</p>
                  <p className="text-sm text-gray-600">✓ {char.file.name}</p>
                </Card>
              ))}

              {formData.characterPhotos.length < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const name = prompt("Character name:");
                        const role = prompt("Relationship (e.g., sibling, friend, pet):");
                        if (name && role) {
                          handleCharacterPhotoAdd(e.target.files[0], name, role);
                        }
                      }
                    }}
                    className="hidden"
                    id="characterPhotoInput"
                  />
                  <label htmlFor="characterPhotoInput" className="cursor-pointer block">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Upload character photo</p>
                  </label>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Customize the Story</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Animation Style
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "cartoon", label: "🎨 Colorful Cartoon", desc: "Chhota Bheem-inspired" },
                  { value: "storybook", label: "🖼️ Storybook", desc: "Soft watercolor" },
                  { value: "magical", label: "🌟 Magical Glow", desc: "Dreamlike & dreamy" },
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleInputChange("animationStyle", style.value)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      formData.animationStyle === style.value
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{style.label}</p>
                    <p className="text-sm text-gray-600">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Background Music Mood
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "playful", label: "Playful 🎉" },
                  { value: "calm", label: "Calm 🧘" },
                  { value: "adventurous", label: "Adventurous 🚀" },
                ].map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleInputChange("musicMood", mood.value)}
                    className={`p-3 rounded-lg border-2 transition font-medium ${
                      formData.musicMood === mood.value
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Video Length
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "short", label: "Short (2 min)" },
                  { value: "full", label: "Full (5 min)" },
                ].map((length) => (
                  <button
                    key={length.value}
                    onClick={() => handleInputChange("videoLength", length.value)}
                    className={`p-3 rounded-lg border-2 transition font-medium ${
                      formData.videoLength === length.value
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {length.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Review & Generate</h2>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <p className="text-blue-900">
                <strong>Summary:</strong> We'll generate a personalized 10-scene story for <strong>{formData.childName}</strong> ({formData.childAge} years old) about <strong>{formData.parentingChallenge}</strong> in <strong>{formData.language.toUpperCase()}</strong>.
              </p>
            </Card>

            {formData.storyScript && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Story Script Preview (10 scenes)
                </label>
                <Textarea
                  value={formData.storyScript}
                  onChange={(e) => handleInputChange("storyScript", e.target.value)}
                  className="w-full min-h-48 text-sm font-mono"
                />
              </div>
            )}

            {!formData.storyScript && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Ready to generate?</strong> Click "Generate Story" to create your personalized script. This may take a moment.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full mx-1 transition ${
                  step <= currentStep ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {currentStep} of 5
          </p>
        </div>

        {/* Content */}
        <Card className="p-8 mb-8">
          {renderStep()}
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === 5 ? (
            <Button
              onClick={handleGenerateStory}
              disabled={isGenerating || !!formData.storyScript}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white flex items-center gap-2"
            >
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGenerating ? "Generating..." : formData.storyScript ? "Story Generated!" : "Generate My Video"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
