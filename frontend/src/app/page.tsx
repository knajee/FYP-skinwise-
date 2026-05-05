import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureStrip from "@/components/landing/FeatureStrip";
import FeatureDetails from "@/components/landing/FeatureDetails";
import SocialProof from "@/components/landing/SocialProof";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <Hero />
      <FeatureStrip />
      <FeatureDetails />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </div>
  );
}
