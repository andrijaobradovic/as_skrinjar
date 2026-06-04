# PRD — AS Škrinjar

Projektna dokumentacija (Product Requirements Document) za veb sajt firme **AS Škrinjar**.

> Ovaj dokument opisuje **šta** sajt treba da radi i za koga je namenjen. Tehnički detalji i baza podataka su namerno izostavljeni — oni se nalaze u `Tech.md` i `DB.md`.

---

## 1. Pregled projekta

AS Škrinjar je firma koja se bavi **autoservisom, chiptuningom i prodajom automobila**. Cilj sajta je da na jednom mestu:

- predstavi firmu i njene usluge,
- prikaže automobile koji su trenutno na prodaji,
- omogući posetiocima da prate stanje svog vozila na servisu,
- pruži jednostavan kontakt sa firmom.

Sajt ima i **skriveni administrativni deo** preko kojeg vlasnik (jedan jedini admin) upravlja sadržajem — dodaje i uklanja oglase i unosi statuse vozila na servisu.

---

## 2. Ciljevi

- Profesionalan, moderan i brz sajt koji ostavlja utisak poverenja.
- Jednostavno održavanje sadržaja od strane vlasnika, bez tehničkog znanja.
- Posetioci lako pronalaze automobile na prodaju i informacije o uslugama.
- Posetioci mogu da se prijave na obaveštenja o novim automobilima.

---

## 3. Ciljna publika

- **Kupci automobila** — traže polovne/nove automobile na prodaju.
- **Vlasnici vozila na servisu** — žele da provere status svog automobila.
- **Zainteresovani za chiptuning i servisne usluge.**
- **Administrator (vlasnik firme)** — upravlja celokupnim sadržajem sajta.

---

## 4. Jezik i ton

- Ceo sajt je na **srpskom jeziku (latinica)**.
- Ton komunikacije: profesionalan, jasan, pristupačan.

---

## 5. Stranice i funkcionalnosti

Sajt se sastoji od pet javnih stranica i jednog skrivenog admin dela.

### 5.1 Početna
Klasična landing stranica koja predstavlja firmu. Sadrži:
- **Hero sekciju** (naziv firme, kratak slogan, poziv na akciju),
- **Sekciju "Usluge"** — Autoservis, Chiptuning, Prodaja automobila,
- **Istaknute automobile** — 3 oglasa koje administrator ručno označi kao istaknute,
- **Poziv na akciju (CTA)** i kratku **kontakt sekciju**.

Početna stranica **nema** nikakve administrativne funkcionalnosti.

### 5.2 Chiptuning
Informativna stranica sa osnovnim informacijama o chiptuningu (tekst priprema tim, vlasnik odobrava). Na dnu ima dugme **"Kontaktiraj nas"** koje vodi na stranicu Kontakt.

### 5.3 Automobili
Stranica sa oglasima automobila koji su na prodaji.

- Na vrhu se nalazi **sekcija za prijavu na obaveštenja** — posetilac unosi svoj e-mail kako bi dobijao obaveštenje kada izađe novi oglas.
- Oglasi se listaju u mreži, **3 oglasa u jednom redu**, sortirani tako da je **najnoviji prvi**.
- Kada ima puno oglasa, koristi se dugme **"Učitaj još"**.
- **Skraćena kartica oglasa** prikazuje: glavnu sliku, marku, model, cenu, godište i kilometražu.
- Klikom na karticu otvara se **detaljna stranica oglasa** sa galerijom slika (slider) i svim informacijama o automobilu, uključujući opcioni opis.
- Ako trenutno nema oglasa, prikazuje se prijatna poruka uz dugme za prijavu na obaveštenja.

**Administrativne funkcije (vidljive samo adminu):**
- Dugme **"Dodaj oglas"** — otvara formu za unos novog oglasa.
- Dugme **"Izmeni"** — izmena postojećeg oglasa.
- Dugme **"Obriši oglas"** na svakoj kartici — uklanja oglas (uz potvrdu).

#### Informacije o automobilu (forma za oglas)
Obavezna polja: **marka, model, cena (€), godište, najmanje 1 slika**. Ostala polja su opciona:

- **Slike** — proizvoljan broj, najviše 20.
- **Opis** — opcioni slobodan tekst (više redova).
- Tekstualna polja: marka, model, boja.
- Brojčana polja: cena (€), godište, kubikaža, snaga (kW), kilometraža.
- Padajući izbori: karoserija, vrsta goriva, emisiona klasa, vrsta pogona, vrsta menjača, broj vrata, broj sedišta, strana volana, vrsta klime, materijal enterijera, boja enterijera, registrovan, poreklo, zamena.
- Više-izbor (checkbox liste): stanje automobila, sigurnost, oprema.

(Potpune liste ponuđenih vrednosti su navedene u `DB.md`.)

### 5.4 Status
Javna stranica koja prikazuje vozila trenutno na servisu i njihov status.

- Vozila se prikazuju kao **pravougaonici jedan ispod drugog**, sortirani redosledom kojim ih admin dodaje.
- Levo se prikazuju **tablice**, desno **status**: "Na čekanju", "Servis u toku" ili "Servis završen".
- Status se vizuelno razlikuje bojom (čekanje — sivo, u toku — žuto, završeno — zeleno).

**Administrativne funkcije (vidljive samo adminu):**
- Interfejs na vrhu stranice: unos broja tablica + izbor statusa + dugme **"Dodaj"**.
- Promena statusa klikom na trenutni status vozila (otvara se izbor novog statusa).
- Dugme **"Obriši"** na kartici vozila (uz potvrdu).

### 5.5 Kontakt
- Prikaz **broja telefona** i **e-mail adrese**.
- **Kontakt forma** (ime, e-mail, telefon, tema, poruka) — poruke stižu na e-mail firme.
- **Mapa** sa lokacijom servisa.

---

## 6. Administracija sajta

- Postoji **tačno jedan admin nalog**.
- Sajt **nema** javnu registraciju niti javni login — postoji samo **skriveni login** dostupan adminu.
- Administrativna dugmad i interfejsi su **vidljivi isključivo nakon prijave** admina.
- Admin može da: doda/izmeni/obriše oglas, doda/izmeni status vozila na servisu, obriše vozilo sa servisa, označi automobile kao istaknute.
- Obične posetioce admin funkcije ne ometaju — oni ih uopšte ne vide.

---

## 7. Obaveštenja (newsletter)

- Posetioci se prijavljuju unosom e-mail adrese na stranici Automobili.
- Kada admin objavi **novi oglas**, svim prijavljenima automatski stiže obaveštenje e-mailom.
- Svaki e-mail sadrži **link za odjavu** sa liste.

---

## 8. Van opsega (za sad)

Ove stavke nisu deo prve verzije sajta:

- Pretraga i filtriranje automobila.
- Online plaćanje ili rezervacija vozila.
- Više korisničkih naloga ili uloga osim jednog admina.
- Ocene i komentari korisnika.

---

## 9. Mere uspeha

- Sajt je responzivan i radi besprekorno na mobilnim uređajima i desktopu.
- Admin samostalno upravlja oglasima i statusima bez pomoći programera.
- Posetioci lako pronalaze automobile i kontaktiraju firmu.
- Obaveštenja o novim oglasima se uspešno isporučuju pretplatnicima.
