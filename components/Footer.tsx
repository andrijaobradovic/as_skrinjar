import Link from "next/link";
import { MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";

import { InstagramIcon } from "@/components/icons/instagram";

const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/automobili", label: "Automobili" },
  { href: "/chiptuning", label: "Chiptuning" },
  { href: "/status", label: "Status" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-base font-semibold tracking-tight">AS Škrinjar</p>
          <p className="max-w-xs text-sm text-muted-foreground">
          Nudimo vam prodaju kvalitetnih polovnih automobila, kompletne autoservisne usluge i profesionalni chiptuning. Povećajte performanse, smanjite potrošnju i vozite bez brige uz tim kojem možete verovati.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Navigacija</p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Kontakt</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <PhoneIcon className="size-4 shrink-0" />
              <a href="tel:+381000000000" className="transition-colors hover:text-foreground">
                +381 62 800 55 30
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MailIcon className="size-4 shrink-0" />
              <a href="mailto:info@as-skrinjar.rs" className="transition-colors hover:text-foreground">
                info@as.skrinjar.rs
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="size-4 shrink-0" />
              <span>Kostolac, Srbija</span>
            </li>
            <li>
              <a
                href="https://www.instagram.com/as_skrinjar_chip_tuning/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <InstagramIcon className="size-4 shrink-0" />
                <span>AS Škrinjar</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AS Škrinjar. Sva prava zadržana.
          </p>
        </div>
      </div>
    </footer>
  );
}
