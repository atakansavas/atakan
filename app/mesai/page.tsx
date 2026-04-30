import { Hero } from "./_components/Hero";
import { Features } from "./_components/Features";
import { HowItWorks } from "./_components/HowItWorks";
import { TechStack } from "./_components/TechStack";
import { Footer } from "./_components/Footer";

export default function MesaiPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <TechStack />
      <Footer />
    </main>
  );
}
