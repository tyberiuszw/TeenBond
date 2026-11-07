# 🦎 TeenBond — Platforma Budowania Relacji i Zaufania („Liderzy Jutra”)

**TeenBond** to produkcyjna aplikacja webowa stworzona dla organizacji **Liderzy Jutra**, wspierająca budowanie relacji, komunikacji i zaufania w zespołach młodzieżowych pracujących zdalnie oraz hybrydowo.

Platforma łączy interaktywne gry decyzyjne, karty motywatorów **CHAMPFROGS**, wielostronicową tablicę współpracy **TeenBoard** czasu rzeczywistego oraz deterministyczny, matematyczny graf **Drzewka Relacji** (bez użycia AI) widoczny wyłącznie dla Lidera.

---

## ✨ Główne Funkcjonalności i Ścieżka 6 Etapów

### 1. Architektura Ról i Autonomiczny Tryb Demo (R1)
- **Lider (Założyciel) oraz Członek Zespołu**: Obie role biorą równy udział we wszystkich grach (Lider układa karty, głosuje i rysuje na tablicy na równi z zespołem), przy czym Lider posiada wyłączny dostęp do **Drzewka Relacji** oraz pełnej macierzy motywatorów.
- **Personalizacja Kameleona**: 8 barw kameleonów identyfikujących gracza na tablicy, w kursorach czasu rzeczywistego i na grafie relacji.
- **Pełny Tryb Demo (bez logowania)**: Dostępny jednym kliknięciem z ekranu głównego – zawiera kompletne dane 5-osobowego *Zespołu Alfa* (Anna – Lider, Bartek, Celina, Dawid, Ewa) oraz przełącznik perspektywy pozwalający przetestować widok każdego uczestnika i blokadę bezpieczeństwa dla zwykłych członków.

### 2. Etap 1 — Karty Motywatorów CHAMPFROGS (R2)
- 10 par oryginalnych kart awers/rewers (*Curiosity, Honor, Acceptance, Mastery, Power, Freedom, Relatedness, Order, Goal, Status*).
- Efekt obrotu **3D Flip Card** z definicjami po polsku i angielsku.
- Szeregowanie **Drag & Drop** (1 – najbardziej motywuje, 10 – najmniej motywuje) oraz macierz cieplna (Heatmap) w zakładce **Zespół**.

### 3. Etap 2 — Scenariusze Decyzyjne: *Lost at Sea* & *NASA Moon Survival* (R3)
- **Faza 1 (Indywidualna z minutnikiem)**: Samodzielne uszeregowanie 15 przedmiotów.
- **Faza 2 (Zespołowa w czasie rzeczywistym)**: Wspólna lista z podglądem własnych typów z Fazy 1, automatycznym podświetlaniem dużych rozbieżności ($\Delta > 5$) i wymogiem **100% zgody zespołu**.
- **Oficjalne klucze ekspertów US Coast Guard oraz NASA**: Wyliczanie sumy różnic bezwzględnych, **Efektu Synergii** ($\Delta = \overline{\text{Indiv}} - \text{Team}$) oraz automatyczne wykrywanie **Cichego Eksperta**.

### 4. Etap 3 — System Ewaluacji i Algorytmiczne Drzewko Relacji (R4)
- Krótkie, zamknięte ankiety poetapowe (4 pytania jednokrotnego wyboru: współpraca `+3`, aktywne słuchanie `+2`, organizacja celu `+2`, chaos `-1`; skale 1–5 oceny Lidera i członków).
- **Deterministyczny graf SVG (No-AI)**:
  - Addytywna waga krawędzi: $W(A,B) = \sum (p_{A \to B} + p_{B \to A})$.
  - 4 klasy wizualne krawędzi: brak/przerywana linia tarć ($W \le 0$), cienka linia ($1\text{–}3$), średnia linia ($4\text{–}7$), gruba podświetlona linia synergii ($W \ge 8$).
  - Silnik reguł warunkowych (`if/else`) generujący tooltipy diagnostyczne (*Spoiwo Zespołu*, *Cichy Ekspert*, *Tarcia Komunikacyjne*, *Naturalny Koordynator*).
  - **Hermetyzacja dostępu**: Chronione na poziomie komponentu, klienta danych (`403 Forbidden`) oraz polityk PostgreSQL RLS wyłącznie dla Lidera.

### 5. Tablica Interaktywna TeenBoard oraz Etapy 4, 5 i 6 (R5)
- **TeenBoard**:
  - Wielostronicowa przestrzeń robocza (dodawanie, duplikowanie i przełączanie stron; tła: kropki, kratka, linie, czyste, tablica korkowa).
  - Narzędzia: Pędzel/pióro, zakreślacz, linia prosta (z przyciąganiem $45^\circ$), kształty (prostokąt, okrąg), tekst bezramkowy, karteczki samoprzylepne z **dynamicznym autoskalowaniem czcionki** $\text{clamp}(12, 32, \lfloor\sqrt{(w \cdot h)/(N \cdot 1.8)}\rfloor)$.
  - **Gumka selektywna**: Usuwa wyłącznie narysowane linie (nie niszczy karteczek ani kształtów); przytrzymanie przez $>0.5\text{s}$ otwiera potwierdzenie wyczyszczenia linii.
  - **Wskaźnik laserowy**: Płynny ślad 60 FPS wygaszający się dokładnie po $1.5\text{s}$.
  - **Optymistyczna blokada obiektów** (4s auto-release timeout), **Personalne Undo/Redo** (cofa wyłącznie własne akcje gracza) oraz **Prywatny Pływający Kalkulator** (widoczny wyłącznie dla właściciela).
- **Etap 4 — *The Zin Obelisk***:
  - Równomierny podział 33 kart poszlak między graczy (zablokowane kopiowanie tekstu), 25-minutowy timer przełączający tablicę w tryb *read-only*, weryfikacja odpowiedzi (**Neptiminus** / **Neptominus**) oraz 5-etapowy dowód matematyczny ($50\,000 / 8\,400 = 5.952 \implies \text{6. dzień roboczy}$).
- **Etap 5 — Gry Dedukcyjne i Negocjacyjne**:
  - *Tajemnica na Planie Filmowym* (10 postaci, 18 poszlak, tablica korkowa z czerwoną włóczką, rozwiązanie: *The Co-Star + Trucizna*).
  - *Zabójstwo w Rezydencji TechStream* (6 postaci, 21 poszlak, rozwiązanie: *Bob Hartley + Miecz*).
  - *Przebudzenie Drakuli* (podział na 2 podgrupy: *Czerwone Nietoperze* i *Czarne Koty*, 2 osobne tablice, prywatna **Strefa Negocjacji 1-na-1** dla wyznaczonych negocjatorów; wariant rywalizacji *Niedziela 9:00* = 100 pkt vs wariant synergii *Sobota 9:00* = 200 pkt + odznaka *Mistrzowie Synergii*).
- **Etap 6 — Tryb Swobodny i Kalambury**:
  - **Kalambury Integracyjne** (60 polskich haseł w 3 poziomach trudności, czat z tolerancją literówek Levenshteina, dynamiczna punktacja).
  - **Katalog Powtórek Scenariuszy** (uruchamianie niewykorzystanych gier z Etapu 2, 4 i 5) oraz swobodna tablica TeenBoard.

---

## 🛠️ Stack Technologiczny

- **Frontend / Fullstack**: Next.js 14 (App Router, `output: 'standalone'`), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Zarządzanie Stanem**: Zustand (`demo-store`, `teenboard-store`, `session-store`)
- **Backend / Baza Danych / Realtime**: Supabase (PostgreSQL 15, Supabase Auth, Supabase Realtime Broadcast & Presence, Row Level Security)
- **Testy Automatyczne**: Vitest + React Testing Library (ponad 190 testów w 5 warstwach weryfikacji)
- **Infrastruktura i Deployment**: Docker (multi-stage Alpine build), Railway (`railway.json`), GitHub Actions CI

---

## 🚀 Uruchomienie Lokalne

1. **Instalacja zależności**:
   ```bash
   npm install
   ```

2. **Konfiguracja zmiennych środowiskowych**:
   Skopiuj plik `.env.example` do `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Uwaga: Jeśli zmienne Supabase pozostaną puste, aplikacja automatycznie uruchomi w pełni funkcjonalny **Tryb Demo** w pamięci podręcznej).*

3. **Uruchomienie serwera deweloperskiego**:
   ```bash
   npm run dev
   ```
   Aplikacja będzie dostępna pod adresem `http://localhost:3000`.

4. **Uruchomienie testów i weryfikacji builda**:
   ```bash
   npx tsc --noEmit
   npm test
   npm run build
   ```

---

## ☁️ Wdrożenie Chmurowe (GitHub + Supabase + Railway)

### 1. Baza Danych Supabase
Pełna migracja SQL tworząca 11 tabel (`profiles`, `organizations`, `team_members`, `stages`, `game_sessions`, `motivator_rankings`, `decision_submissions`, `evaluations`, `relationship_edges`, `teenboard_rooms`, `teenboard_elements`), indeksy wydajnościowe, funkcje pomocnicze oraz polityki Row Level Security (RLS) znajduje się w pliku:
- [`supabase/migrations/20261107000000_init_schema.sql`](supabase/migrations/20261107000000_init_schema.sql)

Aby wdrożyć schemat na zdalny projekt Supabase:
```bash
npx supabase login
npx supabase link --project-ref <TWOJ_PROJECT_REF>
npx supabase db push
```

### 2. Wdrożenie na Railway
Projekt zawiera gotową konfigurację [`Dockerfile`](Dockerfile) (tryb standalone Next.js) oraz [`railway.json`](railway.json) z automatycznym healthcheckiem pod `/api/health`.

1. Połącz repozytorium GitHub z nowym projektem w panelu **Railway** (lub użyj CLI: `npx @railway/cli up`).
2. Ustaw zmienne środowiskowe w Railway:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT=3000`
3. Railway automatycznie zbuduje kontener z `Dockerfile` i udostępni aplikację online.
