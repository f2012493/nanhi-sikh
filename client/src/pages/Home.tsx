import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation as useWouterLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, Star, Shield, Users } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useWouterLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/create-story");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-transparent">
            NanhiSikh
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
                  Dashboard
                </Button>
                <Button onClick={handleGetStarted}>
                  Create Story
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Does your child refuse to sleep? Throw tantrums? Not share?
                </h1>
                <p className="text-xl text-gray-600">
                  Let their own story teach them. Personalized animated videos where your child is the hero.
                </p>
              </div>
              <div className="text-lg text-indigo-600 font-semibold">
                Ek Kahani Jo Badlav Laaye
              </div>
              <p className="text-gray-600 text-lg">
                We know parenting is hard. That's why we created NanhiSikh—an AI-powered platform that generates personalized story videos featuring your child as the main character, naturally teaching important lessons without lecturing.
              </p>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white w-full sm:w-auto"
              >
                Create Your First Story <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Right: Visual */}
            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-orange-200 rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-indigo-100 to-orange-100 rounded-3xl p-8 flex items-center justify-center h-full">
                <div className="text-center">
                  <Play className="h-20 w-20 text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold">Watch Demo Stories</p>
                  <p className="text-sm text-gray-600 mt-2">See how NanhiSikh transforms parenting challenges into engaging stories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Explainer */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Describe",
                description: "Tell us about your child and the behavior you want to address. Our AI listens and understands your unique situation.",
                icon: "📝",
              },
              {
                step: "2",
                title: "Personalize",
                description: "Upload your child's photo. We create a custom story where your child is the hero, with their favorite things and people.",
                icon: "✨",
              },
              {
                step: "3",
                title: "Watch & Share",
                description: "Your personalized video is ready. Watch it with your child, share on WhatsApp, or download for later.",
                icon: "🎬",
              },
            ].map((item) => (
              <Card key={item.step} className="p-8 border-2 border-gray-100 hover:border-indigo-300 transition-colors">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-4xl font-bold text-indigo-600 mb-3">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 to-orange-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, label: "Crafted by Child Psychologists + AI", value: "Expert-Backed" },
              { icon: Users, label: "Safe for ages 2–10", value: "COPPA & DPDP Compliant" },
              { icon: Star, label: "10,000+ Lessons Delivered", value: "Trusted by Parents" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center">
                  <Icon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">{item.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            What Indian Parents Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                child: "Aditya, 4 years",
                testimonial: "My son was terrified of the dark. After watching his personalized NanhiSikh story, he's sleeping in his own room now. Amazing!",
                rating: 5,
              },
              {
                name: "Rajesh Patel",
                child: "Ananya, 6 years",
                testimonial: "She wouldn't eat vegetables. The story made her laugh and now she actually asks for the veggies. Highly recommend!",
                rating: 5,
              },
              {
                name: "Neha Gupta",
                child: "Rohan, 5 years",
                testimonial: "The quality of the animation and the personalization is incredible. Worth every rupee. My son watches it daily!",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 border-2 border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.testimonial}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.child}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-orange-500 text-white">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Parenting?</h2>
          <p className="text-xl mb-8 opacity-90">
            Create your child's personalized story today. No credit card required for the preview.
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold text-lg mb-4">NanhiSikh</div>
              <p className="text-sm">Ek Kahani Jo Badlav Laaye</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">COPPA</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 NanhiSikh. All rights reserved. Crafted with love for Indian parents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
