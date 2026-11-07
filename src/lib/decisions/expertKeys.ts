export interface ExpertRationaleDef {
  itemId: string;
  officialRank: number;
  namePl: string;
  nameEn: string;
  rationalePl: string;
  rationaleEn: string;
}

export const LOST_AT_SEA_EXPERT_RATIONALES: readonly ExpertRationaleDef[] = [
  {
    itemId: 'mirror',
    officialRank: 1,
    namePl: 'Lusterko do golenia',
    nameEn: 'Shaving Mirror',
    rationalePl:
      'Ze wszystkich przedmiotów lusterko jest absolutnie kluczowe. To najpotężniejsze narzędzie sygnalizacji obecności. W pełnym słońcu generuje błysk o sile od 5 do 7 milionów kandeli. Odbity promień słońca jest widoczny nawet zza linii horyzontu.',
    rationaleEn:
      'Of all the items, the mirror is absolutely critical. It is the most powerful tool you have for communicating your presence. In sunlight, a simple mirror can generate five to seven million candlepower of light. The reflected sunbeam can even be seen beyond the horizon.',
  },
  {
    itemId: 'oil_can',
    officialRank: 2,
    namePl: '10-litrowy kanister mieszanki oleju i benzyny',
    nameEn: '10 liter can of Oil/Petrol mixture',
    rationalePl:
      'Drugi najważniejszy przedmiot do sygnalizacji. Mieszanka unosi się na powierzchni wody i można ją podpalić za pomocą zapałek z kieszeni, tworząc gruby słup czarnego dymu widoczny z wielu mil.',
    rationaleEn:
      'The second most critical item for signaling. The mixture will float on water & can be ignited using the matches.',
  },
  {
    itemId: 'water',
    officialRank: 3,
    namePl: '25-litrowy pojemnik z wodą pitną',
    nameEn: '25 liter container of Water',
    rationalePl:
      'Niezbędna do uzupełnienia płynów traconych przez intensywne pocenie się w klimacie tropikalnym. Ilość ta zapewnia racje dla całej grupy na kilka dni.',
    rationaleEn:
      'Vital to restore fluids lost through perspiration. Quantity will supply rations for your group for several days.',
  },
  {
    itemId: 'rations',
    officialRank: 4,
    namePl: 'Skrzynka wojskowych racji żywnościowych',
    nameEn: 'Case of Army Rations',
    rationalePl:
      'Podstawowe źródło pożywienia i energii, pozwalające utrzymać siły organizmu w oczekiwaniu na nadejście ratunku.',
    rationaleEn: 'This is your basic food intake.',
  },
  {
    itemId: 'plastic_sheet',
    officialRank: 5,
    namePl: 'Nieprzezroczysta płachta plastikowa (ok. 2 m²)',
    nameEn: '20 sq. ft. of opaque Plastic Sheeting',
    rationalePl:
      'Uniwersalne zastosowanie: służy do zbierania słodkiej wody deszczowej oraz stanowi krytyczną osłonę przed palącym słońcem, wiatrem i falami zalewającymi tratwę.',
    rationaleEn: 'Can be used to collect rain water & shelter from wind & waves.',
  },
  {
    itemId: 'chocolate',
    officialRank: 6,
    namePl: '2 pudełka tabliczek czekolady',
    nameEn: '2 boxes of Chocolate Bars',
    rationalePl:
      'Rezerwowy zapas kalorii i cukrów prostych, dostarczający załodze szybkiego zastrzyku energii w chwilach kryzysowych.',
    rationaleEn: 'Your reserve food supply.',
  },
  {
    itemId: 'fishing_kit',
    officialRank: 7,
    namePl: 'Zestaw wędkarski z wędką',
    nameEn: 'An ocean Fishing Kit & Pole',
    rationalePl:
      'Sklasyfikowany niżej niż czekolada, gdyż nie ma gwarancji złowienia ryby. Wędka może posłużyć jako maszt konstrukcyjny pod namiot z płachty plastikowej.',
    rationaleEn:
      'Ranked lower than chocolate as there is no guarantee you will catch fish. Pole could be used as a tent pole.',
  },
  {
    itemId: 'rope',
    officialRank: 8,
    namePl: '5 metrów liny nylonowej (15 ft)',
    nameEn: '15 ft. of Nylon Rope',
    rationalePl:
      'Umożliwia związanie ekwipunku lub przywiązanie ludzi do tratwy podczas sztormu, zapobiegając zmyciu za burtę. Przydatna do wielu drobnych napraw, lecz nie kluczowa.',
    rationaleEn:
      'Could be used to lash people or equipment together to prevent being washed overboard. There are a variety of other uses but non high on the list for survival.',
  },
  {
    itemId: 'seat_cushion',
    officialRank: 9,
    namePl: 'Pływająca poduszka do siedzenia',
    nameEn: 'Floating Seat Cushion',
    rationalePl:
      'Użyteczna jako koło ratunkowe / asekuracja pływalności w razie wypadnięcia członka załogi do wody.',
    rationaleEn: 'Useful as a life preserver if someone fell overboard.',
  },
  {
    itemId: 'shark_repellent',
    officialRank: 10,
    namePl: 'Puszka odstraszacza rekinów',
    nameEn: 'Can of Shark Repellent',
    rationalePl:
      'Oczywiste zastosowanie odstraszające drapieżniki, jednak woda, żywność i sygnalizacja mają bezwzględnie wyższy priorytet przetrwania.',
    rationaleEn: 'Obvious!',
  },
  {
    itemId: 'rubbing_alcohol',
    officialRank: 11,
    namePl: 'Butelka spirytusu salicylowego',
    nameEn: 'One bottle of Rubbing Alcohol',
    rationalePl:
      'Środek antyseptyczny na rany i otarcia. Absolutnie nie wolno go pić – spowoduje gwałtowne odwodnienie tkanek i zgon.',
    rationaleEn:
      'Can be used as an antiseptic for any injuries. Not to be ingested as it will cause dehydration.',
  },
  {
    itemId: 'radio',
    officialRank: 12,
    namePl: 'Małe radio tranzystorowe',
    nameEn: 'Small Transistor Radio',
    rationalePl:
      'Jest wyłącznie odbiornikiem AM/FM. W odległości 1000 mil morskich od lądu załoga znajduje się całkowicie poza zasięgiem jakichkolwiek stacji radiowych.',
    rationaleEn: 'You would be out of range of any radio station.',
  },
  {
    itemId: 'maps',
    officialRank: 13,
    namePl: 'Mapy Oceanu Spokojnego',
    nameEn: 'Maps of the Pacific Ocean',
    rationalePl:
      'Bez przyrządów nawigacyjnych, dokładnego czasu i znajomości punktu wyjściowego mapa otwartego oceanu jest bezwartościowa.',
    rationaleEn: 'Worthless without navigation equipment.',
  },
  {
    itemId: 'mosquito_netting',
    officialRank: 14,
    namePl: 'Moskitiera',
    nameEn: 'Mosquito Netting',
    rationalePl: 'Na środku otwartego oceanu nie ma komarów ani innych owadów.',
    rationaleEn: 'There are NO mosquitos in the middle of the ocean.',
  },
  {
    itemId: 'sextant',
    officialRank: 15,
    namePl: 'Sekstant',
    nameEn: 'Sextant',
    rationalePl:
      'Całkowicie bezużyteczny bez odpowiednich tablic astronomicznych (efemeryd) oraz precyzyjnego chronometru morskiego.',
    rationaleEn: 'Useless without the relevant tables & a chronometer.',
  },
];

export const NASA_MOON_EXPERT_RATIONALES: readonly ExpertRationaleDef[] = [
  {
    itemId: 'oxygen_tanks',
    officialRank: 1,
    namePl: 'Dwie 45-kg butle z tlenem (100 lb)',
    nameEn: 'Two 100 lb. tanks of oxygen',
    rationalePl:
      'Najważniejsza, natychmiastowa potrzeba biologiczna. Ciężar nie jest przeszkodą – przy grawitacji 1/6 ziemskiej każda butla waży na Księżycu zaledwie ok. 7,7 kg (17 lbs).',
    rationaleEn:
      "Most pressing survival need (weight is not a factor since gravity is one-sixth of the Earth's – each tank would weigh only about 17 lbs. on the moon).",
  },
  {
    itemId: 'water',
    officialRank: 2,
    namePl: '20 litrów wody pitnej',
    nameEn: '20 liters of water',
    rationalePl:
      'Niezbędna do uzupełnienia gigantycznej utraty płynów ustrojowych na gorącej, nasłonecznionej stronie Księżyca.',
    rationaleEn: 'Needed for replacement of tremendous liquid loss on the light side.',
  },
  {
    itemId: 'stellar_map',
    officialRank: 3,
    namePl: 'Mapa gwiazd (konstelacji)',
    nameEn: 'Stellar map',
    rationalePl:
      'Główne narzędzie nawigacji – układ konstelacji gwiazd widziany z Księżyca jest niemal identyczny jak z powierzchni Ziemi.',
    rationaleEn:
      'Primary means of navigation – star patterns appear essentially identical on the moon as on Earth.',
  },
  {
    itemId: 'food_concentrate',
    officialRank: 4,
    namePl: 'Koncentrat żywnościowy',
    nameEn: 'Food concentrate',
    rationalePl:
      'Wysoce wydajne, skondensowane i lekkie źródło kalorii niezbędnych do pokonania 320-kilometrowego dystansu.',
    rationaleEn: 'Efficient means of supplying energy requirements.',
  },
  {
    itemId: 'solar_fm_radio',
    officialRank: 5,
    namePl: 'Nadajnik-odbiornik FM zasilany energią słoneczną',
    nameEn: 'Solar-powered FM receiver-transmitter',
    rationalePl:
      'Służy do nawiązania łączności ze statkiem-matką, lecz fale UKF (FM) wymagają bezpośredniej widoczności optycznej i mają ograniczony zasięg.',
    rationaleEn:
      'For communication with mother ship (but FM requires line-of-sight transmission and can only be used over short ranges).',
  },
  {
    itemId: 'nylon_rope',
    officialRank: 6,
    namePl: '15 metrów liny nylonowej (50 ft)',
    nameEn: '50 feet of nylon rope',
    rationalePl:
      'Pomocna przy pokonywaniu kraterów, schodzeniu ze stromych formacji skalnych oraz asekurowaniu lub transportowaniu rannych astronautów.',
    rationaleEn: 'Useful in scaling cliffs and tying injured together.',
  },
  {
    itemId: 'first_aid_kit',
    officialRank: 7,
    namePl: 'Apteczka pierwszej pomocy z igłą do iniekcji',
    nameEn: 'First aid kit, including injection needle',
    rationalePl:
      'Igły iniekcyjne pasują do dedykowanego zaworu w skafandrze kosmicznym NASA, umożliwiając podanie leków bez dekompresji.',
    rationaleEn:
      'Needles connected to vials of vitamins, medicines, etc. will fit special aperture in NASA space suit.',
  },
  {
    itemId: 'parachute_silk',
    officialRank: 8,
    namePl: 'Jedwab spadochronowy',
    nameEn: 'Parachute silk',
    rationalePl:
      'Skuteczna ochrona przed bezpośrednim promieniowaniem słonecznym i przegrzaniem skafandrów na oświetlonej powierzchni.',
    rationaleEn: "Protection from the sun's rays.",
  },
  {
    itemId: 'life_raft',
    officialRank: 9,
    namePl: 'Samopompująca się tratwa ratunkowa',
    nameEn: 'Self-inflating life raft',
    rationalePl:
      'Butla ze sprężonym CO2 z mechanizmu napełniania tratwy może posłużyć jako miniaturowy silnik odrzutowy do pokonywania rozpadlin.',
    rationaleEn: 'CO2 bottle in military raft may be used for propulsion.',
  },
  {
    itemId: 'signal_flares',
    officialRank: 10,
    namePl: 'Race sygnalizacyjne (flary)',
    nameEn: 'Signal flares',
    rationalePl:
      'Wizualny sygnał alarmowy po nawiązaniu kontaktu wzrokowego ze statkiem-matką (posiadają własny utleniacz).',
    rationaleEn: 'Use as distress signal when the mother ship is sighted.',
  },
  {
    itemId: 'pistols',
    officialRank: 11,
    namePl: 'Dwa pistolety kalibru .45',
    nameEn: 'Two .45 caliber pistols',
    rationalePl:
      'Potencjalny napęd odrzutowy – odrzut wystrzału gazów prochowych w próżni może popchnąć astronautę w wybranym kierunku.',
    rationaleEn: 'Possible means of self-propulsion.',
  },
  {
    itemId: 'dehydrated_milk',
    officialRank: 12,
    namePl: 'Skrzynka mleka w proszku',
    nameEn: 'One case of dehydrated milk',
    rationalePl:
      'Nieporęczny i ciężki dubel koncentratu żywnościowego; dodatkowo wymaga zużycia bezcennej wody pitnej do rozpuszczenia.',
    rationaleEn: 'Bulkier duplication of food concentrate.',
  },
  {
    itemId: 'heating_unit',
    officialRank: 13,
    namePl: 'Przenośna jednostka grzewcza (piecyk)',
    nameEn: 'Portable heating unit',
    rationalePl:
      'Całkowicie zbędna po jasnej stronie Księżyca (temperatura gruntu sięga ponad 100°C); miałaby sens wyłącznie w strefie cienia.',
    rationaleEn: 'Not needed unless on the dark side.',
  },
  {
    itemId: 'magnetic_compass',
    officialRank: 14,
    namePl: 'Kompas magnetyczny',
    nameEn: 'Magnetic compass',
    rationalePl:
      'Pole magnetyczne Księżyca nie posiada biegunowości dipolowej – kompas magnetyczny jest bezwartościowy.',
    rationaleEn: "The magnetic field on the moon is not polarized, so it's worthless for navigation.",
  },
  {
    itemId: 'matches',
    officialRank: 15,
    namePl: 'Pudełko zapałek',
    nameEn: 'Box of matches',
    rationalePl:
      'Bezwartościowe – brak tlenu w próżni księżycowej uniemożliwia zapłon i podtrzymanie jakiegokolwiek płomienia.',
    rationaleEn: "Virtually worthless – there's no oxygen on the moon to sustain combustion.",
  },
];

export function getExpertRationale(
  scenarioId: 'lost_at_sea' | 'moon',
  itemId: string
): ExpertRationaleDef | undefined {
  const list = scenarioId === 'moon' ? NASA_MOON_EXPERT_RATIONALES : LOST_AT_SEA_EXPERT_RATIONALES;
  return list.find((item) => item.itemId === itemId);
}
