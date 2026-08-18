"use client";

import { useEffect, useState } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Pick up an already-live admin session on load (e.g. a manual refresh
  // while the 5-minute cache still has time left) — no alert here, that
  // only fires on a fresh unlock below.
  useEffect(() => {
    fetch("/api/admin/status")
      .then((r) => r.json())
      .then((d) => {
        if (d?.isAdmin) {
          setIsAdmin(true);
          setExpiresAt(typeof d.expiresAt === "number" ? d.expiresAt : null);
        }
      })
      .catch(() => {});
  }, []);

  function handleAdminUnlock(nextExpiresAt: number | null) {
    setIsAdmin(true);
    setExpiresAt(nextExpiresAt);
    window.alert("Admin Mode activated");
  }

  // Countdown toward the cache's TTL, and the auto-refresh that resets
  // admin mode the moment it hits zero.
  useEffect(() => {
    if (!isAdmin || !expiresAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the countdown when admin mode itself just turned off
      setSecondsLeft(null);
      return;
    }

    function tick() {
      const remaining = Math.max(0, Math.round(((expiresAt as number) - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        window.location.reload();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isAdmin, expiresAt]);

  return (
    <>
      <IntroScreen />
      <Masthead />
      <Nav isAdmin={isAdmin} secondsLeft={secondsLeft} />
      <main id="top">
        <Hero />
        <Work />
        <Stack isAdmin={isAdmin} onAdminUnlock={handleAdminUnlock} />
        <Timeline />
        <Contact isAdmin={isAdmin} />
      </main>
      <Footer />
    </>
  );
}
