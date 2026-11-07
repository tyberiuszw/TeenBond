# Project: TeenBond

Aplikacja webowa dla organizacji "Liderzy Jutra" wspierająca budowanie relacji, zaufania i komunikacji w zespołach młodzieżowych z wykorzystaniem gier decyzyjnych, kart motywatorów CHAMPFROGS, interaktywnej tablicy TeenBoard, algorytmicznego Drzewka Relacji oraz automatycznego wdrożenia na GitHub, Supabase i Railway.

## Architecture

### Stack Technologiczny
- **Frontend & Fullstack**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Canvas/SVG.
- **State Management**: Zustand (dla stanu lokalnego, tablicy TeenBoard i trybu Demo).
- **Backend / Baza Danych**: Supabase PostgreSQL (11 tabel zoptymalizowanych pod Supabase Best Practices, UUID v4, indeksy FK).
- **Bezpieczeństwo**: Row Level Security (RLS) z `(SELECT auth.uid())`, hermetyzacja danych diagnostycznych Drzewka Relacji wyłącznie dla Lidera.
- **Komunikacja w Czasie Rzeczywistym**: Supabase Realtime Channels (Broadcast dla kursorów i obiektów tablicy, Presence dla listy obecności).
- **Wdrożenie & CI/CD**: Docker (multi-stage standalone Next.js), Railway (`railway.json` / Nixpacks / Dockerfile), GitHub Actions / Repo Sync.

### Moduły Systemu
1. **Core & Demo Module**: Uwierzytelnianie, organizacje publiczne i prywatne, profile z kameleonami (8 kolorów), globalna nawigacja oraz niezależny Standalone Demo Store (działa bez połączenia z bazą danych).
2. **Motivators & Decisions Module (Etapy 1 & 2)**: Karty CHAMPFROGS (10 par awers/rewers z katalogu Downloads, 3D flip card, D&D ranking 1-10, podgląd macierzy dla Lidera); Scenariusze decyzyjne Lost at Sea i NASA Moon Survival (Faza 1 solo z timerem, Faza 2 consensus zespołu, oficjalne klucze ekspertów, obliczanie błędu, efektu synergii i detekcja Cichego Eksperta).
3. **Evaluation & Relationship Tree Module (Etap 3)**: Ankiety poetapowe (wzajemna ocena rówieśnicza 4 pytania, ocena lidera 1-5, ocena zespołu przez lidera 1-5), deterministyczny graf Drzewka Relacji z addytywną wagą krawędzi $W(A,B)$, 4 klasy stylów/grubości krawędzi oraz twardy regułowy silnik if/else generujący tooltipy diagnostyczne bez AI.
4. **TeenBoard & Scenario Games Module (Etapy 4, 5 & 6)**: Wielostronicowa tablica collaborative z optymistyczną blokadą obiektów, live kursorami, narzędziami graficznymi, notatkami z autoskalowaniem tekstu, wskaźnikiem laserowym z zanikaniem 1.5s, personalnym undo/redo oraz pływającym prywatnym kalkulatorem. Gry: The Zin Obelisk (33 poszlaki, timer 25 min, dowód Neptiminus), Murder Mystery (szablony korkowe), Dracula (2 podgrupy, 2 tablice, pokój negocjacji 1-na-1), Kalambury (charades na żywo z czatem i punktacją).
5. **Infrastructure & Deployment Module**: Migracje SQL, polityki RLS, konteneryzacja Docker, konfiguracja Railway, synchronizacja GitHub i dokumentacja README.md.
6. **E2E Testing & Hardening Track**: 4-poziomowy pakiet testów wymagań (Tiers 1-4) oraz Tier 5 adversarial security and stress hardening.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Identyfikacja wizualna Liderzy Jutra | SVG logo, branding kameleon, paleta 8 barw kameleonów | M1 | PRD / R1 |
| F02 | System ról i uprawnień | Lider (Założyciel) i Członek zespołu; równy udział w grach; Lider posiada wyłączność do panelu zarządczego i Drzewka Relacji | M1 | PRD / R1 |
| F03 | Autentykacja i zarządzanie kontem | Supabase Auth (email/hasło), rejestracja, logowanie, obsługa sesji | M1 | PRD / R1 |
| F04 | Zarządzanie organizacjami | Tworzenie organizacji, org publiczne z ręczną akceptacją Lidera, org prywatne z unikalnym kodem/linkiem zaproszenia | M1 | PRD / R1 |
| F05 | Profil użytkownika i personalizacja | Wybór koloru kameleona/awatara identyfikującego gracza w grach i tablicy | M1 | PRD / R1 |
| F06 | Globalna nawigacja | Ścieżka Budowania Relacji, Zespół (profile, motywatory, punkty), Relacje Międzyzespołowe | M1 | PRD / R1 |
| F07 | Pełny Tryb Demo | W pełni funkcjonalny mock store w pamięci, dostępny z ekranu startowego bez logowania, prezentujący kompletne dane organizacji Alfa, 5 graczy, motywatorów, TeenBoard i Drzewka | M1 | PRD / R1 |
| F08 | Ankiety ewaluacyjne poetapowe | Formularze jednokrotnego wyboru po etapach 2, 4 i 5: współpraca (+3), aktywne słuchanie (+2), organizacja (+2), chaos (-1); ocena lidera 1-5, ocena zespołu przez lidera 1-5 | M3 | PRD / R4 |
| F09 | Algorytm wag Drzewka Relacji | Addytywna formuła wag $W(A,B) = \sum (p_{A \to B} + p_{B \to A})$, 4 klasy grubości i stylów krawędzi grafu | M3 | PRD / R4 |
| F10 | Silnik reguł diagnostycznych Drzewka | Deterministyczne reguły if/else bez użycia AI generujące 2-3 zdaniowe podsumowania i tooltipy (spoiwo, cichy ekspert, tarcia, koordynator) | M3 | PRD / R4 |
| F11 | Widok grafu Drzewka Relacji | Interaktywny graf SVG/Canvas dostępny wyłącznie dla Lidera | M3 | PRD / R4 |
| F12 | Assety kart CHAMPFROGS | 10 par awers/rewers z `C:\Users\TUF\Downloads` (w tym obsługa literówki `Curiotisy Front.jpg`) | M2 | R2 / Downloads |
| F13 | Interaktywny moduł kart CHAMPFROGS | Widok 3D flip-card z definicją na rewersie, Drag & Drop ranking 1-10 od najbardziej do najmniej motywującego czynnika | M2 | PRD / R2 |
| F14 | Konsensus zespołu w Etapie 1 | Indywidualne zatwierdzenie przez 100% zespołu, odblokowanie widoku macierzy motywatorów dla Lidera w panelu Zespołu | M2 | PRD / R2 |
| F15 | Silnik Scenariuszy Decyzyjnych | Obsługa gier Lost at Sea (15 przedmiotów) oraz NASA Moon Survival (15 przedmiotów) | M2 | PRD / R3 |
| F16 | Faza 1 gier decyzyjnych | Faza indywidualna z timerem, szeregowanie przedmiotów (D&D lub wpisanie cyfry) i zatwierdzenie | M2 | PRD / R3 |
| F17 | Faza 2 gier decyzyjnych | Wspólna edycja w czasie rzeczywistym z podglądem własnych typów, sygnalizacją rozbieżności i wymogiem 100% zgody | M2 | PRD / R3 |
| F18 | Punktacja decyzyjna i ewaluacja | Automatyczne porównanie z oficjalnym kluczem US Coast Guard / NASA, suma różnic bezwzględnych, przedziały ocen | M2 | PRD / R3 |
| F19 | Efekt synergii i Cichy Ekspert | Wyliczanie synergii $\Delta = \overline{\text{Indiv}} - \text{Team} > 0$ oraz identyfikacja Cichego Eksperta ($\text{Team} - \text{BestIndiv} \ge 5$) | M2 | PRD / R3 |
| F20 | The Zin Obelisk - podział 33 poszlak | Podział 33 kart poszlak między uczestników, każdy widzi tylko swoje w panelu bocznym | M4 | ZinObelisk.pdf / R5 |
| F21 | The Zin Obelisk - rozgrywka i weryfikacja | Timer 25 min, wspólna przestrzeń TeenBoard, automatyczna walidacja odpowiedzi (Neptiminus) i wyjaśnienie krok po kroku | M4 | ZinObelisk.pdf / R5 |
| F22 | Murder Mystery - The Movie | 10 postaci, 18 poszlak, dedykowany szablon tablicy korkowej, rozwiązanie: Współgwiazda + trucizna | M4 | movie_murder.pdf / R5 |
| F23 | Murder Mystery - TechStream | 6 postaci, 21 poszlak, schemat rezydencji, rozwiązanie: Bob Hartley + miecz | M4 | murder_katrine.pdf / R5 |
| F24 | Scenariusz Dracula | Podział na 2 podgrupy (Nietoperze vs Koty), 2 osobne tablice TeenBoard, pokój negocjacji 1-na-1, warianty: Niedziela 9:00 vs Sobota 9:00 (synergia) | M4 | Dracula.pdf / R5 |
| F25 | Kalambury integracyjne | Skribbl-style, losowanie haseł integracyjnych, czat z tolerancją literówek (fuzzy matching), dynamiczna punktacja live | M4 | PRD / R5 |
| F26 | Tryb swobodny (Etap 6) | Dostęp do kalamburów oraz replay niewykorzystanych scenariuszy decyzyjnych i śledczych | M4 | PRD / R5 |
| F27 | TeenBoard - hybrydowy silnik tablicy | Przestrzeń nieskończona, obsługa wielu stron, pan/zoom, renderowanie Canvas/SVG | M4 | PRD / R5 |
| F28 | TeenBoard - narzędzia graficzne | Rysowanie odręczne (brush/pencil), linie, kształty (prostokąt, okrąg), bezramkowy tekst, gumka usuwająca wyłącznie linie | M4 | PRD / R5 |
| F29 | TeenBoard - notatki samoprzylepne | Kolorowe karteczki (sticky notes) z dynamicznym autoskalowaniem fontu dopasowującym tekst do wymiarów karteczki | M4 | PRD / R5 |
| F30 | TeenBoard - wskaźnik laserowy | Laser pointer z automatycznie zanikającym śladem (1.5s) | M4 | PRD / R5 |
| F31 | TeenBoard - synchronizacja Realtime | Live kursory z etykietami i kolorami graczy, optymistyczna blokada edytowanych obiektów | M4 | PRD / R5 |
| F32 | TeenBoard - personalne undo/redo | Stos historii akcji per-użytkownik (cofanie własnych operacji bez cofania zmian innych) | M4 | PRD / R5 |
| F33 | TeenBoard - pływający prywatny kalkulator | Draggable kalkulator widoczny wyłącznie dla gracza, który go otworzył | M4 | PRD / R5 |
| F34 | Baza danych PostgreSQL w Supabase | 11 tabel (organizations, profiles, team_members, stages, motivator_rankings, decision_submissions, evaluations, relationship_edges, teenboard_rooms, teenboard_elements, game_sessions) z UUID v4 i FK | M5 | R6 / explorer_survey_3 |
| F35 | Polityki bezpieczeństwa RLS | Kompleksowe reguły Row Level Security dla 11 tabel, izolacja organizacji i ochrona danych Lidera | M5 | R6 / explorer_survey_3 |
| F36 | Kanały Supabase Realtime | Konfiguracja kanałów Broadcast i Presence dla interakcji na żywo | M5 | R6 / explorer_survey_3 |
| F37 | Konteneryzacja i Railway Deploy | Dockerfile (multi-stage build), `railway.json`, konfiguracja zmiennych środowiskowych i deploy | M5 | R6 / explorer_survey_3 |
| F38 | Synchronizacja GitHub | Inicjalizacja repozytorium git, git commit, push do GitHub | M5 | R6 / explorer_survey_3 |
| F39 | Dokumentacja README.md | Architektura, konfiguracja zmiennych, instrukcja uruchomienia lokalnego i chmurowego | M5 | R6 / explorer_survey_3 |
| F40 | Pakiet automatycznych testów E2E & Hardening | Pełny zestaw testów Tiers 1-4 (weryfikacja wymagań) oraz Tier 5 adversarial coverage hardening | M6 | Acceptance Criteria / E2E Track |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Platform Core, Onboarding & Demo Store | F01, F02, F03, F04, F05, F06, F07 | none | DONE |
| M2 | Motivators & Decision Games Engine | F12, F13, F14, F15, F16, F17, F18, F19 | M1 (contracts defined) | DONE |
| M3 | Evaluation System & Relationship Tree | F08, F09, F10, F11 | M1, M2 (contracts defined) | DONE |
| M4 | Collaborative TeenBoard & Scenario Games | F20, F21, F22, F23, F24, F25, F26, F27, F28, F29, F30, F31, F32, F33 | M1 (contracts defined) | DONE |
| M5 | Cloud Infrastructure, Supabase DB & Railway Deployment | F34, F35, F36, F37, F38, F39 | M1, M2, M3, M4 | DONE |
| M6 | Final E2E Test Suite Pass (100%) & Hardening | F40 | M1, M2, M3, M4, M5, TEST_READY.md | DONE |

---

## Interface Contracts

### M1 (Core/Auth/Org/Demo) ↔ M2 (Motivators/Decisions)
- **Data Types**:
  - `UserSession`: `{ id: string, email: string, name: string, chameleonColor: string, role: 'leader' | 'member', orgId: string }`
  - `OrganizationContext`: `{ orgId: string, name: string, isDemo: boolean, members: UserSession[] }`
- **Game Session Hook / Service**:
  - `getStageStatus(orgId: string, stageId: number): Promise<StageStatus>`
  - `submitMotivatorRanking(userId: string, ranking: string[]): Promise<{ allCompleted: boolean }>`
  - `submitDecisionSolo(userId: string, gameType: 'lost_at_sea' | 'moon', items: string[]): Promise<void>`
  - `submitDecisionTeam(orgId: string, gameType: 'lost_at_sea' | 'moon', items: string[]): Promise<DecisionResult>`

### M2 (Decisions) ↔ M3 (Evaluation & Relationship Tree)
- **Evaluation Trigger**:
  - Ukończenie Etapu 2 (Decyzje), Etapu 4 (Zin) lub Etapu 5 (Śledztwo) wywołuje zdarzenie `STAGE_COMPLETED(stageId, participants)`.
- **Relationship Input Contract**:
  - `submitPeerEvaluation(evaluatorId: string, targetId: string, criteria: { cooperation: boolean, activeListening: boolean, goalOriented: boolean, chaos: boolean }): Promise<void>`
  - `submitLeaderEvaluation(leaderId: string, targetId: string, criteria: { engagement: number, openness: number }): Promise<void>`
  - `submitLeaderRating(memberId: string, criteria: { speechSpace: number, atmosphere: number }): Promise<void>`
- **Graph State Output**:
  - `getRelationshipGraph(orgId: string): Promise<{ nodes: MemberNode[], edges: RelationshipEdge[], diagnosticInsights: InsightItem[] }>`
  - Zabezpieczenie: dostęp do `getRelationshipGraph` rzuca błąd 403 / RLS jeśli `auth.uid()` nie jest liderem organizacji (w Trybie Demo mock zwraca dane Alfa bez blokady).

### M1 & M2 & M3 ↔ M4 (TeenBoard)
- **Board Room Contract**:
  - `joinBoardRoom(roomId: string, user: UserSession): { cursorsChannel: RealtimeChannel, elementsChannel: RealtimeChannel }`
  - `CursorState`: `{ userId: string, name: string, color: string, x: number, y: number, laserTrail?: { x: number, y: number, timestamp: number }[] }`
  - `BoardElement`: `{ id: string, type: 'path' | 'line' | 'rect' | 'circle' | 'text' | 'sticky', x: number, y: number, width?: number, height?: number, content?: string, color: string, strokeWidth?: number, points?: number[], lockedBy?: string | null, createdBy: string }`
  - `UndoAction`: `{ userId: string, actionType: 'create' | 'update' | 'delete', elementBefore?: BoardElement, elementAfter?: BoardElement }` (per-user stack).
- **Game Scenarios Clue Distribution**:
  - `allocateClues(gameType: 'zin' | 'murder' | 'dracula', members: UserSession[]): Map<string, ClueCard[]>`

### Application ↔ M5 (Database & Deployment)
- **Environment Configuration**:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `NODE_ENV=production`, `PORT=3000`
- **Database Schema**: 11 tabel utworzonych przez plik migracji `supabase/migrations/20261107000000_init_schema.sql` z włączonym RLS i indeksami.
