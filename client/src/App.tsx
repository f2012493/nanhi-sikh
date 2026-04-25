import { Toaster } from "@/components/ui/sonner";
import { useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CreateStory from "./pages/CreateStory";
import StoryScriptReview from "./pages/StoryScriptReview";
import VideoPreview from "./pages/VideoPreview";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function Router() {
  const [location] = useLocation();
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/create-story"} component={CreateStory} />
      <Route path={"/story-review/:storyId"} component={StoryScriptReview} />
      <Route path={"/video-preview/:jobId"} component={VideoPreview} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
