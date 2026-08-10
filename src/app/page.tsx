import IntroScreen from "@/components/IntroScreen";
import Masthead from "@/components/Masthead";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Stack from "@/components/Stack";
import Timeline from "@/components/Timeline";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <IntroScreen />
      <Masthead />
      <Nav />
      <main id="top">
        <Hero />
        <Work />
        <Stack />
        <Timeline />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
