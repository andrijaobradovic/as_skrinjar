# Tech.md — Arhitektura i tehnička implementacija

Tehnička dokumentacija sajta **AS Škrinjar**. Opisuje arhitekturu, korišćene servise i redosled implementacije.

---

## 1. Tehnološki stack


| Sloj                | Tehnologija                                               |
| ------------------- | --------------------------------------------------------- |
| Framework           | **Next.js 16** (App Router, React Server Components)      |
| UI biblioteka       | **React 19**                                              |
| Stilizacija         | **Tailwind CSS v4**                                       |
| UI komponente       | **shadcn/ui** (stil `radix-nova`, ikonice `lucide-react`) |
| Baza, Auth, fajlovi | **Supabase** (Postgres + Auth + Storage)                  |
| Slanje e-mailova    | **Resend**                                                |
| Mapa                | **Google Maps** (embed iframe)                            |
| Hosting             | **Vercel**                                                |
| Jezik               | TypeScript                                                |


---

## 2. Šta je VEĆ instalirano / podešeno

Provereno u repozitorijumu pre pisanja ovog dokumenta:

### Zavisnosti (`package.json`)

- `next@16.2.6`, `react@19.2.4`, `react-dom@19.2.4`
- `@supabase/ssr@^0.10.3`, `@supabase/supabase-js@^2.107.0`
- `tailwindcss@^4`, `@tailwindcss/postcss`
- `shadcn@^4.10.0`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`
- Ikonice: `lucide-react`, `@remixicon/react`

### Supabase (već povezan)

- `utils/supabase/server.ts` — `createClient` za Server Components / Server Actions.
- `utils/supabase/client.ts` — `createClient` za browser (klijentske komponente).
- `utils/supabase/middleware.ts` — osvežavanje sesije u middleware-u.
- Root `middleware.ts` — poziva Supabase middleware na svim rutama (osim statičkih fajlova).
- Env varijable u upotrebi: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Supabase projekat postoji i povezan je, ali **još nema tabela** (kreiramo ih u Fazi 2).

### shadcn/ui

- `components.json` podešen: stil `radix-nova`, `baseColor: neutral`, ikonice `lucide`, aliasi (`@/components`, `@/components/ui`, `@/lib`, `@/hooks`).
- Trenutno postoji samo `components/ui/button.tsx` — ostale komponente dodajemo po potrebi preko shadcn MCP-a.

### Postojeći skelet

- `app/layout.tsx` — root layout sa `Header` i `Footer` (fontovi Inter/Geist).
- `components/Header.tsx`, `components/Footer.tsx` — placeholder verzije (biće dorađene; navigacija će se uskladiti sa finalnim rutama).
- `app/page.tsx` — privremena demo strana (čita `todos`), biće zamenjena Početnom.

### Šta tek treba dodati (instalirati / konfigurisati)

- `resend` paket + env `RESEND_API_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` (server-only) za sigurne admin operacije gde je potrebno.
- shadcn komponente: `sonner` (toast), `carousel`, `dialog`/`alert-dialog`, `select`, `checkbox`, `input`, `textarea`, `label`, `card`, `form`, `badge`, `dropdown-menu`.
- Supabase Storage bucket za slike automobila.
- Analitika (Vercel Analytics ili Google Analytics) i osnovni SEO.

---

## 3. Arhitektura

```
Browser
  │
  ▼
Next.js (App Router @ Vercel)
  ├─ Server Components  → čitanje podataka iz Supabase (anon ključ + RLS)
  ├─ Server Actions     → upis/izmena/brisanje (admin), slanje mejlova (Resend)
  ├─ Route Handlers     → /api/unsubscribe, kontakt forma (po potrebi)
  └─ middleware.ts      → osvežavanje Supabase sesije
        │
        ▼
Supabase
  ├─ Auth     → jedan admin nalog (email + lozinka), signup isključen
  ├─ Postgres → tabele: cars, car_images, service_status, subscribers
  ├─ Storage  → bucket "car-images"
  └─ RLS      → javno čitanje, upis samo za autentifikovanog admina
        │
        ▼
Resend → newsletter mejlovi + kontakt forma
Google Maps → embed mape na stranici Kontakt
```

### Princip pristupa podacima

- **Čitanje** (oglasi, statusi) ide iz Server Components direktno iz Supabase-a; RLS dozvoljava javni `select`.
- **Pisanje** (dodavanje/izmena/brisanje) ide isključivo kroz **Server Actions** uz proveru admin sesije; RLS dozvoljava upis samo autentifikovanom korisniku.
- Admin dugmad se renderuju uslovno (na osnovu sesije), ali se sigurnost oslanja na server (RLS), ne na skrivanje u UI-ju.

---

## 4. Struktura ruta (App Router)

```
app/
├─ layout.tsx                  Root layout (Header, Footer, tema, Toaster)
├─ page.tsx                    Početna (hero, usluge, istaknuti auti, CTA, kontakt)
├─ chiptuning/page.tsx         Chiptuning info + "Kontaktiraj nas"
├─ automobili/
│  ├─ page.tsx                 Lista oglasa + newsletter sekcija + "Učitaj još"
│  ├─ [id]/page.tsx            Detalj oglasa (carousel, sve info, opis, kopiraj link)
│  ├─ novi/page.tsx            [admin] forma za dodavanje oglasa
│  └─ [id]/izmeni/page.tsx     [admin] izmena oglasa
├─ status/page.tsx            Javna lista vozila na servisu + admin interfejs
├─ kontakt/page.tsx           Telefon, mejl, forma, Google Maps
├─ admin/page.tsx             Skriveni login
└─ api/
   └─ unsubscribe/route.ts    Odjava sa newslettera

components/
├─ Header.tsx, Footer.tsx
└─ ui/...                      shadcn komponente

lib/
├─ utils.ts
└─ car-options.ts             Centralne liste (dropdown/checkbox vrednosti)

utils/supabase/
├─ server.ts, client.ts, middleware.ts
```

> Napomena: trenutni `Header.tsx` ima privremene linkove (`/oglasi`, `/servis`) koji će biti usklađeni sa rutama iznad (`/automobili`, `/status`).

---

## 5. Servisi — kako se koriste

### 5.1 Supabase Auth (admin login)

- Jedan admin nalog kreira se **ručno** u Supabase dashboardu; javni signup je isključen.
- Login forma na `/admin` koristi `supabase.auth.signInWithPassword`.
- Sesija se čuva u kolačićima i osvežava kroz `middleware.ts` (već postoji).
- Odjava: dugme u navigaciji, vidljivo samo kad je admin prijavljen.
- Duga sesija ("zapamti me") — oslanjamo se na Supabase auto-refresh.

### 5.2 Supabase Postgres (baza)

- Tabele i RLS politike definisane u `DB.md`.
- Čitanje kroz `createClient` (server) u Server Components; upis kroz Server Actions.

### 5.3 Supabase Storage (slike)

- Bucket `car-images` (javno čitljiv, upis samo za admina).
- Slike se otpremaju iz forme; URL-ovi i redosled čuvaju se u tabeli `car_images`.
- Najviše 20 slika po oglasu; prva je glavna, uz mogućnost promene redosleda. Auto-kompresija na klijentu pre uploada.

### 5.4 Resend (e-mail)

- **Newsletter:** kada admin objavi nov oglas, Server Action poziva Resend i šalje obaveštenje svim redovima iz `subscribers`. Svaki mejl sadrži link za odjavu (`/api/unsubscribe?token=...`).
- **Kontakt forma:** slanje poruke na e-mail firme; zaštita honeypot poljem + rate-limit.
- Zahteva `RESEND_API_KEY` i verifikovan domen pošiljaoca.

### 5.5 Google Maps

- Embed (`<iframe>`) mape sa lokacijom servisa na stranici Kontakt.

---

## 6. Redosled implementacije (faze)

### Faza 1 — Temelj

- Globalna tema (light/dark toggle), tipografija, paleta iz shadcn-a.
- Doraditi `Header` (finalna navigacija) i `Footer`.
- Generisati placeholder logo (kasnije se menja).
- Dodati osnovne shadcn komponente (`sonner`, `card`, `button`, `dialog`, `input`...).
- Postaviti `Toaster` u root layout.

### Faza 2 — Baza + Auth

- Kreirati tabele i RLS politike u Supabase-u (`cars`, `car_images`, `service_status`, `subscribers`).
- Napraviti Storage bucket `car-images`.
- Implementirati `/admin` login + odjavu; ručno kreirati admin nalog; isključiti signup.
- Helper za proveru admin sesije na serveru.

### Faza 3 — Automobili (jezgro)

- `lib/car-options.ts` sa svim listama.
- Forma za dodavanje/izmenu oglasa (sva polja, upload i redosled slika).
- Lista oglasa (3 u redu, najnoviji prvi, "Učitaj još").
- Detaljna stranica (Embla carousel, sve informacije, opcioni opis, "Kopiraj link").
- Brisanje oglasa uz dijalog potvrde + toast poruke.

### Faza 4 — Newsletter + Resend

- Prijava na obaveštenja (unos e-maila na stranici Automobili).
- Automatsko slanje na objavu novog oglasa.
- `/api/unsubscribe` za odjavu.

### Faza 5 — Status servisa

- Javna lista (pravougaonici, boje statusa).
- Admin interfejs: dodavanje (tablice + status), promena statusa kroz dropdown, brisanje uz potvrdu.

### Faza 6 — Početna + Chiptuning + Kontakt

- Početna: hero, usluge, 3 istaknuta automobila, CTA, kontakt sekcija.
- Chiptuning: informativni tekst + dugme "Kontaktiraj nas".
- Kontakt: telefon, mejl, forma (Resend), Google Maps embed.

### Faza 7 — Polish & deploy

- SEO (meta tagovi, `sitemap`, OG slike), favicon.
- Analitika (Vercel/GA), cookie baner + Politika privatnosti.
- Provera responzivnosti, deploy na Vercel.

---

## 7. Environment varijable


| Varijabla                              | Namena                      | Status     |
| -------------------------------------- | --------------------------- | ---------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL Supabase projekta       | u upotrebi |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Javni (anon) ključ          | u upotrebi |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only admin operacije | dodati     |
| `RESEND_API_KEY`                       | Slanje e-mailova            | dodati     |


> `SUPABASE_SERVICE_ROLE_KEY` se koristi isključivo na serveru i nikada se ne izlaže klijentu.

---

## 8. Bezbednosne napomene

- Vidljivost admin UI-ja nije bezbednosna mera — prava zaštita je u **RLS politikama** i proveri sesije u Server Actions.
- Javni (anon) ključ sme samo da čita javne podatke; sve izmene zahtevaju validnu admin sesiju.
- Signup je isključen, postoji samo jedan nalog.
- Kontakt forma i newsletter imaju anti-spam zaštitu (honeypot + rate-limit).

