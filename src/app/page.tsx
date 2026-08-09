import IntroScreen from "@/components/IntroScreen";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Stack from "@/components/Stack";

export default function Home() {
  return (
    <>
      <IntroScreen />
      <Nav />
      <main id="top">
        <Hero />
        <Work />
        <Stack />
      </main>
    </>
  );
}
