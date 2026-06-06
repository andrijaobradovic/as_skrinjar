export type LandingService = {
  title: string;
  titleParts?: { accent: string; rest: string };
  href: string;
  image: string;
  alt: string;
  description: string;
};

export const landingServices: LandingService[] = [
  {
    title: "MEHANIKA",
    href: "/status",
    image: "/car_mechanic.jpg",
    alt: "Mehanika i autoservis AS Škrinjar — dijagnostika, redovno održavanje i popravka vozila",
    description:
      "Kompletan autoservis, dijagnostika i redovno održavanje vozila. Pratite status svojih popravki online i uvek znajte u kom stanju je vaše vozilo.",
  },
  {
    title: "CHIPTUNING",
    titleParts: { accent: "CHIP", rest: "TUNING" },
    href: "/chiptuning",
    image: "/car_chiptuning.jpg",
    alt: "Chiptuning AS Škrinjar — optimizacija performansi motora i softversko podešavanje ECU jedinice",
    description:
      "Optimizacija ECU softvera za više snage, bolji odziv i efikasniju vožnju. Svako vozilo analiziramo pojedinačno kako bismo postigli maksimalne i pouzdane rezultate.",
  },
  {
    title: "POLOVNI AUTOMOBILI",
    href: "/automobili",
    image: "/car_selling.jpg",
    alt: "Auto plac AS Škrinjar — pregled polovnih i novih automobila u ponudi za kupovinu",
    description:
      "Pregledajte pažljivo odabranu ponudu polovnih automobila spremnih za kupovinu. Detaljni opisi, fotografije i transparentne cene na jednom mestu.",
  },
];
