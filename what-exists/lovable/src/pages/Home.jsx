import HeroSection from "../components/home/HeroSection";
import FeaturedArtifacts from "../components/home/FeaturedArtifacts";
import HowItWorksGrid from "../components/home/HowItWorksGrid";
import ForWho from "../components/home/ForWho";
import SiteFooter from "../components/home/SiteFooter";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedArtifacts />
      <div id="how-it-works">
        <HowItWorksGrid />
      </div>
      <div id="for-who">
        <ForWho />
      </div>
      <SiteFooter />
    </div>
  );
}