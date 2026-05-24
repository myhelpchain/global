import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileMenuProvider, useMobileMenu } from "@/contexts/mobile-menu-context";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { Chatbot } from "@/components/chatbot/chatbot";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import CreateRequest from "@/pages/create-request";
import CreateOfferPage from "@/pages/create-offer";
import AdminDashboard from "@/pages/admin-dashboard";
import DiscoverPage from "@/pages/discover";
import ProfilePage from "@/pages/profile";
import PublicProfilePage from "@/pages/public-profile";
import RequestDetails from "@/pages/request-details";
import BatchManagementPage from "@/pages/batch-management";
import MessagesPage from "@/pages/messages";
import WalletPage from "@/pages/wallet";
import SettingsPage from "@/pages/settings";
import OnboardingPage from "@/pages/onboarding";
import HowItWorks from "@/pages/how-it-works";
import SafetyPage from "@/pages/safety";
import StoriesPage from "@/pages/stories";
import VolunteersPage from "@/pages/volunteers";
import BlogPage from "@/pages/blog";
import EventsPage from "@/pages/events";
import HelpPage from "@/pages/help";
import ContactPage from "@/pages/contact";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import SitemapPage from "@/pages/sitemap";
import AboutPage from "@/pages/about";
import PricingPage from "@/pages/pricing";
import CareersPage from "@/pages/careers";
import PressPage from "@/pages/press";
import CookiesPage from "@/pages/cookies";

/* Convenience wrapper for protected routes */
function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function Router() {
  return (
    <Switch>
      {/* ── Public routes ── */}
      <Route path="/"             component={Home} />
      <Route path="/auth"         component={AuthPage} />
      <Route path="/onboarding"   component={OnboardingPage} />

      {/* ── Public content pages ── */}
      <Route path="/discover"     component={DiscoverPage} />
      <Route path="/search"       component={DiscoverPage} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/safety"       component={SafetyPage} />
      <Route path="/stories"      component={StoriesPage} />
      <Route path="/volunteers"   component={VolunteersPage} />
      <Route path="/blog"         component={BlogPage} />
      <Route path="/events"       component={EventsPage} />
      <Route path="/help"         component={HelpPage} />
      <Route path="/contact"      component={ContactPage} />
      <Route path="/terms"        component={TermsPage} />
      <Route path="/privacy"      component={PrivacyPage} />
      <Route path="/sitemap"      component={SitemapPage} />
      <Route path="/about"        component={AboutPage} />
      <Route path="/pricing"      component={PricingPage} />
      <Route path="/careers"      component={CareersPage} />
      <Route path="/press"        component={PressPage} />
      <Route path="/cookies"      component={CookiesPage} />

      {/* Public: task details can be viewed without login */}
      <Route path="/request/:id"           component={RequestDetails} />
      <Route path="/public-profile/:userId" component={PublicProfilePage} />

      {/* ── Protected routes — must be logged in + onboarding done/skipped ── */}
      <Route path="/dashboard">
        {() => <P><Dashboard /></P>}
      </Route>
      <Route path="/create-request">
        {() => <P><CreateRequest /></P>}
      </Route>
      <Route path="/create-offer">
        {() => <P><CreateOfferPage /></P>}
      </Route>
      <Route path="/admin">
        {() => <P><AdminDashboard /></P>}
      </Route>
      <Route path="/messages">
        {() => <P><MessagesPage /></P>}
      </Route>
      <Route path="/wallet">
        {() => <P><WalletPage /></P>}
      </Route>
      <Route path="/settings">
        {() => <P><SettingsPage /></P>}
      </Route>
      <Route path="/profile">
        {() => <P><ProfilePage /></P>}
      </Route>
      <Route path="/batch/:id">
        {() => <P><BatchManagementPage /></P>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function MobileMenuOverlay() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  if (!isMobileMenuOpen) return null;
  return (
    <div
      className="fixed inset-0 z-40 md:hidden"
      style={{ backgroundColor: "rgba(0,0,0,0.12)", cursor: "pointer" }}
      onClick={() => setIsMobileMenuOpen(false)}
    />
  );
}

function App() {
  return (
    <FirebaseAuthProvider>
      <MobileMenuProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <MobileMenuOverlay />
            <Router />
            <Chatbot />
          </TooltipProvider>
        </QueryClientProvider>
      </MobileMenuProvider>
    </FirebaseAuthProvider>
  );
}

export default App;
