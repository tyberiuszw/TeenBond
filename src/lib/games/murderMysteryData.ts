import {
  SuspectCharacter,
  EvidenceCard,
  MurderScenarioId,
  MurderVerdictSubmission,
} from '@/types/game';

// ==========================================
// SCENARIO 1: The Movie Murder Mystery
// ==========================================
export const MOVIE_CHARACTERS: SuspectCharacter[] = [
  {
    id: 'char-co-star',
    name: 'The Co-Star (Współgwiazda)',
    role: 'Aktor drugoplanowy / Druga gwiazda filmu',
    bio: 'Niedoceniony artysta z wielkimi ambicjami. Wściekły, że nie otrzymał głównej roli.',
    motives: 'Urażona duma i zazdrość o sukces głównej gwiazdy. Otruł Reżysera podczas bankietu!',
    secretAction: 'Przynieś Reżyserowi drinka; kategorycznie odmawiaj picia wody z kranu.',
    traits: [
      'Lubi być przed kamerą',
      'Niezdarny (clumsy)',
      'Potrafi strzelać z broni palnej',
      'Jest jedynakiem',
      'Nie znosi robić zdjęć innym',
      'Uwielbia śpiewać',
      'Jeździ drogim, luksusowym autem',
      'Nie posiada zwierząt domowych',
      'Tylko jeden zawód przez całe życie (aktor)',
      'Nigdy nie był w więzieniu',
      'Lubi gry karciane',
      'Kawaler (nie jest żonaty)',
    ],
    isMurderer: true,
  },
  {
    id: 'char-minor',
    name: 'Minor Character (Epizodysta)',
    role: 'Początkujący aktor liczący na wielką sławę',
    bio: 'Głośny, pewny siebie i szukający uwagi.',
    motives: 'Złość za brak roli pierwszoplanowej, lecz nie popełnił zbrodni.',
    secretAction: 'Wskakuj w kadr na zdjęciach innych; zakładaj się o wszystko.',
    traits: [
      'Wielkie ego',
      'Szybki, paliwożerny wóz',
      'Nie lubi robić zdjęć',
      'Hoduje rybki akwariowe',
      'Wcześniej pracował jako model (wielozawodowiec)',
      'Mdleje na widok krwi',
    ],
    isMurderer: false,
  },
  {
    id: 'char-main',
    name: 'The Main Character (Główna Gwiazda)',
    role: 'Pierwszoplanowa gwiazda filmu',
    bio: 'Utalentowany aktor i śpiewak, uwielbiany przez publiczność.',
    motives: 'Chciał więcej scen muzycznych w filmie, lecz miał świetną relację z Reżyserem.',
    secretAction: 'Podawaj drinki gościom; dbaj by kieliszek Reżysera był pełny.',
    traits: [
      'Skromny profesjonalista',
      'Zawodowy śpiewak',
      'Posiada królika domowego',
      'Trafił kiedyś przez pomyłkę do aresztu za granicą',
      'Szczęśliwie żonaty',
    ],
    isMurderer: false,
  },
  {
    id: 'char-writer',
    name: 'The Writer (Scenarzysta)',
    role: 'Autor scenariusza filmu',
    bio: 'Introwertyczny intelektualista dbający o czystość języka.',
    motives: 'Kłótnie o gażę autorską i cięcia w dialogach.',
    secretAction: 'Nie pij wody z kranu; poprawiaj błędy gramatyczne innych.',
    traits: [
      'Niezdarny (clumsy)',
      'Starsza siostra (nie jest jedynakiem)',
      'Nienawidzi być przed kamerą',
      'Właściciel kota',
      'Tylko pisał w życiu',
      'Abstynent',
    ],
    isMurderer: false,
  },
  {
    id: 'char-antagonist',
    name: 'The Antagonist (Czarny Charakter)',
    role: 'Aktor odgrywający postać złoczyńcy',
    bio: 'Charyzmatyczny zawadiaka o ironiczno-flirciarskim usposobieniu.',
    motives: 'Reżyser groził ujawnieniem jego kompromitującego dawnego filmu sci-fi.',
    secretAction: 'Flirtuj z gośćmi; rób śmieszne miny za plecami innych.',
    traits: [
      'Lubi być fotografowany',
      'Auto elektryczne',
      'Brak zwierząt',
      'Gra na gitarze elektrycznej',
      'Uniknął aresztu dzięki prawnikowi',
    ],
    isMurderer: false,
  },
  {
    id: 'char-camera',
    name: 'Camera Operator (Operator Kamery)',
    role: 'Główny operator zdjęć na planie',
    bio: 'Zwinny i spostrzegawczy artysta wizualny.',
    motives: 'Reżyser publicznie krytykował go za uszkodzenie taśmy filmowej.',
    secretAction: 'Rób zdjęcia telefonem; praw komplementy.',
    traits: [
      'Niezwykle zwinny (graceful)',
      'Wąż domowy (pet snake)',
      'Fotograf ptaków',
      'Środkowe dziecko z trójki (nie jedynak)',
    ],
    isMurderer: false,
  },
  {
    id: 'char-costume',
    name: 'Costume Designer (Kostiumograf)',
    role: 'Twórca strojów filmowych',
    bio: 'Wrażliwy artysta skrycie zakochany w Reżyserze.',
    motives: 'Zranione uczucia z powodu odrzucenia zalotów.',
    secretAction: 'Chwal kreacje innych; częstuj Reżysera jedzeniem.',
    traits: [
      'Niezdarny (clumsy)',
      'Nieśmiały przed obiektywem',
      'Hoduje ptaka',
      'Były iluzjonista (wielozawodowiec)',
    ],
    isMurderer: false,
  },
  {
    id: 'char-gaffer',
    name: 'Gaffer (Mistrz Oświetlenia)',
    role: 'Szef ekipy oświetleniowej',
    bio: 'Twardy technik dbający o sprzęt i porządek na planie.',
    motives: 'Spór techniczny z Operatorem Kamery, brak motywu przeciw Reżyserowi.',
    secretAction: 'Opowiadaj o pająkach; narzekaj na operatora.',
    traits: [
      'Zwinny (graceful)',
      'Pająk domowy (pet spider)',
      'Broń palną zna wyłącznie z gier wideo',
    ],
    isMurderer: false,
  },
  {
    id: 'char-reporter',
    name: 'Reporter (Dziennikarz Filmowy)',
    role: 'Dziennikarz relacjonujący produkcję',
    bio: 'Wścibski poszukiwacz sensacji z dyktafonem i notesem.',
    motives: 'Reżyser odmówił mu wywiadu na wyłączność.',
    secretAction: 'Przeprowadzaj krótkie wywiady z gośćmi; notuj w kajecie.',
    traits: [
      'Niezdarny (clumsy)',
      'Jedynak',
      'Za dużo podróżuje by mieć zwierzęta',
      'Trzyma się z tyłu za kamerą',
    ],
    isMurderer: false,
  },
  {
    id: 'char-boom',
    name: 'Boom Operator (Dźwiękowiec)',
    role: 'Operator tyczki mikrofonowej',
    bio: 'Cichy obserwator z wiecznie nałożonymi słuchawkami.',
    motives: 'Drobny dług u Reżysera, cieszy się ze zgonu lecz nie zabił.',
    secretAction: 'Powtarzaj "chyba nas podsłuchują"; pytaj o podcasty.',
    traits: [
      'Starszy brat aktor (nie jedynak)',
      'Jaszczurka domowa',
      'Wielozawodowiec dorywczy',
    ],
    isMurderer: false,
  },
];

export const MOVIE_EVIDENCES: EvidenceCard[] = [
  {
    id: 'ev-m01',
    title: 'Brak kota',
    category: 'testimony',
    description: 'Morderca nie posiada kota.',
    source: 'Notatka Reżysera',
    revealed: true,
  },
  {
    id: 'ev-m02',
    title: 'Brak pająka',
    category: 'testimony',
    description: 'Morderca nie posiada pająka.',
    source: 'Notatka Reżysera',
    revealed: true,
  },
  {
    id: 'ev-m03',
    title: 'Brak węża',
    category: 'testimony',
    description: 'Morderca nie posiada węża.',
    source: 'Notatka Reżysera',
    revealed: true,
  },
  {
    id: 'ev-m04',
    title: 'Brak psa',
    category: 'testimony',
    description: 'Morderca nie posiada psa.',
    source: 'Notatka Reżysera',
    revealed: true,
  },
  {
    id: 'ev-m05',
    title: 'Pojedynczy zawód',
    category: 'testimony',
    description: 'Morderca miał tylko jeden rodzaj pracy przez całe swoje dotychczasowe życie.',
    source: 'Kartoteka zawodowa',
    revealed: true,
  },
  {
    id: 'ev-m06',
    title: 'Światło jupiterów',
    category: 'testimony',
    description: 'Morderca kocha być w centrum uwagi i uwielbia znajdować się przed kamerą.',
    source: 'Zeznania ekipy',
    revealed: true,
  },
  {
    id: 'ev-m07',
    title: 'Niechęć do fotografowania',
    category: 'testimony',
    description: 'Morderca nie znosi robić zdjęć innym ludziom.',
    source: 'Zeznania ekipy',
    revealed: true,
  },
  {
    id: 'ev-m08',
    title: 'Niezdarność ruchowa',
    category: 'physical',
    description: 'Morderca charakteryzuje się niezdarnością (clumsy), często coś upuszcza.',
    source: 'Ślady na miejscu zbrodni',
    revealed: true,
  },
  {
    id: 'ev-m09',
    title: 'Luksusowe auto',
    category: 'physical',
    description: 'Morderca porusza się bardzo drogim, eleganckim samochodem.',
    source: 'Parking przed bankietem',
    revealed: true,
  },
  {
    id: 'ev-m10',
    title: 'Wstręt do kranówki',
    category: 'testimony',
    description: 'Morderca odmawia picia zwykłej wody z kranu, pija wyłącznie napoje butelkowane.',
    source: 'Obserwacja kelnera',
    revealed: true,
  },
  {
    id: 'ev-m11',
    title: 'Pasja do śpiewu',
    category: 'testimony',
    description: 'Morderca uwielbia śpiewać i chętnie to demonstruje.',
    source: 'Zeznania świadków',
    revealed: true,
  },
  {
    id: 'ev-m12',
    title: 'Umiejętność strzelecka',
    category: 'physical',
    description: 'Morderca potrafi posługiwać się prawdziwą bronią palną.',
    source: 'Kartoteka strzelnicy',
    revealed: true,
  },
  {
    id: 'ev-m13',
    title: 'Czysta kartoteka karna',
    category: 'document',
    description: 'Morderca nigdy w życiu nie siedział w areszcie ani w więzieniu.',
    source: 'Baza policyjna',
    revealed: true,
  },
  {
    id: 'ev-m14',
    title: 'Zamiłowanie do kart',
    category: 'testimony',
    description: 'Morderca lubi spędzać wolny czas na grach karcianych.',
    source: 'Klub towarzyski',
    revealed: true,
  },
  {
    id: 'ev-m15',
    title: 'Jedynak',
    category: 'document',
    description: 'Morderca jest jedynakiem – nie posiada brata ani siostry.',
    source: 'Akt urodzenia',
    revealed: true,
  },
  {
    id: 'ev-m16',
    title: 'Stan wolny',
    category: 'document',
    description: 'Morderca nie jest w związku małżeńskim (jest kawalerem/panną).',
    source: 'Urząd stanu cywilnego',
    revealed: true,
  },
  {
    id: 'ev-m17',
    title: 'Zalotne zachowanie',
    category: 'testimony',
    description: 'Morderca podczas bankietu otwarcie flirtował z innymi gośćmi.',
    source: 'Relacje gości',
    revealed: true,
  },
  {
    id: 'ev-m18',
    title: 'List Śmiertelny: Trucizna!',
    category: 'physical',
    description: 'Ofiara zostawiła w dłoni notatkę: "Zostałem otruty (I was poisoned)! Morderca podał mi truciznę w napoju!"',
    source: 'Dłoń zmarłego Reżysera',
    revealed: true,
  },
];

// ==========================================
// SCENARIO 2: TechStream Murder Mystery
// ==========================================
export const TECHSTREAM_CHARACTERS: SuspectCharacter[] = [
  {
    id: 'char-bob',
    name: 'Bob Hartley',
    role: 'CEO firmy TechStream',
    bio: 'Bezwzględny menedżer skupiony na maksymalizacji zysków korporacji.',
    motives: 'James Mulligan zamierzał przekształcić firmę w fundację charytatywną. Bob ukradł podpisany kontrakt i zabił Jamesa zabytkowym mieczem!',
    traits: [
      'Ubrany na niebiesko tamtego wieczoru',
      'Stał sam z tyłu na balkonie podczas pokazu fajerwerków (brak alibi)',
      'Wypytywał Jamesa o architektów budujących sekretne drzwi',
      'Sprzeciwiał się planom pomocy potrzebującym',
      'Wyważył drzwi gabinetu o 20:15, by jako pierwszy wejść do środka',
    ],
    woreColor: 'blue',
    hasSecretAccess: true,
    isMurderer: true,
  },
  {
    id: 'char-karen',
    name: 'Karen Mulligan',
    role: 'Żona ofiary (w ciąży)',
    bio: 'Podejrzewała męża o zdradę, lecz kochała go i czekała na narodziny dziecka.',
    motives: 'Groziła kiedyś, że zabije Jamesa jeśli potwierdzi romans, lecz miała żelazne alibi.',
    traits: [
      'Ubrana na niebiesko',
      'Rozlała czerwone wino w drodze na balkon',
      'W trakcie zabójstwa (20:14) podawała chusteczkę płaczącej Susan na balkonie',
    ],
    woreColor: 'blue',
    hasSecretAccess: false,
    isMurderer: false,
  },
  {
    id: 'char-david',
    name: 'David Johnson',
    role: 'Najlepszy przyjaciel ofiary',
    bio: 'Dawniej kochał się w Karen. Czuł się rozdarty między żoną a przyjacielem.',
    motives: 'Znalazł w kieszeni list Susan wyznającej romans z Jamesem.',
    traits: [
      'Ubrany na niebiesko',
      'Oglądał fajerwerki na balkonie w centrum uwagi świadków',
      'Nie wiedział o sekretnym przejściu',
    ],
    woreColor: 'blue',
    hasSecretAccess: false,
    isMurderer: false,
  },
  {
    id: 'char-susan',
    name: 'Susan Johnson',
    role: 'Żona Davida',
    bio: 'Przez rok miała sekretny romans z Jamesem Mulliganem, który postanowiła zakończyć.',
    motives: 'Lęk przed skandalem towarzyskim.',
    traits: [
      'Ubrana na zielono/czarno (nie nosiła niebieskiego)',
      'Płakała na balkonie o 20:14, przepraszając Davida',
      'Brak dostępu do broni',
    ],
    woreColor: 'other',
    hasSecretAccess: false,
    isMurderer: false,
  },
  {
    id: 'char-lawyer',
    name: 'His Lawyer (Prawnik Jamesa)',
    role: 'Radca prawny fundacji i spółki',
    bio: 'Przybył o 19:35 przygotować dokumenty zmiany statutu firmy na cele charytatywne.',
    motives: 'Brak motywu – realizował wolę zmarłego klienta.',
    traits: [
      'Wyszedł z gabinetu ok. 20:00 do toalety i po wino do kuchni',
      'Zastał drzwi zamknięte o 20:15 i wszczął alarm',
      'Ubrany w szary garnitur',
    ],
    woreColor: 'other',
    hasSecretAccess: false,
    isMurderer: false,
  },
  {
    id: 'char-maid',
    name: 'His Maid (Pokojówka)',
    role: 'Gospodyni rezydencji',
    bio: 'Pracuje w posiadłości od wielu lat. Doskonale zna sekrety rodziny.',
    motives: 'Brak motywu.',
    traits: [
      'Sprzątała w kuchni od 19:30 do 20:15',
      'Nalała wina prawnikowi o 20:05',
      'Słyszała dawne groźby Karen',
    ],
    woreColor: 'other',
    hasSecretAccess: false,
    isMurderer: false,
  },
];

export const TECHSTREAM_EVIDENCES: EvidenceCard[] = [
  // Pakiet 1 (poszlaki 1-5)
  {
    id: 'ev-ts01',
    title: 'Drzwi balkonowe',
    category: 'spatial',
    description: 'Balkon rezydencji ma dwoje drzwi: jedne prowadzą do jadalni, a drugie bezpośrednio do sypialni Jamesa i Karen.',
    source: 'Oględziny balkonu',
    assignedToPlayerIndex: 0,
    revealed: true,
  },
  {
    id: 'ev-ts02',
    title: 'Miecz w sypialni',
    category: 'physical',
    description: 'Zaginiony antyczny miecz ze ściany gabinetu znaleziono porzucony w sypialni gospodarzy.',
    source: 'Przeszukanie sypialni',
    assignedToPlayerIndex: 0,
    revealed: true,
  },
  {
    id: 'ev-ts03',
    title: 'Krzyk prawnika i wyważenie',
    category: 'testimony',
    description: 'O 20:15 goście usłyszeli krzyk prawnika dobijającego się do zamkniętego gabinetu. Bob Hartley natychmiast wyważył drzwi.',
    source: 'Zeznania świadków',
    assignedToPlayerIndex: 0,
    revealed: true,
  },
  {
    id: 'ev-ts04',
    title: 'Płacz Susan na balkonie',
    category: 'testimony',
    description: 'Krótko przed 20:15 Karen usłyszała szloch Susan i podała jej chusteczkę. Susan spojrzała na Davida mówiąc: "Przepraszam".',
    source: 'Zeznania Karen',
    assignedToPlayerIndex: 0,
    revealed: true,
  },
  {
    id: 'ev-ts05',
    title: 'Niebieskie stroje',
    category: 'physical',
    description: 'Tamtego wieczoru wyłącznie trzy osoby miały na sobie niebieskie ubrania: Bob Hartley, Karen Mulligan i David Johnson.',
    source: 'Zdjęcia z kolacji',
    assignedToPlayerIndex: 0,
    revealed: true,
  },

  // Pakiet 2 (poszlaki 6-10)
  {
    id: 'ev-ts06',
    title: 'Ruchy prawnika',
    category: 'testimony',
    description: 'Prawnik zeznał, że opuścił gabinet ok. 20:00 do toalety, a potem poszedł do kuchni po wino. Wrócił o 20:15 i zastał zaryglowane drzwi.',
    source: 'Zeznania prawnika',
    assignedToPlayerIndex: 1,
    revealed: true,
  },
  {
    id: 'ev-ts07',
    title: 'Dawne uczucie Davida',
    category: 'testimony',
    description: 'David Johnson wiele lat temu szaleńczo kochał się w Karen, zanim ta poślubiła Jamesa.',
    source: 'Plotki towarzyskie',
    assignedToPlayerIndex: 1,
    revealed: true,
  },
  {
    id: 'ev-ts08',
    title: 'Niebieski skrawek w gabinecie',
    category: 'physical',
    description: 'Na biurku w prywatnym gabinecie zmarłego znaleziono skrawek wyrwanego niebieskiego materiału.',
    source: 'Ślady kryminalistyczne',
    assignedToPlayerIndex: 1,
    revealed: true,
  },
  {
    id: 'ev-ts09',
    title: 'Bob sam w cieniu balkonu',
    category: 'testimony',
    description: 'Bob Hartley stał sam za wszystkimi na balkonie podczas fajerwerków. Nikt nie pamięta, by z nim rozmawiał między 20:00 a 20:14.',
    source: 'Zeznania gości',
    assignedToPlayerIndex: 1,
    revealed: true,
  },
  {
    id: 'ev-ts10',
    title: 'List pożegnalny Susan',
    category: 'document',
    description: 'W kieszeni marynarki Davida znaleziono list od Susan: "Spotykam się z Jamesem od roku, ale obiecuję skończyć to dziś. Wybacz mi".',
    source: 'Kieszeń Davida',
    assignedToPlayerIndex: 1,
    revealed: true,
  },

  // Pakiet 3 (poszlaki 11-16)
  {
    id: 'ev-ts11',
    title: 'Brakujący miecz',
    category: 'physical',
    description: 'Na ścianie gabinetu wisiała kolekcja broni Jamesa. Po otwarciu gabinetu zauważono brak jednego ostrego miecza.',
    source: 'Ściana gabinetu',
    assignedToPlayerIndex: 2,
    revealed: true,
  },
  {
    id: 'ev-ts12',
    title: 'Brakujący dokument',
    category: 'document',
    description: 'James siedział martwy przy biurku z piórem w dłoni, lecz przed nim nie było żadnego dokumentu ani kartki.',
    source: 'Biurko ofiary',
    assignedToPlayerIndex: 2,
    revealed: true,
  },
  {
    id: 'ev-ts13',
    title: 'Krew na dywanie sypialni',
    category: 'physical',
    description: 'Policja odkryła czerwone plamy krwi biegnące na dywanie od zachodniej ściany sypialni ku drzwiom balkonowym.',
    source: 'Raport techników',
    assignedToPlayerIndex: 2,
    revealed: true,
  },
  {
    id: 'ev-ts14',
    title: 'Spotkanie o 19:35',
    category: 'testimony',
    description: 'O 19:35 James i prawnik odeszli od gości do gabinetu, by sfinalizować ważną umowę biznesową.',
    source: 'Zeznania świadków',
    assignedToPlayerIndex: 2,
    revealed: true,
  },
  {
    id: 'ev-ts15',
    title: 'Groźba Karen',
    category: 'testimony',
    description: 'Pokojówka słyszała jak Karen mówiła w złości: "Jeśli potwierdzę, że James ma romans, własnoręcznie go zabiję".',
    source: 'Zeznania pokojówki',
    assignedToPlayerIndex: 2,
    revealed: true,
  },
  {
    id: 'ev-ts16',
    title: 'Sprzeciw Boba wobec fundacji',
    category: 'document',
    description: 'James dzwonił niedawno do Boba Hartleya, mówiąc o przekazaniu zysków TechStream na pomoc ubogim. Bob kategorycznie protestował.',
    source: 'Bilingi i maile',
    assignedToPlayerIndex: 2,
    revealed: true,
  },

  // Pakiet 4 (poszlaki 17-21)
  {
    id: 'ev-ts17',
    title: 'Alibi pokojówki',
    category: 'testimony',
    description: 'Po kolacji o 19:30 pokojówka poszła do kuchni zmywać naczynia i była tam do 20:15, nalewając po drodze wino prawnikowi.',
    source: 'Kuchnia',
    assignedToPlayerIndex: 3,
    revealed: true,
  },
  {
    id: 'ev-ts18',
    title: 'Opóźnienie kolacji',
    category: 'testimony',
    description: 'Kolacja zaczęła się 15 minut później, bo nikt nie mógł znaleźć Karen i Davida, którzy rozmawiali na korytarzu.',
    source: 'Zeznania gości',
    assignedToPlayerIndex: 3,
    revealed: true,
  },
  {
    id: 'ev-ts19',
    title: 'Rozlane czerwone wino',
    category: 'physical',
    description: 'Karen rozlała czerwone wino na korytarzu między jadalnią a balkonem, gdy goście przechodzili na pokaz.',
    source: 'Plamy w jadalni',
    assignedToPlayerIndex: 3,
    revealed: true,
  },
  {
    id: 'ev-ts20',
    title: 'Topografia gabinetu',
    category: 'spatial',
    description: 'Prywatny gabinet Jamesa mieści się bezpośrednio za zachodnią ścianą głównej sypialni.',
    source: 'Plan architektoniczny',
    assignedToPlayerIndex: 3,
    revealed: true,
  },
  {
    id: 'ev-ts21',
    title: 'Ukryte przejście',
    category: 'spatial',
    description: 'James Mulligan pytał kiedyś Boba Hartleya o namiary na architektów potrafiących projektować sekretne przejścia w ścianach.',
    source: 'Rozmowa biznesowa',
    assignedToPlayerIndex: 3,
    revealed: true,
  },
];

/**
 * Validates team consensus verdict submission for Movie Murder Mystery.
 * Evaluates points (+100 for culprit, +50 for weapon = +150 max).
 */
export function evaluateMovieMurder(
  culprit: string,
  weapon: string
): { score: number; isSolved: boolean } {
  const normCulprit = culprit.trim().toLowerCase();
  const normWeapon = weapon.trim().toLowerCase();

  const isCulpritCorrect =
    normCulprit === 'the co-star' ||
    normCulprit === 'co-star' ||
    normCulprit === 'wspolgwiazda' ||
    normCulprit === 'char-co-star';

  const isWeaponCorrect =
    normWeapon === 'poison' || normWeapon === 'trucizna' || normWeapon === 'otrucie';

  let score = 0;
  if (isCulpritCorrect) score += 100;
  if (isWeaponCorrect) score += 50;

  return { score, isSolved: isCulpritCorrect && isWeaponCorrect };
}

/**
 * Validates team consensus verdict submission for TechStream Murder Mystery.
 */
export function evaluateTechStreamMurder(
  culprit: string,
  weapon: string
): { score: number; isSolved: boolean } {
  const normCulprit = culprit.trim().toLowerCase();
  const normWeapon = weapon.trim().toLowerCase();

  const isCulpritCorrect =
    normCulprit === 'bob hartley' ||
    normCulprit === 'bob' ||
    normCulprit === 'char-bob';

  const isWeaponCorrect =
    normWeapon === 'miecz' || normWeapon === 'sword' || normWeapon === 'the sword';

  let score = 0;
  if (isCulpritCorrect) score += 100;
  if (isWeaponCorrect) score += 50;

  return { score, isSolved: isCulpritCorrect && isWeaponCorrect };
}
