import { Hero } from "./_components/Hero";
import { Concept } from "./_components/Concept";
import { ChefAndRoles } from "./_components/ChefAndRoles";
import { OfficeDesign } from "./_components/OfficeDesign";
import { OfficeGallery } from "./_components/OfficeGallery";
import { WorldVision } from "./_components/WorldVision";
import { TechStack } from "./_components/TechStack";
import { InteractiveWaitlist } from "./_components/InteractiveWaitlist";
import { Footer } from "./_components/Footer";
import { LangProvider } from "./_components/LangProvider";

export default function MesaiPage() {
  return (
    <LangProvider>
      <main className="min-h-screen">
        <Hero />
        <Concept />
        <ChefAndRoles />
        <OfficeDesign />
        <OfficeGallery />
        <WorldVision />
        <TechStack />
        <InteractiveWaitlist />
        <Footer />
      </main>
    </LangProvider>
  );
}
