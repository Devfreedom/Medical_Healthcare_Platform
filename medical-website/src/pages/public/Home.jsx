import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Hero from '../../components/sections/Hero';
import MissionStrip from '../../components/sections/MissionStrip';
import CareCategories from '../../components/sections/CareCategories';
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
