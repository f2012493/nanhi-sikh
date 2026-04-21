import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const PRICING_FEATURES = {
  preview: [
    "Watermarked video",
    "10-scene personalized story",
    "Child's name featured",
    "7 days access",
  ],
  hd: [
    "Full HD quality",
    "No watermark",
    "10-scene personalized story",
    "Child's name featured",
    "30 days access",
    "Download option",
  ],
  hd_whatsapp: [
    "Full HD quality",
    "No watermark",
    "10-scene personalized story",
    "Child's name featured",
    "Direct WhatsApp delivery",
    "Unlimited access",
    "Share on Instagram Reels",
  ],
};

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const pricingTiersQuery = trpc.payment.getPricingTiers.useQuery();

  const handleSelectTier = (tier: string) => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    // TODO: Navigate to checkout with selected tier
    console.log("Selected tier:", tier);
  };

  const tiers = pricingTiersQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">All prices are in Indian Rupees (₹) and include GST</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Preview Tier */}
          <Card className="p-8 relative hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Preview</h3>
            <p className="text-gray-600 text-sm mb-6">Perfect for trying it out</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-indigo-600">₹99</span>
              <p className="text-gray-600 text-sm mt-2">One-time payment</p>
            </div>

            <Button
              onClick={() => handleSelectTier("preview")}
              variant="outline"
              className="w-full mb-8"
            >
              Get Started
            </Button>

            <div className="space-y-4">
              {PRICING_FEATURES.preview.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* HD Tier (Popular) */}
          <Card className="p-8 relative border-2 border-indigo-600 hover:shadow-lg transition">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-4">HD Quality</h3>
            <p className="text-gray-600 text-sm mb-6">Best for sharing with family</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-indigo-600">₹299</span>
              <p className="text-gray-600 text-sm mt-2">One-time payment</p>
            </div>

            <Button
              onClick={() => handleSelectTier("hd")}
              className="w-full mb-8 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Choose Plan
            </Button>

            <div className="space-y-4">
              {PRICING_FEATURES.hd.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* HD + WhatsApp Tier */}
          <Card className="p-8 relative hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">HD + WhatsApp</h3>
            <p className="text-gray-600 text-sm mb-6">Premium experience</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-indigo-600">₹399</span>
              <p className="text-gray-600 text-sm mt-2">One-time payment</p>
            </div>

            <Button
              onClick={() => handleSelectTier("hd_whatsapp")}
              variant="outline"
              className="w-full mb-8"
            >
              Upgrade Now
            </Button>

            <div className="space-y-4">
              {PRICING_FEATURES.hd_whatsapp.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I upgrade later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade from Preview to HD or HD + WhatsApp anytime. You'll only pay the difference.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is the price GST-inclusive?</h3>
              <p className="text-gray-600">
                Yes, all prices shown include 18% GST. You won't see any additional charges at checkout.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I get a refund?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee if you're not satisfied with the story quality.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
