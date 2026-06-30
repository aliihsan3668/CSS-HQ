import { Hero } from "@/components/marketing/hero";
import { SubjectsPreview } from "@/components/marketing/subjects-preview";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { getAllSubjects } from "@/lib/subjects";
import { getActivePricing } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [subjects, pricing] = await Promise.all([
    getAllSubjects(),
    getActivePricing(),
  ]);

  return (
    <>
      <Hero />
      <SubjectsPreview subjects={subjects} pricing={pricing} />
      <HowItWorks />
      <Features />
      <Pricing pricing={pricing} />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
