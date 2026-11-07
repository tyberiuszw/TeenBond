# Dokumentacja Infrastruktury Testowej: TeenBond (TEST_INFRA.md)

**Projekt:** TeenBond („Liderzy Jutra”)  
**Ścieżka:** E2E Testing & Hardening Track  
**Autor:** Dedicated Test Writer (`teamwork_test_writer` / `e2e_test_writer_1`)  
**Data:** 2026-11-07  
**Wersja:** 1.0.0-PROD  

---

## 1. Filozofia i Standardy Testowania

Infrastruktura testowa TeenBond została zaprojektowana zgodnie z rygorystycznym paradygmatem **Opaque-Box Requirement-Driven Testing**. 

Główne zasady architektoniczne:
1. **Brak zależności od wewnętrznych implementacji (Implementation Independence):** Testy weryfikują kontrakty interfejsowe, właściwości matematyczne, zachowania systemowe i przepływy użytkownika wyłącznie przez publiczne API, kontrakty danych i makiety zachowań. Zmiana biblioteki UI (np. zmiana stylizowania, modyfikacja struktury DOM komponentu) nie unieważnia ani nie psuje testów biznesowych.
2. **Autoratywne Źródło Prawdy (Authoritative Source of Truth):** Każda wartość oczekiwana (`expected value`) wynika wprost z oficjalnych dokumentów specyfikacji:
   - Klucz US Coast Guard dla *Lost at Sea* (`lost-at-sea-instructions-8-19-2015.pdf`).
   - Klucz NASA dla *NASA Moon Survival* (`nasa-moon-survival.pdf`).
   - Dowód matematyczny 6 dni roboczych Atlantydy i dnia ukończenia *Neptiminus* dla *The Zin Obelisk* (`ZinObelisk.pdf`).
   - 10 kart CHAMPFROGS z katalogu `C:\Users\TUF\Downloads` (w tym obsługa literówki `Curiotisy Front.jpg`).
   - Addytywna formuła wag Drzewka Relacji $W(A,B) = \sum (p_{A \to B} + p_{B \to A})$ z progami stylów ($\le 0$ przerywana, $1-3$ 1px, $4-7$ 3px, $\ge 8$ 6px z poświatą).
   - Scenariusze dedukcyjne: *The Movie Murder Mystery Party* (Współgwiazda + trucizna), *Murder Mystery TechStream* (Bob Hartley + zabytkowy miecz przez ukryte drzwi), *Dracula Has Risen from the Grave* (Niedziela 9:00 - 100 pkt vs Sobota 9:00 - 200 pkt i Synergia).
3. **Determinizm i Izolacja Testów (Hermetic & Isolated):** Każdy przypadek testowy tworzy i czyści swój własny stan, nie zależy od kolejności uruchamiania i wykonuje się w powtarzalnych warunkach (niezależnie od zewnętrznych usług sieciowych i bazy danych).
4. **Odporność na Błędy i Bezpieczeństwo (Adversarial Hardening):** Testy badają skrajne wartości brzegowe (maksymalny błąd binarnego odwrócenia 112 pkt, brak odpowiedzi, puste notatki, znaki kontrolne, próby głosowania na samego siebie, uprawnienia RLS do Drzewka Relacji wyłącznie dla Lidera).

---

## 2. Metodologia Projektowania Przypadków Testowych

Pakiet testowy opiera się na 4 formalnych metodologiach inżynierii jakości:

### 2.1. Category-Partition Method (Podział na Kategorie i Klasy Abstrakcji)
Dla każdej funkcjonalności zdefiniowano parametry wejściowe, środowiskowe oraz odpowiadające im klasy równoważności:
- **Autentykacja i Role:** Anonimowy (brak sesji), Użytkownik w Trybie Demo, Uczestnik (Członek), Lider (Założyciel).
- **Format Organizacji:** Publiczna (wymaga ręcznej akceptacji wniosku `pending -> approved`), Prywatna (wymaga poprawnego tokenu/kodu zaproszenia `TB-XXXX`).
- **Scenariusze Decyzyjne:** 
  - Faza 1: Rozwiązanie idealne (błąd 0), rozwiązanie typowe, odwrócenie kolejności (maksymalny błąd 112).
  - Faza 2: Pełny konsensus (100% zgody), brak konsensusu, detekcja Cichego Eksperta ($\Delta \ge 5$).
- **Drzewko Relacji:**
  - Wzajemne wskazania: $Q_1 (+3)$, $Q_2 (+2)$, $Q_3 (+2)$, $Q_4 (-1)$.
  - Klasy stylów: Krawędź ujemna/zerowa ($W \le 0$), cienka ($1 \le W \le 3$), średnia ($4 \le W \le 7$), gruba z poświatą ($W \ge 8$).

### 2.2. Boundary Value Analysis (BVA - Analiza Wartości Brzegowych)
Badanie zachowania aplikacji na granicach przedziałów:
- Błąd rankingu: 0 (perfekcyjny), 25 (granica oceny doskonałej), 26 (dobra), 70 (słaba), 71 (katastrofalna), 112 (matematyczne maksimum przy $R(i) = 16 - E(i)$).
- Próg Cichego Eksperta: różnica $\text{TeamScore} - \text{Score}(u^*) = 4$ (brak flagi) vs $5$ (aktywacja flagi Cichego Eksperta).
- Wagi krawędzi relacji: $W = 0$, $W = 1$, $W = 3$, $W = 4$, $W = 7$, $W = 8$.
- Limity kart: 0 kart w ręku, 1 karta, 33 karty w Zin Obelisk (równy podział: np. 5 graczy $\to$ 3 po 7 kart, 2 po 6 kart).
- Timer Zin Obelisk: 25:00 min (aktywny), 00:01 (ostatnia szansa), 00:00 (blokada edycji).

### 2.3. Pairwise / Combinatorial Testing (Kombinacje Parametrów)
Testowanie interakcji między modułami:
- Rola użytkownika $\times$ Tryb sesji (Demo / Baza produkcyjna) $\times$ Dostęp do Drzewka Relacji.
- Wskazania w ankiecie $\times$ Wynik z Etapu 2 $\to$ Generowanie dedykowanego tooltipa diagnostycznego (np. Cichy Ekspert z małą liczbą wskazań).
- Dwie podgrupy (Nietoperze / Koty) $\times$ Wariant negocjacyjny (Rywalizacja Niedziela 9:00 / Współpraca Sobota 9:00).

### 2.4. Real-World Workload Testing (Symulacja Rzeczywistych Scenariuszy)
Symulacja kompletnych przepływów młodzieżowych:
- Przejście grupy 5 graczy (Alfa) przez pełny cykl: Onboarding Demo $\to$ Ułożenie kart CHAMPFROGS $\to$ Rozegranie scenariusza NASA Moon Survival $\to$ Ukończenie ankiety wzajemnej $\to$ Weryfikacja wag i tooltipów w Drzewku Relacji Lidera.
- Praca wieloosobowa na tablicy TeenBoard: równoczesne tworzenie karteczek, personalne cofanie operacji, laser pointer, pływający prywatny kalkulator.

---

## 3. Inwentarz Funkcji i Macierz Pokrycia (Feature Coverage Matrix)

| ID | Moduł | Funkcjonalność | Tier 1 (Req) | Tier 2 (Boundary) | Tier 3 (Interactions) | Tier 4 (E2E Scenario) |
|---|---|---|:---:|:---:|:---:|:---:|
| **F01-F03** | Core | Autoryzacja, rejestracja, logowanie, role Lider/Członek | ✅ | ✅ | ✅ | ✅ |
| **F04** | Core | Organizacje publiczne (akceptacja) i prywatne (kody) | ✅ | ✅ | ✅ | - |
| **F05** | Core | Personalizacja profilu (8 kolorów kameleona) | ✅ | ✅ | - | ✅ |
| **F07** | Demo | Standalone Tryb Demo (organizacja Alfa, mock store) | ✅ | ✅ | ✅ | ✅ |
| **F12-F14** | Etap 1 | CHAMPFROGS: 10 kart, flip-card 3D, D&D ranking 1-10, macierz Lidera | ✅ | ✅ | ✅ | ✅ |
| **F15-F19** | Etap 2 | Gry decyzyjne: Lost at Sea & Moon, sumy różnic, synergia, Cichy Ekspert | ✅ | ✅ | ✅ | ✅ |
| **F08-F11** | Etap 3 | Ankiety poetapowe, algorytm wag $W(A,B)$, style krawędzi, reguły tooltipów | ✅ | ✅ | ✅ | ✅ |
| **F20-F21** | Etap 4 | The Zin Obelisk: 33 karty, timer 25 min, walidacja Neptiminus | ✅ | ✅ | ✅ | - |
| **F22-F24** | Etap 5 | Murder Mystery (Współgwiazda/Bob Hartley) & Dracula (2 podgrupy, Sobota 9:00) | ✅ | ✅ | ✅ | - |
| **F25-F26** | Etap 6 | Kalambury (blokada tekstu, fuzzy match Levenshtein $\le 1$, live scoring) | ✅ | ✅ | - | - |
| **F27-F33** | TeenBoard | Wielostronicowa tablica, narzędzia, sticky notes, laser pointer 1.5s, prywatny kalkulator, personalne undo | ✅ | ✅ | ✅ | ✅ |
| **F34-F36** | Security | RLS: izolacja organizacji, wyłączność Drzewka Relacji dla Lidera | ✅ | ✅ | ✅ | ✅ |

---

## 4. Architektura Runnera Testów

Pakiet testowy oparty jest na **Vitest** (oraz opcjonalnie natywnym Node.js Test Runnerze z obsługą TypeScript `--experimental-strip-types`), co gwarantuje:
- Błyskawiczny czas wykonania (<2 sekundy dla całego zestawu ponad 100 testów).
- Zero konfliktów środowiskowych i niezależność od zewnętrznych baz danych.
- Możliwość uruchomienia zarówno w środowisku deweloperskim, jak i w kontenerze CI/CD (GitHub Actions, Railway).

### Struktura Katalogów:
```
tests/
├── helpers/
│   ├── contracts.ts              # Definicje typów, interfejsów i stałych referencyjnych
│   ├── expertKeys.ts             # Oficjalne klucze US Coast Guard, NASA, Zin Obelisk, CHAMPFROGS
│   └── mockStore.ts              # Niezależny silnik mockowy dla stanu Demo i sesji
├── tier1-requirements/           # Tier 1: Weryfikacja podstawowych wymagań biznesowych
│   ├── auth-roles.test.ts        # Role, logowanie, Tryb Demo, kody zaproszeń
│   ├── motivators.test.ts        # Karty CHAMPFROGS, flip-card, rankingi 1-10
│   ├── decision-scoring.test.ts  # Algorytm sumy różnic, Lost at Sea, NASA Moon, synergie
│   ├── relationship-tree.test.ts # Formuła wag W(A,B), 4 klasy stylów krawędzi, tooltipy
│   ├── logic-games.test.ts       # Zin Obelisk (Neptiminus), Murder Mystery, Dracula
│   └── teenboard-tools.test.ts   # Private calculator, personal undo/redo, laser pointer
├── tier2-boundary-values/        # Tier 2: Analiza wartości skrajnych i odporność na błędy
│   ├── decision-boundaries.test.ts # Maksymalny błąd 112, zerowy błąd 0, progi synergii
│   ├── relationship-boundaries.test.ts # Skrajne wagi [-6, 42], waga zerowa, brak relacji
│   ├── zin-obelisk-boundaries.test.ts # Skrajności czasu, warianty pisowni Neptiminus
│   └── teenboard-boundaries.test.ts # Puste notatki, ujemne współrzędne, kolizje kursorów
├── tier3-combinations-interactions/ # Tier 3: Interakcje modułów i przepływy wieloetapowe
│   ├── decision-to-survey.test.ts # Przejście: gra decyzyjna -> ankieta -> aktualizacja grafu
│   ├── collaborative-board.test.ts # Rozdział poszlak Zin/Dracula na tablicy, blokady obiektów
│   └── leader-diagnostic-flow.test.ts # Synergia cichego eksperta z wynikami ankiet w tooltipach
└── tier4-real-world-scenarios/    # Tier 4: Kompletne scenariusze użytkownika E2E
    └── full-journey-demo.test.ts  # Pełna ścieżka od wejścia w Demo do analizy Drzewka Lidera
```

---

## 5. Standardy Asercji i Matematyczne Źródła Oczekiwanych Wyników

### 5.1. Algorytm Decyzyjny (Lost at Sea / Moon Survival)
Formuła błędu bezwzględnego:
$$\text{Score}(u) = \sum_{i=1}^{15} | R_u(i) - E(i) |$$
- **Maksymalny możliwy błąd matematyczny dla permutacji 15-elementowej:**
  Gdy $R(i) = 16 - E(i)$, suma wynosi:
  $$|1 - 15| + |2 - 14| + \dots + |15 - 1| = 14 + 12 + 10 + 8 + 6 + 4 + 2 + 0 + 2 + 4 + 6 + 8 + 10 + 12 + 14 = 112$$
- **Wskaźnik Synergii:** $\Delta = \overline{\text{Indiv}} - \text{TeamScore}$. Jeśli $\Delta > 0 \implies \text{Synergia dodatnia}$.
- **Cichy Ekspert:** $\text{TeamScore} - \text{BestIndividual} \ge 5$.

### 5.2. Formuła Drzewka Relacji
$$W(A, B) = \sum_{s \in S_{\text{completed}}} \left( p_{A \to B}^{(s)} + p_{B \to A}^{(s)} \right)$$
Gdzie:
- Wybór w Pytaniu 1 (Współpraca): $+3$ pkt
- Wybór w Pytaniu 2 (Słuchanie): $+2$ pkt
- Wybór w Pytaniu 3 (Organizacja): $+2$ pkt
- Wybór w Pytaniu 4 (Chaos): $-1$ pkt
Mapowanie na styl krawędzi:
- $W \le 0 \implies$ `dashed` (1px) lub brak
- $1 \le W \le 3 \implies$ `solid` (1px)
- $4 \le W \le 7 \implies$ `solid` (3px)
- $W \ge 8 \implies$ `solid` (6px) z poświatą (`glow`)

### 5.3. Rozwiązanie The Zin Obelisk
- Objętość bryły: $50 \times 10 \times 100 = 50\,000$ bloków.
- Czas pracy netto: $9 - 2 = 7$ szlibów.
- Robotnicy układający: $9 - 1 = 8$ robotników.
- Wydajność dzienna ekipy: $8 \times (7 \times 150) = 8\,400$ bloków/dzień.
- Dni robocze: $50\,000 / 8\,400 \approx 5,95$ dnia roboczego $\implies$ ukończenie w 6. dniu roboczym.
- Dni tygodnia (5 dni: Aguaday, Neptiminus, Sharkday, Mermaidday, Daydoldrum [wolne]):
  - Tydzień 1: Aguaday (1), Neptiminus (2), Sharkday (3), Mermaidday (4), Daydoldrum (przerwa).
  - Tydzień 2: Aguaday (5), **Neptiminus (6)**.
- **Odpowiedź kanoniczna:** `Neptiminus`.

---

## 6. Instrukcja Uruchomienia Testów

Pakiet testowy może być uruchomiony za pomocą poleceń:
```bash
# Uruchomienie pełnego pakietu za pomocą Vitest
npx vitest run

# Uruchomienie wybranego Tieru
npx vitest run tests/tier1-requirements
npx vitest run tests/tier2-boundary-values
npx vitest run tests/tier3-combinations-interactions
npx vitest run tests/tier4-real-world-scenarios

# Uruchomienie za pomocą natywnego Node.js Test Runner (z zachowaniem niezależności)
node --experimental-strip-types --test tests/tier1-requirements/*.test.ts tests/tier2-boundary-values/*.test.ts tests/tier3-combinations-interactions/*.test.ts tests/tier4-real-world-scenarios/*.test.ts
```

Niniejsza specyfikacja stanowi podstawę dla weryfikacji jakości i certyfikacji przedwdrożeniowej aplikacji TeenBond.
