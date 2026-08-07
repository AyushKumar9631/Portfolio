import IntroScreen from "@/components/IntroScreen";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <IntroScreen />
      <Nav />
      <main id="top">
        <Hero />
        <section
          id="work"
          className="flex min-h-screen items-center justify-center font-mono text-sm text-muted"
        >
          Work section — built in Task 3
        </section>
      </main>
    </>
  );
}
