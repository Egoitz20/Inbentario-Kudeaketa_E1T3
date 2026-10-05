# Proiektuaren Deskribapena

Informatika saileko ikasgeletako gailuak kudeatzeko diseinatutako web aplikazioa. Aplikazioak **CRUD (Create, Read, Update, Delete)** metodologia erabiliko du, eta horri esker erabiltzaileek ekipoak gehitu, ezabatu, eguneratu eta kontsultatu ahal izango dituzte.

## Rol-Kudeaketa Sistema

Aplikazioak rol-kudeaketa sistema bat izango du. Sistema horretan:

- **Erabiltzaile arruntek** dagozkien funtzionaltasunak erabiliko dituzte.
- **Administratzaileek** baimen osagarriak izango dituzte, besteak beste:
  - Erabiltzaile berriak sortzea.
  - Dauden erabiltzaileak ezabatzea.
  - Sistemaren administrazio-zereginak kudeatzea.

## Erabiliko diren Teknologiak

Proiektua honako teknologiekin garatuko da:

- **PHP**
- **JavaScript**
- **CSS**
- **HTML**

Datuen truke eta kudeaketa eraginkorra bermatzeko, batez ere **`fetch`** funtzioa eta **JSON** formatua erabiliko dira.

Bestalde, aplikazioaren datu-basea **MariaDB** sisteman oinarrituko da, informazioaren biltegiratze segurua eta egituratua bermatzeko.

## Helburua

Aplikazio honen helburua informatika saileko baliabideen kudeaketa zentralizatzea da, honako hauek ahalbidetuz:

- Gailuen kontrola erraztea.
- Mantentze-lanak optimizatzea.
- Erabiltzaileen administrazioa modu eraginkorrean gauzatzea.
- Baliabideen antolaketa eta jarraipena hobetzea.

## Proiektuaren Egitura

Aplikazioak egitura antolatu bat izango du, mantentze-lanak errazteko, eskalagarritasuna bermatzeko eta sistemaren geruza desberdinen arteko ardurak bereizteko.

```text
/
├── index.html
├── pages/
│   ├── js/
│   └── styles/
├── helpers/
├── db/
├── controllers/
└── class/

Direktorio eta Fitxategien Azalpena
index.html

Aplikazioaren hasierako orria izango da. Bertan erabiltzaileek sistemara sartzeko login edo autentifikazio pantaila aurkituko dute.

/pages

Inbentarioaren kudeaketarekin lotutako orrialde guztiak gordeko dituen direktorioa. Erabiltzaileek erabiliko dituzten pantaila nagusiak hemen kokatuko dira.

/pages/js

Pantaila bakoitzaren funtzionalitateak garatzeko erabiliko diren JavaScript fitxategiak gordeko dituen direktorioa. Orrialdeen portaera dinamikoa kudeatzeko erabiliko da.

/pages/styles

Aplikazioaren pantaila guztien CSS estilo-orriak gordeko dituen direktorioa. Erabiltzaile-interfazearen diseinua eta itxura hemendik kontrolatuko dira.

/helpers

PHPn eskuz garatutako funtzio lagungarriak edo erabilera komuneko funtzioak bilduko dituen direktorioa. Kodearen berrerabilgarritasuna eta mantentze-lanak errazteko erabiliko da.

/db

Datu-basearekin lotutako fitxategi guztiak gordeko dituen direktorioa. Horren barruan egongo dira:

Datu-basearen konexioa konfiguratzeko fitxategiak.
Kontsultak exekutatzeko metodoak.
Datuen sarrera, eguneraketa, ezabaketa eta kontsulta egiteko eragiketak.
/controllers

Aplikazioaren kontrolatzaileak gordeko dituen direktorioa. PHP fitxategi hauek erabiltzaileen eskaerak jasoko dituzte eta:

Negozio-logika exekutatuko dute.
Datu-basearekin komunikatuko dira.
Emaitzak erabiltzailearen interfazera bidaliko dituzte.
/class

Proiektuan beharrezkoak diren klaseak gordeko dituen direktorioa. Programazio orientatuaren oinarriak hemen egongo dira inplementatuta, kodea modu antolatu eta modularrean egituratzeko.

Proiektuaren Funtzionamendu Orokorra

Erabiltzaileak index.html orrira sartuko dira eta bertatik autentifikatuko dira. Saioa hasi ondoren, erabiltzailearen rolaren arabera dagozkion orrialdeetara bideratuko dira, /pages direktorioan kokatutako pantailen bidez.

Pantaila bakoitzak bere JavaScript eta estilo-fitxategiak izango ditu, hurrenez hurren /pages/js eta /pages/styles direktorioetan. Erabiltzailearen ekintzak kontrolatzaileetara bidaliko dira, /controllers direktorioan kokatutako PHP fitxategien bidez.

Kontrolatzaileek beharrezko eragiketak egingo dituzte, datu-basearekin komunikatzeko /db direktorioan definitutako funtzioak erabiliz. Bestalde, aplikazio osoan berrerabili daitezkeen funtzio osagarriak /helpers direktorioan egongo dira, eta negozio-logika edo datu-egiturak modelatzeko beharrezko klase guztiak /class direktorioan bilduko dira.
