import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

type StoryFormData = {
  // Step 1
  childName: string;
  childAge: number;
  childGender: "male" | "female" | "other";
  childPhoto: File | null;
  language: "en" | "hi" | "hinglish";
  
  // Step 2
  parentingChallenge: string;
  childPersonality: string;
  
  // Step 3
  characterPhotos: Array<{ file: File; name: string; role: string }>;
  
  // Step 4
  animationStyle: "cartoon" | "storybook" | "magical";
  musicMood: "playful" | "calm" | "adventurous";
  videoLength: "short" | "full";
  
  // Step 5
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
  const [formData, setFormData] = useState<StoryFormData>({
    childName: "",
    childAge: 5,
    childGender: "other",
    childPhoto: null,
    language: "en",
    parentingChallenge: "",
    childPersonality: "",
    characterPhotos: [],
    animationStyle: "cartoon",
    musicMood: "playful",
    videoLength: "full",
    storyScript: "",
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
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
  };

  const handleFileUpload = (field: "childPhoto", file: File) => {
    handleInputChange(field, file);
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">About Your Child</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Child's Name
                </label>
                <Input
                  placeholder="e.g., Aditya"
                  value={formData.childName}
                  onChange={(e) => handleInputChange("childName", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={formData.childAge}
                    onChange={(e) => handleInputChange("childAge", parseInt(e.target.value))}
                    className="w-full"
                  />
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
                  Upload Child's Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload("childPhoto", e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
                {formData.childPhoto && (
                  <p className="text-sm text-green-600 mt-2">✓ {formData.childPhoto.name} uploaded</p>
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
                Describe the behavior or habit you want to address
              </label>
              <Textarea
                placeholder="e.g., My son throws tantrums when screen time ends and refuses to go to bed..."
                value={formData.parentingChallenge}
                onChange={(e) => handleInputChange("parentingChallenge", e.target.value)}
                className="w-full min-h-32"
              />
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
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">Upload character photo</p>
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
                  />
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Story Script Preview (10 scenes)
              </label>
              <Textarea
                placeholder="Your AI-generated story script will appear here after generation..."
                value={formData.storyScript}
                onChange={(e) => handleInputChange("storyScript", e.target.value)}
                className="w-full min-h-48 text-sm"
                readOnly
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> You can edit the script above before we generate your video. Each scene will be illustrated and narrated with a warm, engaging voice.
              </p>
            </div>
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
              onClick={() => {
                // TODO: Submit form and generate story
                console.log("Generate story", formData);
              }}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            >
              Generate My Video
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
