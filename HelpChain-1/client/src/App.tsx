import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { MobileMenuProvider } from "@/contexts/mobile-menu-context";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Chatbot } from "@/components/chatbot/chatbot";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import IntroOnboardingPage from "@/pages/intro-onboarding";
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

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function Router() {
  return (
    <Switch>
      <Route path="/"              component={Home} />
      <Route path="/intro"         component={IntroOnboardingPage} />
      <Route path="/auth"          component={AuthPage} />
      <Route path="/onboarding"    component={OnboardingPage} />

      <Route path="/discover"      component={DiscoverPage} />
      <Route path="/search"        component={DiscoverPage} />
      <Route path="/how-it-works"  component={HowItWorks} />
      <Route path="/safety"        component={SafetyPage} />
      <Route path="/stories"       component={StoriesPage} />
      <Route path="/volunteers"    component={VolunteersPage} />
      <Route path="/blog"          component={BlogPage} />
      <Route path="/events"        component={EventsPage} />
      <Route path="/help"          component={HelpPage} />
      <Route path="/contact"       component={ContactPage} />
      <Route path="/terms"         component={TermsPage} />
      <Route path="/privacy"       component={PrivacyPage} />
      <Route path="/sitemap"       component={SitemapPage} />
      <Route path="/about"         component={AboutPage} />
      <Route path="/pricing"       component={PricingPage} />
      <Route path="/careers"       component={CareersPage} />
      <Route path="/press"         component={PressPage} />
      <Route path="/cookies"       component={CookiesPage} />

      <Route path="/request/:id"            component={RequestDetails} />
      <Route path="/public-profile/:userId" component={PublicProfilePage} />

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

function AppShell() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("hc-splash-shown");
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("hc-splash-shown", "true");
    setShowSplash(false);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
      {!showSplash && (
        <>
          <Router />
          <Chatbot />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <FirebaseAuthProvider>
      <MobileMenuProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <AppShell />
          </TooltipProvider>
        </QueryClientProvider>
      </MobileMenuProvider>
    </FirebaseAuthProvider>
  );
}

export default App;
