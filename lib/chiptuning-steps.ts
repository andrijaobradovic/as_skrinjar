export type ChiptuningStep = {
  title: string;
  description: string;
};

export const CHIPTUNING_STEPS: ChiptuningStep[] = [
  {
    title: "Detaljan pregled vozila",
    description:
      "Pre početka radova, vršimo detaljan dijagnostički i fizički pregled vašeg vozila. Ovaj korak osigurava da je vozilo u dobrom stanju i spremno za optimizaciju, identifikujući bilo kakve potencijalne probleme unapred.",
  },
  {
    title: "Pregled mape",
    description:
      "Nakon pregleda, skidamo originalnu mapu iz ECU jedinice vašeg vozila. Pažljivo pregledamo sve parametre i proveravamo da li je bilo prethodnih intervencija na softveru, kako bismo imali jasnu sliku o trenutnom stanju.",
  },
  {
    title: "Izrada custom mape",
    description:
      "Na osnovu specifičnih parametara vašeg vozila, izrađujemo custom mapu koja je prilagođena za postizanje najboljeg kvaliteta i efikasnosti chiptuninga. Ovaj proces uključuje precizno podešavanje svih ključnih parametara kako bi se osigurale optimalne performanse i pouzdanost",
  },
  {
    title: "Upisivanje mape i provera",
    description:
      "Nakon što je nova mapa spremna, upisujemo je nazad u vozilo. Vršimo ponovan dijagnostički pregled i pažljivo proveravamo sve parametre kako bismo se uverili u ispravnost i kvalitet obavljenog posla. Ovaj završni korak osigurava da vaše vozilo radi optimalno i bez problema.",
  },
];

export const CHIPTUNING_INTRO = [
  "Chiptuning predstavlja proces optimizacije softvera u upravljačkoj jedinici motora (ECU) sa ciljem poboljšanja performansi vozila. Preciznim podešavanjem fabričkih parametara moguće je povećati snagu i obrtni moment motora, unaprediti odziv na gas i u određenim slučajevima smanjiti potrošnju goriva. Svako vozilo se analizira pojedinačno kako bi se postigli optimalni rezultati uz očuvanje pouzdanosti motora.",
  "Korišćenjem savremene dijagnostičke opreme i proverenih softverskih rešenja, chiptuning omogućava vozačima da iz svog vozila izvuku maksimum. Bilo da želite bolje performanse za svakodnevnu vožnju, sigurnija preticanja ili efikasniji rad motora, profesionalno podešavanje može značajno unaprediti celokupno iskustvo za volanom.",
  "U AS Skrinjar-u svaki projekat se realizuje uz detaljnu proveru tehničkog stanja vozila i prilagođavanje softvera njegovim karakteristikama. Naš cilj je da obezbedimo više snage, bolju voznu dinamiku i maksimalno zadovoljstvo klijenata, uz stručan pristup i visok nivo bezbednosti tokom celog procesa.",
] as const;
