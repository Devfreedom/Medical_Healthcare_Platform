import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Hero from '../../components/sections/Hero';
import MissionStrip from '../../components/sections/MissionStrip';
import CareCategories from '../../components/sections/CareCategories';
import HowItWorks from '../../components/sections/HowItWorks';
import ContactBand from '../../components/sections/ContactBand';

export default function Home() {
  return (
    <div className="bg-nb-paper text-nb-ink">
      <Header />
      <main>
        <Hero />
        <MissionStrip />
        <CareCategories />
        <HowItWorks />
        <ContactBand />
      </main>
      <Footer />
    </div>
  );
}
