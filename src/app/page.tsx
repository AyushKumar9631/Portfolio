import IntroScreen from "@/components/IntroScreen";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Stack from "@/components/Stack";
import Timeline from "@/components/Timeline";

export default function Home() {
  return (
    <>
      <IntroScreen />
      <Nav />
      <main id="top">
        <Hero />
        <Work />
        <Stack />
        <Timeline />
      </main>
    </>
  );
}
