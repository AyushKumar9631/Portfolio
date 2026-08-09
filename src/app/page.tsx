import IntroScreen from "@/components/IntroScreen";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";

export default function Home() {
  return (
    <>
      <IntroScreen />
      <Nav />
      <main id="top">
        <Hero />
        <Work />
      </main>
    </>
  );
}
