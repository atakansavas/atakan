import { LangProvider } from "./_components/LangProvider";
import { TopBar } from "./_components/TopBar";
import { Hero } from "./_components/Hero";
import { Manifesto } from "./_components/Manifesto";
import { Place } from "./_components/Place";
import { DayHere } from "./_components/DayHere";
import { Feed } from "./_components/Feed";
import { Invite } from "./_components/Invite";
import { Footer } from "./_components/Footer";

export default function SanAiPage() {
  return (
    <LangProvider>
      <TopBar />
      <main>
        <Hero />
        <Manifesto />
        <Place />
        <DayHere />
        <Feed />
        <Invite />
      </main>
      <Footer />
    </LangProvider>
  );
}
