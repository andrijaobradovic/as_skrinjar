import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktirajte AS Škrinjar autoservis — telefon, email ili kontakt forma.",
};

const INTRO_TEXT =
  "Za sva pitanja, saradnju, ili savet, pozovite nas ili nam pišite putem mejla ili kontakt forme. Usluge pružamo svim fizičkim i pravnim licima.";

export default function KontaktPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Kontakt
          </h1>

          <p className="leading-relaxed text-muted-foreground">{INTRO_TEXT}</p>

          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Telefon</p>
              <a
                href="tel:+381628005530"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                +381 62 800 55 30
              </a>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Radno vreme</p>
              <p className="text-muted-foreground">
                Ponedeljak – Subota | 09:00 – 20:00
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Email</p>
              <a
                href="mailto:info@as.skrinjar.rs"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                info@as.skrinjar.rs
              </a>
            </div>
          </div>
        </div>

        <div className="lg:pt-2">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
