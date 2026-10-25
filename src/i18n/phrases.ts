import type { Language } from "./types.ts"

/** Finnish for exact English sentences stored in the facility data. */
export const fiPhrases: Record<string, string> = {
  "Fictional demonstration slot for this search. It is not a booking and it was not read from Timmi.":
    "Keksitty esimerkkivuoro tätä hakua varten. Se ei ole varaus, eikä sitä ole luettu Timmistä.",
  "The city page says this season has ended, so FastMove does not generate demo sessions that would look open.":
    "Kaupungin sivu kertoo kauden päättyneen, joten FastMove ei luo esimerkkivuoroja, jotka näyttäisivät avoimilta.",
  "Session times are not loaded, so FastMove does not invent a free session.":
    "Vuoroaikoja ei ole ladattu, joten FastMove ei keksi vapaata vuoroa.",
  "No sport is confirmed for this place, so a compatible demo schedule cannot be generated.":
    "Paikalle ei ole vahvistettu lajia, joten yhteensopivaa esimerkkiaikataulua ei voi luoda.",
  "Enter both times as hours and minutes.": "Anna molemmat ajat tunteina ja minuutteina.",
  "Available until must be later than available from on the same day.":
    "Loppuajan on oltava saman päivän aloitusaikaa myöhemmin.",
  "The minimum workout cannot be longer than the maximum outing.":
    "Treenin vähimmäiskesto ei voi olla pidempi kuin käynnin enimmäiskesto.",
  "The minimum workout is longer than the time you are available.":
    "Treenin vähimmäiskesto on pidempi kuin aika, jonka olet vapaa.",
  "Liikkuva Tampere ticket": "Liikkuva Tampere -lippu",
  "Not covered by this ticket": "Ei kuulu tähän lippuun",
  "Demonstration examples": "Esimerkkiaikatauluja",
  "Example windows are not opening hours and have not been checked in Timmi.":
    "Esimerkkiajat eivät ole aukioloaikoja, eikä niitä ole tarkistettu Timmistä.",
  "LIPAS point for the ball hall at Lindforsinkatu 5 (lipas-id 80465). Other rooms have their own points. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste Lindforsinkatu 5:n palloilusalille (lipas-id 80465). Muilla tiloilla on omat pisteensä. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "The facility belongs to the Liikkuva Tampere programme on the Finnish city page. Open slots are not listed there.":
    "Paikka kuuluu Liikkuva Tampere -ohjelmaan kaupungin suomenkielisellä sivulla. Vapaita vuoroja ei ole lueteltu siellä.",
  "City of Tampere — Liikkuva Tampere ticket": "Tampereen kaupunki — Liikkuva Tampere -lippu",
  "15 October 2026": "15.10.2026",
  "Pietilä hall is equipped for basketball, volleyball, futsal, badminton and pickleball, but the ticket page does not name Pietilä. Reima, Birgitta, Desiree and Eila are on the ticket without a named sport, so they are not matched.":
    "Pietilän salissa voi harrastaa koripalloa, lentopalloa, futsalia, sulkapalloa ja pickleballia, mutta lippusivu ei mainitse Pietilää. Reima, Birgitta, Desiree ja Eila ovat lipulla ilman nimettyä lajia, joten niitä ei yhdistetä.",
  "Hilkka gym": "Hilkka-kuntosali",
  "The Liikkuva Tampere ticket page lists Hilkka gym.":
    "Liikkuva Tampere -lipun sivu luettelee Hilkka-kuntosalin.",
  "Functional training gym": "Toiminnallisen harjoittelun kuntosali",
  "The Liikkuva Tampere ticket page lists a functional training gym at Hervanta.":
    "Liikkuva Tampere -lipun sivu luettelee toiminnallisen harjoittelun kuntosalin Hervannassa.",
  "Tauno martial arts hall and Pertsa tatami hall": "Tauno-kamppailusali ja Pertsa-tatamisali",
  "The ticket page lists Tauno martial arts hall and Pertsa tatami hall. The link opens Tauno. Pertsa has no guest link on that page.":
    "Lippusivu luettelee Tauno-kamppailusalin ja Pertsa-tatamisalin. Linkki avaa Taunon. Pertsalla ei ole vierailijalinkkiä sillä sivulla.",
  "Manually written example for this demo. It is not current availability and it was not read from Timmi.":
    "Käsin kirjoitettu esimerkki tätä demoa varten. Se ei ole nykyinen saatavuus, eikä sitä ole luettu Timmistä.",
  "FastMove demonstration timetable": "FastMoven esimerkkiaikataulu",
  "LIPAS point for the ball hall at Käätykatu 8 (lipas-id 79792). The gym has a separate nearby point. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste Käätykatu 8:n palloilusalille (lipas-id 79792). Kuntosalilla on erillinen lähellä oleva piste. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "Lower gym": "Alakerran kuntosali",
  "The Liikkuva Tampere ticket page lists the lower and upper gyms at Kaukajärvi.":
    "Liikkuva Tampere -lipun sivu luettelee Kaukajärven ala- ja yläkerran kuntosalit.",
  "Ball sports hall": "Palloilusali",
  "The City of Tampere says the Kaukajärvi ball hall suits basketball.":
    "Tampereen kaupunki kertoo, että Kaukajärven palloilusali sopii koripalloon.",
  "The City of Tampere says the Kaukajärvi ball hall suits volleyball.":
    "Tampereen kaupunki kertoo, että Kaukajärven palloilusali sopii lentopalloon.",
  "LIPAS point for the gym at Näsijärvenkatu 8 (lipas-id 78126). Table tennis and the other rooms have their own nearby points. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste Näsijärvenkatu 8:n kuntosalille (lipas-id 78126). Pöytätenniksellä ja muilla tiloilla on omat lähellä olevat pisteensä. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "The ticket also lists a sports hall. The city page does not name basketball, volleyball or badminton for that hall, so it is not matched.":
    "Lippu luettelee myös liikuntasalin. Kaupungin sivu ei nimeä sille koripalloa, lentopalloa tai sulkapalloa, joten sitä ei yhdistetä.",
  Gym: "Kuntosali",
  "The Liikkuva Tampere ticket page lists a gym at Nääshalli.":
    "Liikkuva Tampere -lipun sivu luettelee kuntosalin Nääshallissa.",
  "The Liikkuva Tampere ticket page lists a functional training gym at Nääshalli.":
    "Liikkuva Tampere -lipun sivu luettelee toiminnallisen harjoittelun kuntosalin Nääshallissa.",
  "Table tennis": "Pöytätennis",
  "The City of Tampere lists table tennis practice and competition space at Nääshalli.":
    "Tampereen kaupunki luettelee Nääshallissa tilan pöytätenniksen harjoitteluun ja kilpailuun.",
  "Aikido hall and budo halls 2–6": "Aikidosali ja budosalit 2–6",
  "The ticket page lists an aikido hall and budo halls 2–6. The link opens the aikido hall. The budo halls have no guest links on that page.":
    "Lippusivu luettelee aikidosalin ja budosalit 2–6. Linkki avaa aikidosalin. Budosaleilla ei ole vierailijalinkkejä sillä sivulla.",
  "LIPAS point for the gym at Tampere Stadium (lipas-id 78224), not the outdoor pitch. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste Tampereen stadionin kuntosalille (lipas-id 78224), ei ulkokentälle. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "The Liikkuva Tampere ticket page lists this gym. The stadium page says the gym is intended for clubs and communities, and points individual visitors to other city gyms.":
    "Liikkuva Tampere -lipun sivu luettelee tämän kuntosalin. Stadionin sivu kertoo kuntosalin olevan seuroille ja yhteisöille ja ohjaa yksittäiset kävijät kaupungin muihin kuntosaleihin.",
  "Sports hall 1": "Liikuntasali 1",
  "The stadium page lists floorball goals in sports hall 1. Halls 1, 2 and 3 are on the ticket page.":
    "Stadionin sivu luettelee salibandymaalit liikuntasalissa 1. Salit 1, 2 ja 3 ovat lippusivulla.",
  "Sports halls 1–3": "Liikuntasalit 1–3",
  "The stadium page groups halls 1–3 under team gymnastics and sports halls. The apparatus hall is a different room and is not on the ticket list. The ticket page does not give these halls one shared guest link.":
    "Stadionin sivu ryhmittelee salit 1–3 joukkuevoimistelun ja liikuntasalien alle. Telinevoimistelusali on eri tila, eikä se ole lipun listalla. Lippusivu ei anna näille saleille yhtä yhteistä vierailijalinkkiä.",
  "LIPAS point for Tesoman jäähalli 1 at Tuomarinkatu 7 (lipas-id 529628). The ticket covers the gym at this address. LIPAS does not publish a separate gym point here, so the pin is the ice hall, not a surveyed gym door.":
    "LIPAS-piste Tesoman jäähalli 1:lle osoitteessa Tuomarinkatu 7 (lipas-id 529628). Lippu kattaa kuntosalin tässä osoitteessa. LIPAS ei julkaise erillistä kuntosalipistettä, joten neula on jäähalli, ei mitattu kuntosalin ovi.",
  "The city ice-hall page says free public skating is offered at Tesoma Ice Hall in autumn and spring, generally from mid-August to the end of March, and that those sessions are stick-free unless stated otherwise. That skating is not the gym on the Liikkuva ticket, and this hall is not matched as ice hockey or figure skating. Tesoma ice hall 2 shifts are allocated by Sentteri Tampere Oy and are not matched either. FastMove does not know whether a session is on the ice today.":
    "Kaupungin jäähallisivu kertoo, että Tesoman jäähallissa on yleistä luistelua syksyllä ja keväällä, yleensä elokuun puolivälistä maaliskuun loppuun, ja että vuorot ovat ilman mailoja, ellei toisin sanota. Se luistelu ei ole Liikkuva-lipun kuntosali, eikä tätä hallia yhdistetä jääkiekkoon tai taitoluisteluun. Tesoman jäähalli 2:n vuoroja jakaa Sentteri Tampere Oy, eikä niitäkään yhdistetä. FastMove ei tiedä, onko jäällä vuoroa tänään.",
  "The Liikkuva Tampere ticket page lists the gym at Tesoma Ice Stadium. The ticket does not cover the ice.":
    "Liikkuva Tampere -lipun sivu luettelee Tesoman jäähallin kuntosalin. Lippu ei kata jäätä.",
  "LIPAS point for Tesoman palloiluhalli (lipas-id 522571). The gym point is a few metres away. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste Tesoman palloiluhallille (lipas-id 522571). Kuntosalin piste on muutaman metrin päässä. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "The Liikkuva Tampere ticket page lists a gym at Tesoma Sports Hall.":
    "Liikkuva Tampere -lipun sivu luettelee kuntosalin Tesoman palloiluhallissa.",
  "Ball games hall courts 1–3": "Palloiluhallin kentät 1–3",
  "The City of Tampere says Tesoma Sports Hall suits basketball. The ticket covers courts 1–3 and does not link a separate Timmi room for them.":
    "Tampereen kaupunki kertoo, että Tesoman palloiluhalli sopii koripalloon. Lippu kattaa kentät 1–3, eikä niille ole erillistä Timmi-tilaa.",
  "The City of Tampere says Tesoma Sports Hall suits futsal. The ticket covers courts 1–3 and does not link a separate Timmi room for them.":
    "Tampereen kaupunki kertoo, että Tesoman palloiluhalli sopii futsaliin. Lippu kattaa kentät 1–3, eikä niille ole erillistä Timmi-tilaa.",
  "The City of Tampere says Tesoma Sports Hall suits floorball. The ticket covers courts 1–3 and does not link a separate Timmi room for them.":
    "Tampereen kaupunki kertoo, että Tesoman palloiluhalli sopii salibandyyn. Lippu kattaa kentät 1–3, eikä niille ole erillistä Timmi-tilaa.",
  "LIPAS sports-hall point for Kauppi Sports Center (lipas-id 605616). It is not the Well Gym record in the same building. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-liikuntasalipiste Kaupin liikuntakeskukselle (lipas-id 605616). Se ei ole saman rakennuksen Well Gym -tietue. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "The ticket covers ball-hall courts 1–3. It does not name the sport or link a Timmi room, and no city page confirming a sport for these courts was found, so they are not matched.":
    "Lippu kattaa palloilusalin kentät 1–3. Se ei nimeä lajia eikä linkitä Timmi-tilaa, eikä lajia vahvistavaa kaupungin sivua löytynyt, joten niitä ei yhdistetä.",
  "LIPAS point for B-hall (lipas-id 88985). Hall A has a separate point. The LIPAS event-date on this record is 8 September 2017. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste B-hallille (lipas-id 88985). Hallilla A on erillinen piste. Tämän tietueen LIPAS-tapahtumapäivä on 8.9.2017. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "LIPAS point for B-hall (lipas-id 88985). The LIPAS event-date on this record is 8 September 2017. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste B-hallille (lipas-id 88985). Tämän tietueen LIPAS-tapahtumapäivä on 8.9.2017. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "LIPAS point for A-hall (lipas-id 89037). Hall B has its own point. The LIPAS event-date on this record is 15 September 2017. This does not confirm ticket eligibility or a surveyed entrance.":
    "LIPAS-piste A-hallille (lipas-id 89037). Hallilla B on oma pisteensä. Tämän tietueen LIPAS-tapahtumapäivä on 15.9.2017. Tämä ei vahvista lipun kelpoisuutta eikä mitattua sisäänkäyntiä.",
  "The city page says hall A is a football and athletics training hall. The ticket covers hall A during the sports season. Hall B is described as an athletics hall, so it is not matched for football. The ticket page does not link a Timmi room.":
    "Kaupungin sivu kertoo, että hall A on jalkapallon ja yleisurheilun harjoitushalli. Lippu kattaa hallin A liikuntakauden aikana. Hall B kuvataan yleisurheiluhalliksi, joten sitä ei yhdistetä jalkapalloon. Lippusivu ei linkitä Timmi-tilaa.",
  "Hall B is on the ticket and is described as an athletics practice hall. Futsal and floorball courts are in D-hall, and another football field is in C-hall. C and D are not on the ticket list.":
    "Hall B on lipulla, ja sitä kuvataan yleisurheilun harjoitushalliksi. Futsal- ja salibandykentät ovat D-hallissa, ja toinen jalkapallokenttä on C-hallissa. C ja D eivät ole lipun listalla.",
  "Hall A": "Hall A",
  "The city page says hall A is a football and athletics training hall. The ticket covers hall A during the sports season. Hall B is described as an athletics hall, so it is not matched for football. The map pin is the LIPAS point for hall B. The ticket page does not link a Timmi room.":
    "Kaupungin sivu kertoo, että hall A on jalkapallon ja yleisurheilun harjoitushalli. Lippu kattaa hallin A liikuntakauden aikana. Hall B kuvataan yleisurheiluhalliksi, joten sitä ei yhdistetä jalkapalloon. Karttaneula on LIPAS-piste hallille B. Lippusivu ei linkitä Timmi-tilaa.",
  "Schedule not loaded": "Aikataulua ei ole ladattu",
  "Opening hours are published on the Tampere Swimming Centre page. FastMove does not copy them and does not know which lanes are free.":
    "Aukioloajat on julkaistu Tampereen uintikeskuksen sivulla. FastMove ei kopioi niitä eikä tiedä, mitkä radat ovat vapaita.",
  "LIPAS public indoor swimming pool (type 3110, lipas-id 505972) at Joukahaisenkatu 7A. The LIPAS event-date is 12 September 2024. This is not a surveyed door and not a live lane status.":
    "LIPAS-uimahalli (tyyppi 3110, lipas-id 505972) osoitteessa Joukahaisenkatu 7A. LIPAS-tapahtumapäivä on 12.9.2024. Tämä ei ole mitattu ovi eikä reaaliaikainen ratatieto.",
  "Indoor swimming centre on the city swimming-hall page. Not part of the Liikkuva Tampere ticket list used for the halls.":
    "Uintikeskus kaupungin uimahallisivulla. Ei kuulu Liikkuva Tampere -lipun hallilistaan.",
  "City of Tampere — swimming halls and outdoor pool": "Tampereen kaupunki — uimahallit ja maauimala",
  "17 September 2026": "17.9.2026",
  "The city page says there are disc-parking spaces in front of this hall. FastMove does not check whether a space is free.":
    "Kaupungin sivu kertoo, että hallin edessä on kiekkopysäköintipaikkoja. FastMove ei tarkista, onko paikka vapaa.",
  "Indoor swimming pools": "Sisäuima-altaat",
  "The city page describes an 8-lane 50 m pool that can be split, a teaching pool, a paddling pool and a cold pool. The LIPAS record also describes a 6-lane 25 m training pool and a diving pool in the extension. Free lanes are not loaded.":
    "Kaupungin sivu kuvaa jaettavan 8-rataisen 50 m altaan, opetusaltaan, kahluualtaan ja kylmäaltaan. LIPAS-tietue kuvaa myös laajennuksen 6-rataisen 25 m harjoitusaltaan ja hyppyaltaan. Vapaita ratoja ei ole ladattu.",
  "Opening hours are published on the Tesoma Swimming Hall page. FastMove does not copy them and does not know which lanes are free.":
    "Aukioloajat on julkaistu Tesoman uimahallin sivulla. FastMove ei kopioi niitä eikä tiedä, mitkä radat ovat vapaita.",
  "LIPAS public indoor swimming pool (type 3110, lipas-id 505980). Same street as Tesoma Ice Hall, different LIPAS point and a different building use. The event-date is 12 September 2024. Not a live lane status.":
    "LIPAS-uimahalli (tyyppi 3110, lipas-id 505980). Sama katu kuin Tesoman jäähallilla, eri LIPAS-piste ja eri käyttö. Tapahtumapäivä on 12.9.2024. Ei reaaliaikainen ratatieto.",
  "Indoor swimming hall on the city page. Not the Tesoma ice hall and not a Liikkuva Tampere ticket room.":
    "Uimahalli kaupungin sivulla. Ei Tesoman jäähalli eikä Liikkuva Tampere -lipun tila.",
  "26 August 2026": "26.8.2026",
  "The city page also describes a gym at the swimming hall. It is not matched as a Liikkuva Tampere gym.":
    "Kaupungin sivu kuvaa myös kuntosalin uimahallissa. Sitä ei yhdistetä Liikkuva Tampere -kuntosaliksi.",
  "The city page describes a 6-lane 25 m pool, a children's pool, a spa pool, a cold pool and a diving pool with a 3 m platform and a 1 m springboard. This is the swimming hall, not the ice hall at the same street address.":
    "Kaupungin sivu kuvaa 6-rataisen 25 m altaan, lastenaltaan, porealtaan, kylmäaltaan ja hyppyaltaan, jossa on 3 metrin taso ja 1 metrin ponnahduslauta. Tämä on uimahalli, ei samassa osoitteessa oleva jäähalli.",
  "Opening hours are published on the Pyynikki Swimming Hall page, which was updated 17 July 2026. FastMove does not copy them.":
    "Aukioloajat on julkaistu Pyynikin uimahallin sivulla, jota päivitettiin 17.7.2026. FastMove ei kopioi niitä.",
  "LIPAS public indoor swimming pool (type 3110, lipas-id 505947) at Kortelahdenkatu 26. The event-date is 12 September 2024. Not a live lane status.":
    "LIPAS-uimahalli (tyyppi 3110, lipas-id 505947) osoitteessa Kortelahdenkatu 26. Tapahtumapäivä on 12.9.2024. Ei reaaliaikainen ratatieto.",
  "Indoor swimming hall on the city page. Not a Liikkuva Tampere ticket room.":
    "Uimahalli kaupungin sivulla. Ei Liikkuva Tampere -lipun tila.",
  "17 July 2026": "17.7.2026",
  "The city page describes a 25 m pool with 6 lanes, a convertible pool, a paddling pool, a spa pool and a cold pool. Free lanes are not loaded.":
    "Kaupungin sivu kuvaa 25 m altaan, jossa on 6 rataa, muunnettavan altaan, kahluualtaan, porealtaan ja kylmäaltaan. Vapaita ratoja ei ole ladattu.",
  "Opening hours are published on the Hervanta Swimming Hall page. FastMove does not copy them and does not know which lanes are free.":
    "Aukioloajat on julkaistu Hervannan uimahallin sivulla. FastMove ei kopioi niitä eikä tiedä, mitkä radat ovat vapaita.",
  "LIPAS public indoor swimming pool (type 3110, lipas-id 505804) at Torisevanraitti 7. The event-date is 12 September 2024. Not a live lane status.":
    "LIPAS-uimahalli (tyyppi 3110, lipas-id 505804) osoitteessa Torisevanraitti 7. Tapahtumapäivä on 12.9.2024. Ei reaaliaikainen ratatieto.",
  "Indoor swimming hall on the city page. Not the Hervanta leisure centre on the Liikkuva Tampere ticket.":
    "Uimahalli kaupungin sivulla. Ei Hervannan vapaa-aikakeskus Liikkuva Tampere -lipulla.",
  "9 October 2026": "9.10.2026",
  "The city page also describes a gym at this hall. It is not matched as a Liikkuva Tampere gym.":
    "Kaupungin sivu kuvaa myös kuntosalin tässä hallissa. Sitä ei yhdistetä Liikkuva Tampere -kuntosaliksi.",
  "The city page describes a 6-lane 25 m pool and a children's pool, including a lane used for water running. This is a swimming hall, not the Hervanta leisure centre.":
    "Kaupungin sivu kuvaa 6-rataisen 25 m altaan ja lastenaltaan, mukaan lukien vesijuoksuradan. Tämä on uimahalli, ei Hervannan vapaa-aikakeskus.",
  "Season ended on the city page": "Kausi on päättynyt kaupungin sivulla",
  "Tampere Outdoor Pool is a swimming place, but the city page updated 21 October 2026 says the 2026 season has ended. It is not shown as available. Check that page before a later visit.":
    "Tampereen maauimala on uintipaikka, mutta kaupungin sivu, jota päivitettiin 21.10.2026, kertoo vuoden 2026 kauden päättyneen. Sitä ei näytetä saatavilla olevana. Tarkista sivu ennen myöhempää käyntiä.",
  "LIPAS open-air pool (type 3210, lipas-id 602802) at Joukahaisenkatu 7 B, behind the swimming centre. The event-date is 6 June 2024. Not a live open status.":
    "LIPAS-maauimala (tyyppi 3210, lipas-id 602802) osoitteessa Joukahaisenkatu 7 B, uintikeskuksen takana. Tapahtumapäivä on 6.6.2024. Ei reaaliaikainen aukiolotieto.",
  "Outdoor pool on the city page. The same page says the 2026 season has ended.":
    "Maauimala kaupungin sivulla. Samalla sivulla kerrotaan, että vuoden 2026 kausi on päättynyt.",
  "21 October 2026": "21.10.2026",
  "Outdoor pools": "Ulkoaltaat",
  "The city page describes a 50 m pool, a children's pool, a paddling pool and a diving pool behind the swimming centre. It is an outdoor pool, not an indoor swimming hall.":
    "Kaupungin sivu kuvaa 50 m altaan, lastenaltaan, kahluualtaan ja hyppyaltaan uintikeskuksen takana. Se on maauimala, ei uimahalli.",
  "The city ice-hall page publishes opening hours for this hall. FastMove does not copy them and does not know whether the ice is free.":
    "Kaupungin jäähallisivu julkaisee tämän hallin aukioloajat. FastMove ei kopioi niitä eikä tiedä, onko jää vapaa.",
  "LIPAS competition ice arena (type 2520, lipas-id 89868) for Tampereen jäähalli. The event-date is 6 June 2024. Not a live ice status. The practice halls have their own points.":
    "LIPAS-kilpajäähalli (tyyppi 2520, lipas-id 89868) Tampereen jäähallille. Tapahtumapäivä on 6.6.2024. Ei reaaliaikainen jäätieto. Harjoitushalleilla on omat pisteensä.",
  "Ice hall on the city ice-hall page. Not a Liikkuva Tampere ticket room. Not matched as figure skating or public skating.":
    "Jäähalli kaupungin jäähallisivulla. Ei Liikkuva Tampere -lipun tila. Ei yhdistetä taitoluisteluun tai yleiseen luisteluun.",
  "City of Tampere — ice halls": "Tampereen kaupunki — jäähallit",
  "Figure skating is described for the practice hall at the same address, not for this hall. Hakametsä practice hall 3 shifts are allocated by Sentteri Tampere Oy and are not matched.":
    "Taitoluistelu kuvataan samassa osoitteessa olevalle harjoitushallille, ei tälle hallille. Hakametsän harjoitushalli 3:n vuoroja jakaa Sentteri Tampere Oy, eikä niitä yhdistetä.",
  "Tampere Ice Hall": "Tampereen jäähalli",
  "The city page describes Tampere Ice Hall, also called Hakametsä, as the country's first ice hall, built for the 1965 ice-hockey world championships. Private individuals are not granted booking shifts. Public skating is not listed for this hall.":
    "Kaupungin sivu kuvaa Tampereen jäähallin, jota kutsutaan myös Hakametsäksi, maan ensimmäiseksi jäähalliksi. Se rakennettiin vuoden 1965 jääkiekon maailmanmestaruuskilpailuihin. Yksityishenkilöille ei myönnetä vuoroja. Yleistä luistelua ei ole lueteltu tälle hallille.",
  "Session times for this practice hall are not loaded. The city page says private individuals are not granted booking shifts at the ice halls.":
    "Tämän harjoitushallin vuoroaikoja ei ole ladattu. Kaupungin sivu kertoo, että yksityishenkilöille ei myönnetä vuoroja jäähalleissa.",
  "LIPAS competition ice arena (type 2520, lipas-id 89874) for the practice hall. The event-date is 6 June 2024. Not a live ice status. This is not the main Hakametsä hall point.":
    "LIPAS-kilpajäähalli (tyyppi 2520, lipas-id 89874) harjoitushallille. Tapahtumapäivä on 6.6.2024. Ei reaaliaikainen jäätieto. Tämä ei ole Hakametsän päähallin piste.",
  "Practice ice hall on the city page, described for figure skaters and juniors. Not matched as hockey.":
    "Harjoitusjäähalli kaupungin sivulla, kuvattu taitoluistelijoille ja junioreille. Ei yhdistetä jääkiekkoon.",
  "Practice ice hall": "Harjoitusjäähalli",
  "The city page says this practice hall, at the same address as Tampere Ice Hall, is especially for figure skaters and juniors, and is also used by students and the sports academy. It is not matched as ice hockey or as public skating.":
    "Kaupungin sivu kertoo, että tämä harjoitushalli Tampereen jäähallin osoitteessa on erityisesti taitoluistelijoille ja junioreille, ja että sitä käyttävät myös opiskelijat ja urheiluakatemia. Sitä ei yhdistetä jääkiekkoon tai yleiseen luisteluun.",
  "The city page says free public skating here is generally from mid-August to the end of March, and stick-free unless stated otherwise. FastMove does not load the session clock and does not know if one is on today.":
    "Kaupungin sivu kertoo, että yleinen luistelu on täällä yleensä elokuun puolivälistä maaliskuun loppuun ja ilman mailoja, ellei toisin sanota. FastMove ei lataa vuoroaikoja eikä tiedä, onko vuoro tänään.",
  "LIPAS training ice arena (type 2510, lipas-id 89881) at Ruovedenkatu 1. The event-date is 6 June 2024. Not a live ice status.":
    "LIPAS-harjoitusjäähalli (tyyppi 2510, lipas-id 89881) osoitteessa Ruovedenkatu 1. Tapahtumapäivä on 6.6.2024. Ei reaaliaikainen jäätieto.",
  "Ice hall on the city page with two hockey rinks and figure-skating use. Public skating sessions are not loaded.":
    "Jäähalli kaupungin sivulla, jossa on kaksi kiekkokaukaloa ja taitoluistelukäyttöä. Yleisen luistelun vuoroja ei ole ladattu.",
  "Free public skating in autumn and spring is documented for this hall. It is stick-free unless the city says otherwise, so it is not shown as hockey or figure skating.":
    "Yleinen luistelu syksyllä ja keväällä on dokumentoitu tähän halliin. Se on ilman mailoja, ellei kaupunki toisin sano, joten sitä ei näytetä jääkiekkona tai taitoluisteluna.",
  "Two hockey rinks": "Kaksi kiekkokaukaloa",
  "The city page says Hervanta Ice Hall has two hockey rinks, also used by juniors, schools, daycare and companies. Free public skating at this hall is a separate stick-free session and is not matched as hockey.":
    "Kaupungin sivu kertoo, että Hervannan jäähallissa on kaksi kiekkokaukaloa, joita käyttävät myös juniorit, koulut, päiväkodit ja yritykset. Yleinen luistelu tässä hallissa on erillinen mailaton vuoro, eikä sitä yhdistetä jääkiekkoon.",
  "Figure skating at Hervanta Ice Hall": "Taitoluistelu Hervannan jäähallissa",
  "The city page says figure skaters use Hervanta Ice Hall. That is not a confirmed public figure-skating session. Stick-free public skating is a separate use and is not matched as figure skating.":
    "Kaupungin sivu kertoo, että taitoluistelijat käyttävät Hervannan jäähallia. Se ei ole vahvistettu yleinen taitoluisteluvuoro. Mailaton yleinen luistelu on eri käyttö, eikä sitä yhdistetä taitoluisteluun.",
  "Seasonal — check current conditions": "Kausiluonteinen — tarkista tilanne",
  "Seasonal — check current conditions. The city skating page says park fields are usable when they are lit in the evening and links a freezing-status view. FastMove does not know the weather or whether this field is frozen.":
    "Kausiluonteinen — tarkista tilanne. Kaupungin luistelusivu kertoo, että puistokenttiä voi käyttää, kun ne on valaistu illalla, ja linkittää jäätymistilanteen. FastMove ei tiedä säätä eikä sitä, onko tämä kenttä jäässä.",
  "LIPAS ice-skating field (type 1520, lipas-id 515039). The event-date is 28 February 2023. Not a confirmation that the ice is frozen today.":
    "LIPAS-luistelukenttä (tyyppi 1520, lipas-id 515039). Tapahtumapäivä on 28.2.2023. Ei vahvistus siitä, että jää on jäässä tänään.",
  "Named outdoor skating field on the city page. Not an indoor ice hall and not confirmed open today.":
    "Nimetty ulkoluistelukenttä kaupungin sivulla. Ei jäähalli, eikä tänään aukioloa ole vahvistettu.",
  "City of Tampere — skating fields and artificial ice": "Tampereen kaupunki — luistelukentät ja tekojäät",
  "25 May 2026": "25.5.2026",
  "Stick-free outdoor skating": "Ulkoluistelu ilman mailoja",
  "The city page says a skating field is frozen at Pyynikki sports field in winter for people without sticks, daily 8:00–21:30 except during events. Those hours describe the field when it is frozen. They are not today's ice condition.":
    "Kaupungin sivu kertoo, että Pyynikin liikuntakentälle jäädytetään talvella luistelukenttä mailattomille, päivittäin klo 8.00–21.30 lukuun ottamatta tapahtumia. Ne ajat kuvaavat kenttää, kun se on jäässä. Ne eivät ole tämän päivän jäätieto.",
  "Seasonal — check current conditions. Session times are not loaded. FastMove does not know whether the ice is open today.":
    "Kausiluonteinen — tarkista tilanne. Vuoroaikoja ei ole ladattu. FastMove ei tiedä, onko jää auki tänään.",
  "LIPAS mechanically frozen open-air ice rink (type 1510, lipas-id 608153). The event-date is 26 June 2024. Not a live ice status. A separate enclosure is not this point.":
    "LIPAS-tekojää (tyyppi 1510, lipas-id 608153). Tapahtumapäivä on 26.6.2024. Ei reaaliaikainen jäätieto. Erillinen kaukalo ei ole tämä piste.",
  "Named artificial outdoor rink on the city skating page. Not confirmed open today.":
    "Nimetty ulkotekojää kaupungin luistelusivulla. Tänään aukioloa ei ole vahvistettu.",
  "Public outdoor skating": "Yleinen ulkoluistelu",
  "The city page says the Sorsapuisto artificial rink and its enclosure, opened in November 2020, both have public skating sessions for everyone. This pin is the LIPAS rink, not the enclosure.":
    "Kaupungin sivu kertoo, että Sorsapuiston tekojäällä ja sen kaukalolla, joka avattiin marraskuussa 2020, on yleisiä luisteluvuoroja kaikille. Tämä neula on LIPAS-rata, ei kaukalo.",
  "Seasonal — check current conditions. FastMove does not know whether the November-to-March season is underway or whether the ice is skateable today.":
    "Kausiluonteinen — tarkista tilanne. FastMove ei tiedä, onko marras–maaliskuun kausi käynnissä tai voiko jäällä luistella tänään.",
  "LIPAS mechanically frozen rink (type 1510, lipas-id 76240), the first Koulukatu enclosure. The event-date is 17 September 2025. A second enclosure, lipas-id 510210, is not this pin. Not a live ice status.":
    "LIPAS-tekojää (tyyppi 1510, lipas-id 76240), Koulukadun ensimmäinen kaukalo. Tapahtumapäivä on 17.9.2025. Toinen kaukalo, lipas-id 510210, ei ole tämä neula. Ei reaaliaikainen jäätieto.",
  "Named artificial outdoor ice on the city page. Not confirmed open today.":
    "Nimetty ulkotekojää kaupungin sivulla. Tänään aukioloa ei ole vahvistettu.",
  "Public skating with and without sticks": "Yleinen luistelu mailoilla ja ilman",
  "The city page says Koulukatu artificial ice is used for ice sports from November to March, with public skating for people with sticks and without sticks. November to March is the published season, not a date this ice is open.":
    "Kaupungin sivu kertoo, että Koulukadun tekojäätä käytetään jääurheiluun marraskuusta maaliskuuhun, ja että yleinen luistelu on mailallisille ja mailattomille. Marras–maaliskuu on julkaistu kausi, ei päivä, jona tämä jää on auki.",
  "Seasonal — check current conditions. FastMove does not know whether this rink is frozen or open today.":
    "Kausiluonteinen — tarkista tilanne. FastMove ei tiedä, onko tämä rata jäässä tai auki tänään.",
  "LIPAS mechanically frozen rink (type 1510, lipas-id 612918). The event-date is 26 June 2024. The stick-game rink is a different point. Not a live ice status.":
    "LIPAS-tekojää (tyyppi 1510, lipas-id 612918). Tapahtumapäivä on 26.6.2024. Mailapelirata on eri piste. Ei reaaliaikainen jäätieto.",
  "Stick-free public artificial rink named on the city skating page. Not confirmed open today.":
    "Mailaton yleinen tekojää, joka on nimetty kaupungin luistelusivulla. Tänään aukioloa ei ole vahvistettu.",
  "Stick-free public skating": "Mailaton yleinen luistelu",
  "The city page says the newest artificial ice at Ahvenisjärvi sports park is only for free public skating. The stick-game rink on the same site is listed separately and is not this pin.":
    "Kaupungin sivu kertoo, että Ahvenisjärven liikuntapuiston uusin tekojää on vain yleiseen luisteluun. Samalla alueella oleva mailapelirata on lueteltu erikseen, eikä se ole tämä neula.",
  "Seasonal — check current conditions. FastMove does not know whether this stick rink is frozen or open today.":
    "Kausiluonteinen — tarkista tilanne. FastMove ei tiedä, onko tämä mailarata jäässä tai auki tänään.",
  "LIPAS mechanically frozen rink (type 1510, lipas-id 612919), the stick rink. The event-date is 26 June 2024. Not the stick-free public rink and not a live ice status.":
    "LIPAS-tekojää (tyyppi 1510, lipas-id 612919), mailarata. Tapahtumapäivä on 26.6.2024. Ei mailaton yleinen rata eikä reaaliaikainen jäätieto.",
  "Outdoor stick-game rink named on the city skating page. Not matched as ice hockey or figure skating, and not confirmed open today.":
    "Ulkomailapelirata kaupungin luistelusivulla. Ei yhdistetä jääkiekkoon tai taitoluisteluun, eikä tänään aukioloa ole vahvistettu.",
  "Stick-game rink": "Mailapelirata",
  "The city page says Ahvenisjärvi also has a rink only for stick games. It is an outdoor rink, not an ice-hockey arena and not a figure-skating session.":
    "Kaupungin sivu kertoo, että Ahvenisjärvellä on myös rata vain mailapeleille. Se on ulkorata, ei jääkiekkohalli eikä taitoluisteluvuoro.",
  "Seasonal — check current conditions. FastMove does not know whether this field is frozen today.":
    "Kausiluonteinen — tarkista tilanne. FastMove ei tiedä, onko tämä kenttä jäässä tänään.",
  "LIPAS mechanically frozen rink (type 1510, lipas-id 504350), the Lielahti field. The event-date is 25 August 2025. A separate enclosure, lipas-id 501605, is not this pin. Not a live ice status.":
    "LIPAS-tekojää (tyyppi 1510, lipas-id 504350), Lielahden kenttä. Tapahtumapäivä on 25.8.2025. Erillinen kaukalo, lipas-id 501605, ei ole tämä neula. Ei reaaliaikainen jäätieto.",
  "Named outdoor public skating ice on the city page. Not confirmed open today.":
    "Nimetty yleinen ulkoluistelujää kaupungin sivulla. Tänään aukioloa ei ole vahvistettu.",
  "Free public skating": "Yleinen luistelu",
  "The city page says the lower field at Lielahti sports park is frozen in winter as artificial ice for free public skating. This pin is that field, not the separate enclosure recorded at the same address.":
    "Kaupungin sivu kertoo, että Lielahden liikuntapuiston alakenttä jäädytetään talvella tekojäksi yleiseen luisteluun. Tämä neula on se kenttä, ei samassa osoitteessa oleva erillinen kaukalo.",
  "Reima, Birgitta, Desiree and Eila": "Reima, Birgitta, Desiree ja Eila",
  "On the ticket page without a named sport, so they are not matched.":
    "Lippusivulla ilman nimettyä lajia, joten niitä ei yhdistetä.",
  "Upper gym": "Yläkerran kuntosali",
  "The ticket page lists the lower and upper gyms. This dataset matches the lower gym only.":
    "Lippusivu luettelee ala- ja yläkerran kuntosalit. Tämä aineisto yhdistää vain alakerran kuntosalin.",
  "Sports hall": "Liikuntasali",
  "The ticket lists a sports hall. The city page does not name a sport for it, so it is not matched.":
    "Lippu luettelee liikuntasalin. Kaupungin sivu ei nimeä sille lajia, joten sitä ei yhdistetä.",
  "Courts 1–3": "Kentät 1–3",
  "The ticket covers these courts. It does not name the sport or link a Timmi room, so they are not matched.":
    "Lippu kattaa nämä kentät. Se ei nimeä lajia eikä linkitä Timmi-tilaa, joten niitä ei yhdistetä.",
  "Hall A coordinate": "Hall A:n koordinaatti",
  "Football is matched to hall A. The stored pin is the LIPAS point for hall B, not a confirmed hall A door.":
    "Jalkapallo on yhdistetty halliin A. Tallennettu neula on LIPAS-piste hallille B, ei vahvistettu hallin A ovi.",
  "Hall B": "Hall B",
  "Hall B is on the ticket and is described as an athletics practice hall. It is not matched to a sport.":
    "Hall B on lipulla, ja sitä kuvataan yleisurheilun harjoitushalliksi. Sitä ei ole yhdistetty lajiin.",
  "Hervanta campus": "Hervannan kampus",
  "Kampusareena at Tampere University, Hervanta campus.":
    "Kampusareena Tampereen yliopistossa, Hervannan kampuksella.",
  Keskustori: "Keskustori",
  "The central square.": "Keskustori.",
  "Tampere railway station": "Tampereen rautatieasema",
  "OpenStreetMap building for the railway station.": "OpenStreetMap-rakennus rautatieasemalle.",
  "Kaleva church": "Kalevan kirkko",
  "Kaleva church.": "Kalevan kirkko.",
  Tesoma: "Tesoma",
  "A point in the Tesoma district, not a specific door.":
    "Piste Tesoman alueella, ei tietty ovi.",
  "Named gyms on the Liikkuva Tampere ticket page.":
    "Liikkuva Tampere -lipun sivulla nimetyt kuntosalit.",
  "Functional training gyms named at Hervanta and Nääshalli.":
    "Hervannassa ja Nääshallissa nimetyt toiminnallisen harjoittelun kuntosalit.",
  "Ball halls the city says suit basketball and that the ticket includes.":
    "Palloilusalit, joiden kaupunki kertoo sopivan koripalloon ja jotka lippu sisältää.",
  "The Kaukajärvi ball hall, which the city says suits volleyball.":
    "Kaukajärven palloilusali, jonka kaupunki kertoo sopivan lentopalloon.",
  "Hervanta’s Pietilä hall is equipped for badminton, but the ticket page does not name Pietilä.":
    "Hervannan Pietilän sali on varustettu sulkapalloon, mutta lippusivu ei mainitse Pietilää.",
  "Table tennis space named at Nääshalli.": "Nääshallissa nimetty pöytätennistila.",
  "These sources do not name a tennis court in the programme.":
    "Nämä lähteet eivät nimeä tenniskenttää ohjelmassa.",
  "Tesoma Sports Hall, which the city names for floorball, and Stadium hall 1, which lists floorball goals.":
    "Tesoman palloiluhalli, jonka kaupunki nimeää salibandyyn, ja stadionin sali 1, jossa on salibandymaalit.",
  "Exhibition Centre hall A, described for football. The ticket covers hall A during the sports season.":
    "Messukeskuksen hall A, jota kuvataan jalkapalloon. Lippu kattaa hallin A liikuntakauden aikana.",
  "Tesoma Sports Hall, which the city names for futsal. Exhibition D-hall has futsal courts, but D-hall is not on the ticket list.":
    "Tesoman palloiluhalli, jonka kaupunki nimeää futsaliin. Messukeskuksen D-hallissa on futsal-kenttiä, mutta D-halli ei ole lipun listalla.",
  "Martial arts and tatami rooms named on the ticket page at Hervanta and Nääshalli.":
    "Lippusivulla Hervannassa ja Nääshallissa nimetyt kamppailu- ja tatamitilat.",
  "Stadium halls 1–3, published under the city’s team-gymnastics and sports-hall heading. The apparatus hall is not on the ticket.":
    "Stadionin salit 1–3, jotka on julkaistu kaupungin joukkuevoimistelun ja liikuntasalien otsikon alla. Telinevoimistelusali ei ole lipulla.",
  "Four indoor swimming halls on the City of Tampere swimming-hall pages. The outdoor pool is separate: the city page updated 21 October 2026 says its 2026 season has ended, so it is not recommended as available. Opening hours and free lanes are not copied here.":
    "Neljä uimahallia Tampereen kaupungin uimahallisivuilla. Maauimala on erillinen: kaupungin sivu, jota päivitettiin 21.10.2026, kertoo vuoden 2026 kauden päättyneen, joten sitä ei suositella saatavilla olevana. Aukioloaikoja ja vapaita ratoja ei ole kopioitu tähän.",
  "The Hakametsä practice hall, which the city says is especially for figure skaters, and Hervanta Ice Hall, where the city says figure skaters train. A hockey rink is not treated as figure skating. Session times are not loaded.":
    "Hakametsän harjoitushalli, jonka kaupunki kertoo olevan erityisesti taitoluistelijoille, ja Hervannan jäähalli, jossa kaupungin mukaan taitoluistelijat harjoittelevat. Kiekkokaukaloa ei käsitellä taitoluisteluna. Vuoroaikoja ei ole ladattu.",
  "Tampere Ice Hall at Hakametsä, and Hervanta Ice Hall, which the city says has two hockey rinks. Stick-free public skating is not matched as hockey. Session times are not loaded.":
    "Tampereen jäähalli Hakametsässä ja Hervannan jäähalli, jossa kaupungin mukaan on kaksi kiekkokaukaloa. Mailatonta yleistä luistelua ei yhdistetä jääkiekkoon. Vuoroaikoja ei ole ladattu.",
  "Named public outdoor sites on the city skating page. Every one is seasonal — check current conditions. FastMove does not list every park field, and it does not include the privately maintained lake routes.":
    "Kaupungin luistelusivulla nimetyt yleiset ulkokohteet. Jokainen on kausiluonteinen — tarkista tilanne. FastMove ei luettele jokaista puistokenttää eikä sisällä yksityisesti ylläpidettyjä järvireittejä.",
  "These sources do not name another indoor sport beyond the activities in this list.":
    "Nämä lähteet eivät nimeä muuta sisäliikuntaa tämän listan lajien lisäksi.",
}

export function phrase(language: Language, english: string): string {
  if (language === "en") return english
  return fiPhrases[english] ?? english
}
