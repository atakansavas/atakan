import { LangProvider } from "./_components/LangProvider";
import { Atmosphere } from "./_components/Atmosphere";
import { ScrollProgress } from "./_components/ScrollProgress";
import { TopBar } from "./_components/TopBar";
import { Hero } from "./_components/Hero";
import { Manifesto } from "./_components/Manifesto";
import { Place } from "./_components/Place";
import { Marquee } from "./_components/Marquee";
import { Feed } from "./_components/Feed";
import { Footer } from "./_components/Footer";

export default function SanAiPage() {
  return (
    <LangProvider>
      <Atmosphere />
      <ScrollProgress />
      <TopBar />
      <main className="relative z-10">
        <Hero />
        <Manifesto />
        <Place />
        <Marquee />
        <Feed />
      </main>
      <Footer />
    </LangProvider>
  );
}
