# DB.md — Šema baze podataka

Šema baze za sajt **AS Škrinjar**, na Supabase (Postgres). Definiše tabele, kolone, tipove, dozvoljene vrednosti, relacije, RLS politike i Storage.

> Konvencija: nazivi tabela i kolona su na engleskom (snake_case); vrednosti koje vidi korisnik su na srpskom. Dozvoljene vrednosti za padajuće i checkbox liste centralizovane su u aplikaciji (`lib/car-options.ts`).

---

## 1. Pregled tabela

| Tabela | Opis |
|--------|------|
| `cars` | Oglasi automobila na prodaji |
| `car_images` | Slike vezane za oglas (1 oglas → više slika) |
| `service_status` | Vozila trenutno na servisu i njihov status |
| `subscribers` | E-mail adrese prijavljene na obaveštenja |

Auth korisnici se čuvaju u Supabase `auth.users` (upravlja Supabase) — ne pravimo zasebnu tabelu za admina.

---

## 2. Tabela `cars`

Glavna tabela sa oglasima. Obavezna polja: `marka`, `model`, `cena_eur`, `godiste` (+ bar jedna slika u `car_images`). Ostalo je opciono (`NULL` dozvoljen).

| Kolona | Tip | Null | Opis |
|--------|-----|------|------|
| `id` | `uuid` PK, default `gen_random_uuid()` | ne | Identifikator |
| `created_at` | `timestamptz` default `now()` | ne | Vreme kreiranja (sortiranje: najnoviji prvi) |
| `is_featured` | `boolean` default `false` | ne | Istaknut na Početnoj |
| `marka` | `text` | ne | Marka (slobodan tekst) |
| `model` | `text` | ne | Model (slobodan tekst) |
| `cena_eur` | `integer` | ne | Cena u evrima |
| `godiste` | `integer` | ne | Godina proizvodnje |
| `opis` | `text` | da | Opcioni opis (slobodan tekst, više redova) |
| `karoserija` | `text` | da | Vidi §6.1 |
| `gorivo` | `text` | da | Vidi §6.2 |
| `kubikaza` | `integer` | da | Kubikaža (cm³) |
| `snaga_kw` | `integer` | da | Snaga u kW |
| `kilometraza` | `integer` | da | Kilometraža (km) |
| `emisiona_klasa` | `text` | da | Vidi §6.3 |
| `pogon` | `text` | da | Vidi §6.4 |
| `menjac` | `text` | da | Vidi §6.5 |
| `broj_vrata` | `text` | da | Vidi §6.6 |
| `broj_sedista` | `smallint` | da | 2–9 (vidi §6.7) |
| `strana_volana` | `text` | da | Vidi §6.8 |
| `klima` | `text` | da | Vidi §6.9 |
| `boja` | `text` | da | Boja (slobodan tekst) |
| `materijal_enterijera` | `text` | da | Vidi §6.10 |
| `boja_enterijera` | `text` | da | Vidi §6.11 |
| `registrovan` | `text` | da | Vidi §6.12 |
| `poreklo` | `text` | da | Vidi §6.13 |
| `zamena` | `text` | da | Vidi §6.14 |
| `stanje` | `text[]` default `'{}'` | ne | Više-izbor, §6.15 |
| `sigurnost` | `text[]` default `'{}'` | ne | Više-izbor, §6.16 |
| `oprema` | `text[]` default `'{}'` | ne | Više-izbor, §6.17 |

Indeksi:
- `idx_cars_created_at` na `created_at DESC` (listanje najnovijih).
- `idx_cars_is_featured` na `is_featured` (istaknuti na Početnoj).

> Napomena o izboru tipa: dropdown vrednosti čuvamo kao `text` (uz validaciju u aplikaciji) radi lakšeg dodavanja novih opcija; alternativa su Postgres `enum` tipovi ako se želi striktna kontrola na nivou baze.

---

## 3. Tabela `car_images`

Slike oglasa. Jedan oglas ima više slika (najviše 20).

| Kolona | Tip | Null | Opis |
|--------|-----|------|------|
| `id` | `uuid` PK, default `gen_random_uuid()` | ne | Identifikator |
| `car_id` | `uuid` FK → `cars.id` ON DELETE CASCADE | ne | Pripadnost oglasu |
| `url` | `text` | ne | Putanja/URL slike u Storage-u |
| `position` | `smallint` default `0` | ne | Redosled prikaza |
| `is_primary` | `boolean` default `false` | ne | Glavna (prva) slika |
| `created_at` | `timestamptz` default `now()` | ne | Vreme dodavanja |

Indeksi/pravila:
- `idx_car_images_car_id` na `car_id`.
- Brisanjem oglasa brišu se i slike (CASCADE); fajlovi u Storage-u se brišu kroz aplikacionu logiku.
- Aplikacija obezbeđuje da postoji tačno jedna `is_primary` po oglasu i da broj slika ≤ 20.

---

## 4. Tabela `service_status`

Vozila trenutno na servisu.

| Kolona | Tip | Null | Opis |
|--------|-----|------|------|
| `id` | `uuid` PK, default `gen_random_uuid()` | ne | Identifikator |
| `tablice` | `text` | ne | Broj tablica (slobodan unos) |
| `status` | `text` | ne | `na_cekanju` \| `servis_u_toku` \| `servis_zavrsen` |
| `created_at` | `timestamptz` default `now()` | ne | Vreme dodavanja (sortiranje redosledom dodavanja) |
| `updated_at` | `timestamptz` default `now()` | ne | Vreme poslednje izmene statusa |

Vrednosti za `status` (interno → prikaz):
- `na_cekanju` → "Na čekanju" (sivo)
- `servis_u_toku` → "Servis u toku" (žuto)
- `servis_zavrsen` → "Servis završen" (zeleno)

Indeks: `idx_service_status_created_at` na `created_at` (redosled prikaza).

---

## 5. Tabela `subscribers`

Pretplatnici na obaveštenja o novim oglasima.

| Kolona | Tip | Null | Opis |
|--------|-----|------|------|
| `id` | `uuid` PK, default `gen_random_uuid()` | ne | Identifikator |
| `email` | `text` UNIQUE | ne | E-mail adresa pretplatnika |
| `unsubscribe_token` | `uuid` default `gen_random_uuid()` | ne | Token za odjavu (link u mejlu) |
| `created_at` | `timestamptz` default `now()` | ne | Vreme prijave |

Indeks: jedinstveni indeks na `email` (sprečava duple prijave).

---

## 6. Dozvoljene vrednosti (liste)

Sve liste se centralizuju u `lib/car-options.ts`.

### 6.1 Karoserija
Limuzina, Hečbek, Karavan, Kupe, Kabriolet, MiniVan, Džip/SUV, PickUp

### 6.2 Vrsta goriva
Benzin, Dizel, Benzin + Gas, Benzin + Metan, Električni pogon, Hibridni pogon

### 6.3 Emisiona klasa
Euro 1, Euro 2, Euro 3, Euro 4, Euro 5, Euro 6

### 6.4 Vrsta pogona
Prednji, Zadnji, 4x4, 4x4 reduktor

### 6.5 Vrsta menjača
Manuelni 4 brzine, Manuelni 5 brzine, Manuelni 6 brzine, Automatski/Poluautomatski

### 6.6 Broj vrata
2/3, 4/5

### 6.7 Broj sedišta
2, 3, 4, 5, 6, 7, 8, 9

### 6.8 Strana volana
Levi volan, Desni volan

### 6.9 Vrsta klime
Nema klime, Manuelna klima, Automatska klima

### 6.10 Materijal enterijera
Štof, Prirodna koža, Kombinovana koža, Velur, Drugi

### 6.11 Boja enterijera
Crna, Bež, Smeđa, Siva, Druga

### 6.12 Registrovan
Da, Ne

### 6.13 Poreklo
Domaće tablice, Na ime kupca, Strane tablice

### 6.14 Zamena
Zamena za jeftinije, U istoj ceni, Zamena za skuplje, Svejedno

### 6.15 Stanje automobila (više-izbor)
Prvi vlasnik, Kupljen nov u Srbiji, Garancija, Garažiran, Servisna knjiga, Restauriran, Oldtimer, Prilagođeno invalidima, Taxi, Rezervni ključ, Tuning, Test vozilo, Vozilo auto škole

### 6.16 Sigurnost (više-izbor)
Airbag za vozača, Airbag za suvozača, Bočni airbag, Child lock, ABS, ESP, ASR, Alarm, Kodirani ključ, Blokada motora, Centralno zaključavanje, Mehanička zaštita, Ulazak bez ključa, Asistencija praćenja trake, Senzor mrtvog ugla, OBD zaštita, Vazdušni jastuci za kolena, Automatsko kočenje

### 6.17 Oprema (više-izbor)
Metalik boja, Branici u boji auta, Servo volan, Multifunkcionalni volan, Tempomat, Daljinsko zaključavanje, Putni računar, Šiber, Panorama krov, Tonirana stakla, Električni podizači, Električni retrovizori, Grejači retrovizora, Sedišta podesiva po visini, Elektro podesiva sedišta, Grejanje sedišta, Svetla za maglu, Xenon svetla, Senzori za svetla, Senzori za kišu, Parking senzori, Webasto, Krovni nosač, Kuka za vuču, Aluminijumske felne, Navigacija, Radio/Kasetofon, Radi CD, CD changer, DVD/TV, Bluetooth, LED prednja svetla, LED zadnja svetla, Grejači vetrobranskog stakla, Naslon za ruku, Adaptivni tempomat, Automatsko parkiranje, Kamera, Hands free, Adaptivna svetla, Head-up display, ISOFIX sistem, Prednja noćna kamera, Multimedija, Glasovne komande, Masažna sedišta, Elektro sklopivi retrovizori, Memorija sedišta, Sportska sedišta, Sportsko vešanje, DPF filter, Dnevna svetla, Torba za skije, Upravljanje na sva četiri točka, Brisači prednjih farova, 360 kamera, Fabrički ugrađeno dečije sedište, Ekran na dodir, Kožni volan, Volan u kombinaciji drvo-koža, Grejanje volana, Elektro zatvaranje prtljažnika, Zavesice na zadnjim prozorima, Privlačenje vrata pri zatvaranju, USB, Paljenje bez ključa, Hard disk, Ventilacija sedišta, Vazdušno vešanje, Ambijentalno osvetljenje, Subwoofer, MP3, Digitalni radio, Utičnica od 12V, Elektro otvaranje prtljažnika, Zaključavanje diferencijala, Otvor za skije, Podešavanje volana po visini, Držači za čaše, Ručice za menjanje brzina na volanu, Retrovizor se obara pri rikvercu, Automatsko zatamnjivanje retrovizora, Rezervni točak, Indikator niskog pritiska u gumama, Keramičke kočnice, Elektro ručna kočnica, Asistencija za kretanje na uzbrdici, AUX konekcija, Modovi vožnje, Postolje za bežično punjenje telefona, Apple CarPlay, Android Auto, Autonomna vožnja, Virtuelna tabla, Matrix farovi

---

## 7. Supabase Storage

| Bucket | Pristup | Sadržaj |
|--------|---------|---------|
| `car-images` | javno čitanje, upis samo za admina | Slike oglasa (do 20 po oglasu) |

- Putanja fajla: `car-images/{car_id}/{uuid}.{ext}`.
- Slike se kompresuju na klijentu pre uploada.
- Pri brisanju oglasa, aplikacija briše i pripadajuće fajlove iz bucket-a.

---

## 8. RLS (Row Level Security) politike

RLS je uključen na svim tabelama. Princip:

- **Javno čitanje** (`select`) za sve: `cars`, `car_images`, `service_status`.
- **Upis/izmena/brisanje** (`insert`/`update`/`delete`) samo za autentifikovanog korisnika (admin): `cars`, `car_images`, `service_status`.
- `subscribers`:
  - `insert` dozvoljen svima (prijava na newsletter).
  - `select`/`update`/`delete` samo za admina (odjava preko tokena ide kroz server uz service-role ključ, ne kroz javni RLS).

Primer (konceptualno):

```sql
-- cars: svako može da čita
create policy "cars_public_read" on public.cars
  for select using (true);

-- cars: samo prijavljeni admin može da menja
create policy "cars_admin_write" on public.cars
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- subscribers: svako može da se prijavi
create policy "subscribers_insert" on public.subscribers
  for insert with check (true);
```

> Pošto postoji samo jedan nalog (admin), `auth.role() = 'authenticated'` je dovoljno za razlikovanje admina od gostiju. Po želji se može pooštriti proverom konkretnog `auth.uid()`.

---

## 9. Relacije (ER pregled)

```
cars (1) ───< (N) car_images        [car_images.car_id → cars.id, ON DELETE CASCADE]

service_status   (samostalna tabela)
subscribers      (samostalna tabela)
auth.users       (Supabase Auth — admin nalog)
```
