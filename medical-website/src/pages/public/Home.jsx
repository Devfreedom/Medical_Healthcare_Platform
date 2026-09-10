import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Hero from '../../components/sections/Hero';
import CareCategories from '../../components/sections/CareCategories';
import DirectAccessBento from '../../components/sections/DirectAccessBento';
import CinematicOutcomes from '../../components/sections/CinematicOutcomes';
import ContinuingCare from '../../components/sections/ContinuingCare';
import AudienceAccordion from '../../components/sections/AudienceAccordion';
import TrustedMarquee from '../../components/sections/TrustedMarquee';
import RealStoriesCTA from '../../components/sections/RealStoriesCTA';
import HowItWorks from '../../components/sections/HowItWorks';

export default function Home() {
  return (
    <div className="bg-maven-paper text-maven-pine">
      <Header />
      <main>
        {/* Hero */}
        <Hero />
        {/* Interactive Care Panels */}
        <CareCategories />
        {/* Direct Access + Virtual Care Bento */}
        <DirectAccessBento />
        {/* Cinematic Family Image + Animated Outcomes / Evidence (cream) */}
        <CinematicOutcomes />
        {/* Continuing Care (dark green) */}
        <ContinuingCare />
        {/* Audience Accordion + Image Swap */}
        <AudienceAccordion />
        {/* Member Journey */}
        <HowItWorks />
        {/* Trusted By */}
        <TrustedMarquee />
        {/* Real Stories + Testimonial Carousel + Final CTA / Book a Demo */}
        <RealStoriesCTA />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}
