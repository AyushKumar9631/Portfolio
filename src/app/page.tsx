import IntroScreen from "@/components/IntroScreen";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <>
      <IntroScreen />
      <Nav />
      <main id="top" className="pt-16">
        <section className="flex min-h-screen items-center justify-center font-mono text-sm text-muted">
          Hero section — built in Task 2
        </section>
      </main>
    </>
  );
}
