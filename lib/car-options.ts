export const CAR_UNDEFINED_VALUE = "Nedefinisano";

export const KAROSERIJA_OPTIONS = [
  "Limuzina",
  "Hečbek",
  "Karavan",
  "Kupe",
  "Kabriolet",
  "MiniVan",
  "Džip/SUV",
  "PickUp",
] as const;

export const GORIVO_OPTIONS = [
  "Benzin",
  "Dizel",
  "Benzin + Gas",
  "Benzin + Metan",
  "Električni pogon",
  "Hibridni pogon",
] as const;

export const EMISIONA_KLASA_OPTIONS = [
  "Euro 1",
  "Euro 2",
  "Euro 3",
  "Euro 4",
  "Euro 5",
  "Euro 6",
] as const;

export const POGON_OPTIONS = ["Prednji", "Zadnji", "4x4", "4x4 reduktor"] as const;

export const MENJAC_OPTIONS = [
  "Manuelni 4 brzine",
  "Manuelni 5 brzine",
  "Manuelni 6 brzine",
  "Automatski/Poluautomatski",
] as const;

export const BROJ_VRATA_OPTIONS = ["2/3", "4/5"] as const;

export const BROJ_SEDISTA_OPTIONS = ["2", "3", "4", "5", "6", "7", "8", "9"] as const;

export const STRANA_VOLANA_OPTIONS = ["Levi volan", "Desni volan"] as const;

export const KLIMA_OPTIONS = [
  "Nema klime",
  "Manuelna klima",
  "Automatska klima",
] as const;

export const MATERIJAL_ENTERIJERA_OPTIONS = [
  "Štof",
  "Prirodna koža",
  "Kombinovana koža",
  "Velur",
  "Drugi",
] as const;

export const BOJA_ENTERIJERA_OPTIONS = [
  "Crna",
  "Bež",
  "Smeđa",
  "Siva",
  "Druga",
] as const;

export const REGISTROVAN_OPTIONS = ["Da", "Ne"] as const;

export const POREKLO_OPTIONS = [
  "Domaće tablice",
  "Na ime kupca",
  "Strane tablice",
] as const;

export const ZAMENA_OPTIONS = [
  "Zamena za jeftinije",
  "U istoj ceni",
  "Zamena za skuplje",
  "Svejedno",
] as const;

export const STANJE_OPTIONS = [
  "Prvi vlasnik",
  "Kupljen nov u Srbiji",
  "Garancija",
  "Garažiran",
  "Servisna knjiga",
  "Restauriran",
  "Oldtimer",
  "Prilagođeno invalidima",
  "Taxi",
  "Rezervni ključ",
  "Tuning",
  "Test vozilo",
  "Vozilo auto škole",
] as const;

export const SIGURNOST_OPTIONS = [
  "Airbag za vozača",
  "Airbag za suvozača",
  "Bočni airbag",
  "Child lock",
  "ABS",
  "ESP",
  "ASR",
  "Alarm",
  "Kodirani ključ",
  "Blokada motora",
  "Centralno zaključavanje",
  "Mehanička zaštita",
  "Ulazak bez ključa",
  "Asistencija praćenja trake",
  "Senzor mrtvog ugla",
  "OBD zaštita",
  "Vazdušni jastuci za kolena",
  "Automatsko kočenje",
] as const;

export const OPREMA_OPTIONS = [
  "Metalik boja",
  "Branici u boji auta",
  "Servo volan",
  "Multifunkcionalni volan",
  "Tempomat",
  "Daljinsko zaključavanje",
  "Putni računar",
  "Šiber",
  "Panorama krov",
  "Tonirana stakla",
  "Električni podizači",
  "Električni retrovizori",
  "Grejači retrovizora",
  "Sedišta podesiva po visini",
  "Elektro podesiva sedišta",
  "Grejanje sedišta",
  "Svetla za maglu",
  "Xenon svetla",
  "Senzori za svetla",
  "Senzori za kišu",
  "Parking senzori",
  "Webasto",
  "Krovni nosač",
  "Kuka za vuču",
  "Aluminijumske felne",
  "Navigacija",
  "Radio/Kasetofon",
  "Radi CD",
  "CD changer",
  "DVD/TV",
  "Bluetooth",
  "LED prednja svetla",
  "LED zadnja svetla",
  "Grejači vetrobranskog stakla",
  "Naslon za ruku",
  "Adaptivni tempomat",
  "Automatsko parkiranje",
  "Kamera",
  "Hands free",
  "Adaptivna svetla",
  "Head-up display",
  "ISOFIX sistem",
  "Prednja noćna kamera",
  "Multimedija",
  "Glasovne komande",
  "Masažna sedišta",
  "Elektro sklopivi retrovizori",
  "Memorija sedišta",
  "Sportska sedišta",
  "Sportsko vešanje",
  "DPF filter",
  "Dnevna svetla",
  "Torba za skije",
  "Upravljanje na sva četiri točka",
  "Brisači prednjih farova",
  "360 kamera",
  "Fabrički ugrađeno dečije sedište",
  "Ekran na dodir",
  "Kožni volan",
  "Volan u kombinaciji drvo-koža",
  "Grejanje volana",
  "Elektro zatvaranje prtljažnika",
  "Zavesice na zadnjim prozorima",
  "Privlačenje vrata pri zatvaranju",
  "USB",
  "Paljenje bez ključa",
  "Hard disk",
  "Ventilacija sedišta",
  "Vazdušno vešanje",
  "Ambijentalno osvetljenje",
  "Subwoofer",
  "MP3",
  "Digitalni radio",
  "Utičnica od 12V",
  "Elektro otvaranje prtljažnika",
  "Zaključavanje diferencijala",
  "Otvor za skije",
  "Podešavanje volana po visini",
  "Držači za čaše",
  "Ručice za menjanje brzina na volanu",
  "Retrovizor se obara pri rikvercu",
  "Automatsko zatamnjivanje retrovizora",
  "Rezervni točak",
  "Indikator niskog pritiska u gumama",
  "Keramičke kočnice",
  "Elektro ručna kočnica",
  "Asistencija za kretanje na uzbrdici",
  "AUX konekcija",
  "Modovi vožnje",
  "Postolje za bežično punjenje telefona",
  "Apple CarPlay",
  "Android Auto",
  "Autonomna vožnja",
  "Virtuelna tabla",
  "Matrix farovi",
] as const;

export type CarSelectField =
  | "karoserija"
  | "gorivo"
  | "emisiona_klasa"
  | "pogon"
  | "menjac"
  | "broj_vrata"
  | "broj_sedista"
  | "strana_volana"
  | "klima"
  | "materijal_enterijera"
  | "boja_enterijera"
  | "registrovan"
  | "poreklo"
  | "zamena";

export const CAR_SELECT_FIELDS: Record<
  CarSelectField,
  { label: string; options: readonly string[] }
> = {
  karoserija: { label: "Karoserija", options: KAROSERIJA_OPTIONS },
  gorivo: { label: "Vrsta goriva", options: GORIVO_OPTIONS },
  emisiona_klasa: { label: "Emisiona klasa", options: EMISIONA_KLASA_OPTIONS },
  pogon: { label: "Vrsta pogona", options: POGON_OPTIONS },
  menjac: { label: "Vrsta menjača", options: MENJAC_OPTIONS },
  broj_vrata: { label: "Broj vrata", options: BROJ_VRATA_OPTIONS },
  broj_sedista: { label: "Broj sedišta", options: BROJ_SEDISTA_OPTIONS },
  strana_volana: { label: "Strana volana", options: STRANA_VOLANA_OPTIONS },
  klima: { label: "Vrsta klime", options: KLIMA_OPTIONS },
  materijal_enterijera: {
    label: "Materijal enterijera",
    options: MATERIJAL_ENTERIJERA_OPTIONS,
  },
  boja_enterijera: { label: "Boja enterijera", options: BOJA_ENTERIJERA_OPTIONS },
  registrovan: { label: "Registrovan", options: REGISTROVAN_OPTIONS },
  poreklo: { label: "Poreklo", options: POREKLO_OPTIONS },
  zamena: { label: "Zamena", options: ZAMENA_OPTIONS },
};

export const CAR_CHECKBOX_GROUPS = {
  stanje: { label: "Stanje automobila", options: STANJE_OPTIONS },
  sigurnost: { label: "Sigurnost", options: SIGURNOST_OPTIONS },
  oprema: { label: "Oprema", options: OPREMA_OPTIONS },
} as const;

export function withUndefinedOption(options: readonly string[]): string[] {
  return [CAR_UNDEFINED_VALUE, ...options];
}
