import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Hero from '../../components/sections/Hero';
import CareCategories from '../../components/sections/CareCategories';
import DirectAccessBento from '../../components/sections/DirectAccessBento';
import CinematicOutcomes from '../../components/sections/CinematicOutcomes';
import AudienceAccordion from '../../components/sections/AudienceAccordion';
import TrustedMarquee from '../../components/sections/TrustedMarquee';
import EditorialIntro from '../../components/sections/EditorialIntro';
import MissionStrip from '../../components/sections/MissionStrip';
import HowItWorks from '../../components/sections/HowItWorks';
import Outcomes from '../../components/sections/Outcomes';
import Testimonials from '../../components/sections/Testimonials';
import ContactBand from '../../components/sections/ContactBand';

export default function Home() {
  return (
    <div className="bg-maven-paper text-maven-pine">
      <Header />
      <main>
        <Hero />
        <CareCategories />
        <DirectAccessBento />
        <CinematicOutcomes />
        <AudienceAccordion />
        <TrustedMarquee />
        <EditorialIntro />
        <MissionStrip />
        <Outcomes />
        <HowItWorks />
        <Testimonials />
        <ContactBand />
      </main>
      <Footer />
    </div>
  );
}
