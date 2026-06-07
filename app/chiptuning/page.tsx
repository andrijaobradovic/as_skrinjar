import type { Metadata } from "next";

import { ProcessSection } from "@/components/chiptuning/ProcessSection";
import { CHIPTUNING_INTRO } from "@/lib/chiptuning-steps";

export const metadata: Metadata = {
  title: "Chiptuning",
  description:
    "Profesionalni chiptuning, detaljan pregled vozila, analiza ECU mape, izrada custom mape i siguran upis. Povećajte performanse i smanjite potrošnju.",
};

export default function ChiptuningPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-primary">CHIP</span>TUNING
        </h1>

        <div className="space-y-4 leading-relaxed text-muted-foreground">
          {CHIPTUNING_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">
          PROCES <span className="text-primary">CHIP</span>TUNINGA
        </h2>

        <ProcessSection />
      </div>
    </section>
  );
}
