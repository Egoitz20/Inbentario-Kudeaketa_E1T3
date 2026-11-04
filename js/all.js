"use strict";
import { elementuakHartu } from "./api.js";
import { ezabatuBtn } from "./api.js";
import { elementuaEguneratu } from "./api.js";

// **********************************************************************************************************************************************************
// *************************************************************** PAGES JS *********************************************************************************
// **********************************************************************************************************************************************************

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------- ALDAGAI GLOBALAK -----------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

// Función auxiliar para obtener la ruta relativa base hacia la carpeta pages/
function getPagesBase() {
  const path = window.location.pathname;
  if (path.includes("/gestion/") || path.includes("/admin/")) {
    return "../";
  }
  return "";
}

let elementuGuztiak = []; // Variable que guarda los elementos que vengan de la BBDD en un array
let oraingoOrria = 1; // Variable para definir la página actual en la que se encuentra el usuario
const orrikoTxartelLimitea = 9; // Variable dedicada para definir el limite de txartelas que tiene que haber por pagina.
let filtratutakoElementuak = []; // guarda los elementos que contenagn el nombre buscado desde el buscador


const kategoriaIrudiak = {
  1: "../img/PORTATIL.png",
  2: "../img/PC.png",
  3: "../img/MONITOR.png",
  4: "../img/TECLADO.svg",
  5: "../img/RATON.png",
  6: "../img/PROYECTOR.png",
  7: "../img/PANTALLA INTERACTIVA.png",
  8: "../img/IMPRESORA.jpg",
  9: "../img/ROUTER.svg",
  10: "../img/SWITCH.png",
  11: "../img/PUNTO DE ACCESO DE WIFI.png",
  12: "../img/TABLET.png",
  13: "../img/SERVIDOR.png",
  14: "../img/SAI.png",
  15: "../img/WEBCAM.png",
  16: "../img/AURICULARES.jpg",
  17: "../img/ALTAVOCES.png",
  18: "../img/DISCO DURO.png",
  19: "../img/MICROFONO.jpg",
  20: "../img/HUB Y ADAPTADORES.jpg",
};

function irudiaKategoriaLortu(elementua) {
  const kategoriaId = Number(
    elementua.kategoriaId ?? elementua.kategoriaID ?? elementua.kategoria_id ?? 0
  );

  return kategoriaIrudiak[kategoriaId] || elementua.irudia || "../img/logotxikia.jpeg";
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------ HORRI HASIERA -------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

// Función para inicializar la página
async function hasieratu() {
  // Se lee el atributo data-endpoint asignada
  const rutaPHP = document.body.dataset.endpoint;

  const elementuenDatuak = await elementuakHartu(rutaPHP);

  if (elementuenDatuak) {
    elementuGuztiak = elementuenDatuak;
    filtratutakoElementuak = elementuenDatuak;
    sortuBilatzailea();
    orrikatu(1);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------- TXARTELAK ---------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

// Función para crear las txartelas dinamicamnete por cada elemento que se traiga de la BBD
function sortuTxartelaElementua(elementua) {
  const rutaPHP = document.body.dataset.endpoint;
  const divTxartela = document.createElement("div");
  divTxartela.classList.add("txartela");
  divTxartela.id = elementua.id;

  const img = document.createElement("img");
  img.src = irudiaKategoriaLortu(elementua);
  img.alt = elementua.izena || "Elementua";

  const hr = document.createElement("hr");

  const p = document.createElement("p");
  p.classList.add("elementuIzena");
  p.textContent = elementua.izena;

  const btn = document.createElement("input");
  btn.type = "button";
  btn.value = "Ikusi";
  btn.className = "btn-accion";

  // al hacer click sobre el boton, guarda el elemento y redirige
  btn.addEventListener("click", () => {
    // Se convierte el objeto a texto JSON y se guarda en sessionStorage
    sessionStorage.setItem("aukeratutakoElementua", JSON.stringify(elementua));
    sessionStorage.setItem(
      "aukeratutakoEndpoint",
      rutaPHP || "baliabideak.php",
    );
    window.location.href = getPagesBase() + "gestion/ikusi.html";
  });

  divTxartela.appendChild(img);
  divTxartela.appendChild(hr);
  divTxartela.appendChild(p);
  divTxartela.appendChild(btn);

  // Mira que el rol guardado en la sesion sea admin, y muestra el boton editatu e ikusi
  const rol = sessionStorage.getItem("rol");
  if (rol === "admin") {
    const btnEditatu = document.createElement("button");
    btnEditatu.type = "button";
    btnEditatu.textContent = "Editatu";
    btnEditatu.className = "btn-accion";
    btnEditatu.addEventListener("click", () => {
      sessionStorage.setItem(
        "aukeratutakoElementua",
        JSON.stringify(elementua),
      );
      sessionStorage.setItem(
        "aukeratutakoEndpoint",
        rutaPHP || "baliabideak.php",
      );
      window.location.href = getPagesBase() + "admin/editatu.html";
    });

    const btnEzabatu = document.createElement("button");
    btnEzabatu.type = "button";
    btnEzabatu.textContent = "Ezabatu";
    btnEzabatu.className = "btn-accion";
    btnEzabatu.addEventListener("click", () => {
      ezabatuBtn(rutaPHP, divTxartela);
    });

    divTxartela.appendChild(btnEditatu);
    divTxartela.appendChild(btnEzabatu);
  }

  return divTxartela;
}

// Función para pintar en el HTML las txartelak
function erakutsiTxartelak(datuZerrenda) {
  const txartelakBlokea = document.getElementById("txartelakBlokea");

  // Limpiamos las tarjetas anteriores si anteriormente se han generado
  txartelakBlokea.innerHTML = "";

  // Recorremos la lista filtrada y se añaden al DOM
  for (const elementua of datuZerrenda) {
    const txartela = sortuTxartelaElementua(elementua);
    txartelakBlokea.appendChild(txartela);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------ PAGINATION ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

// Funcion para paginar si hay mas de 9 productos
function orrikatu(orriZenbakia) {
  // Se actualiza la página actual
  oraingoOrria = orriZenbakia;

  // Se calcula desde donde empezar hasta donde terminar de cortar la lista
  // Ejemplo en la primera página: (1 - 1) * 9 = empieza en 0, termina en 9
  const txarteHasiera = (oraingoOrria - 1) * orrikoTxartelLimitea;
  const txartelAmaiera = txarteHasiera + orrikoTxartelLimitea;

  // con .slice() definimos desde que elemento debe de empezar y en que elemento debe terminar, asi sacando solo la información que queremos que slaga del array global
  //const orrikoElementuak = elementuGuztiak.slice(txarteHasiera, txartelAmaiera);
  const orrikoElementuak = filtratutakoElementuak.slice(
    txarteHasiera,
    txartelAmaiera,
  );

  // Se llama a la función que genera los txartelas y genera solamente los 9 elementos de la correspondiente página
  erakutsiTxartelak(orrikoElementuak);

  // Se generan los botones de la paginación
  sortuOrrikatzeBotoiak();
}

// Funcion para generar los botones de la páginacion
function sortuOrrikatzeBotoiak() {
  const orrikatzeBlokea = document.getElementById("orrikatzeBlokea");

  // En caso de saltar a la siguiente página, se limpian los botones generados anteriormente
  orrikatzeBlokea.innerHTML = "";

  // Calculo del total de páginas generadas redondeando hacia arriba
  //const orriTotalak = Math.ceil(elementuGuztiak.length / orrikoTxartelLimitea);
  const orriTotalak =
    Math.ceil(filtratutakoElementuak.length / orrikoTxartelLimitea) || 1;

  // Generación del boton "Anterior"
  const btnAurrekoa = document.createElement("input");
  btnAurrekoa.type = "button";
  btnAurrekoa.value = "Aurrekoa";
  btnAurrekoa.disabled = oraingoOrria === 1; // Si nos encontramos en la primera página, se deshabilita el boton
  btnAurrekoa.addEventListener("click", () => orrikatu(oraingoOrria - 1)); // Al pulsar el boton retrocede una página

  // Generacion de informacion de la pagina en la que nos encontramos
  const orriInfo = document.createElement("span");
  orriInfo.textContent = ` Orria ${oraingoOrria} / ${orriTotalak} `;

  // Generación del boton "Siguiente"
  const btnHurrengoa = document.createElement("input");
  btnHurrengoa.type = "button";
  btnHurrengoa.value = "Hurrengoa";
  btnHurrengoa.disabled = oraingoOrria === orriTotalak;
  btnHurrengoa.addEventListener("click", () => orrikatu(oraingoOrria + 1));

  // Se añade todo al bloque "orrikatzeBlokea"
  orrikatzeBlokea.appendChild(btnAurrekoa);
  orrikatzeBlokea.appendChild(orriInfo);
  orrikatzeBlokea.appendChild(btnHurrengoa);
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------ BILATZAILEA ---------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

function sortuBilatzailea() {
  const bilaketaBlokea = document.getElementById("bilaketaBlokea");

  // Boton filtro
  const btnFiltroa = document.createElement("button");
  btnFiltroa.className = "btn-icono";
  const imgFiltroa = document.createElement("img");
  imgFiltroa.src = "../img/filtrar.png";
  imgFiltroa.alt = "Filtraitu";
  btnFiltroa.appendChild(imgFiltroa);

  // Campo buscador
  const bilatzailea = document.createElement("input");
  bilatzailea.type = "text";
  bilatzailea.name = "bilaketa";
  bilatzailea.id = "bilaketa";
  bilatzailea.placeholder = "Bilatu....";

  // Boton Lupa
  const btnLupa = document.createElement("button");
  btnLupa.className = "btn-icono";
  const imgLupa = document.createElement("img");
  imgLupa.src = "../img/lupa.png";
  imgLupa.alt = "Bilatu";
  btnLupa.appendChild(imgLupa);

  btnLupa.addEventListener("click", function () {
    const testuBilatuta = bilatzailea.value;
    const testuGarbia = testuBilatuta.trim();

    // Se guardan los resultados encontrados
    filtratutakoElementuak = bilatu(testuGarbia);

    // Se recarga la página con los elementos filtrados
    orrikatu(1);
  });

  // Boton Sortu
  // Mira que el rol guardado en la sesion sea admin, y muestra el boton sortu
  const rol = sessionStorage.getItem("rol");
  if (rol === "admin") {
    const btnSortu = document.createElement("button");
    btnSortu.type = "button";
    btnSortu.textContent = "Sortu";
    btnSortu.className = "btn-accion btn-sortu";
    bilaketaBlokea.appendChild(btnSortu);
  }

  // Añadirlos al bloque
  bilaketaBlokea.appendChild(btnFiltroa);
  bilaketaBlokea.appendChild(bilatzailea);
  bilaketaBlokea.appendChild(btnLupa);
}

function bilatu(testuGarbia) {
  const emaitza = elementuGuztiak.filter((elementua) => {
    return elementua.izena.toLowerCase().includes(testuGarbia.toLowerCase());
  });

  return emaitza;
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------- DEIAK ------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

// Si existe el bloque de tarjetas en el HTML, inicializamos el listado
if (document.getElementById("txartelakBlokea")) {
  hasieratu();
}

// Si existe el bloque de título de detalle en el HTML (ikusi.html), recuperamos el elemento
if (document.getElementById("elementuTitulua")) {
  elementuaErrekuperatu();
}

// Si existe el bloque de edición en el HTML (editatu.html), inicializamos el formulario
if (document.getElementById("elementuTituluaEditatu")) {
  elementuaEditatuHasieratu();
}

// **********************************************************************************************************************************************************
// *************************************************************** IKUSI JS *********************************************************************************
// **********************************************************************************************************************************************************

function elementuaErrekuperatu() {
  const datuakString = sessionStorage.getItem("aukeratutakoElementua");

  // Si no hay datos guardados en el sessionStorage, se sale de la función
  if (!datuakString) return;

  const elementua = JSON.parse(datuakString);

  const eTitulua = document.getElementById("elementuTitulua");
  const eOsagaiak = document.getElementById("elementuOsagaiak");
  const eIrudia = document.getElementById("elementuIrudia");
  const eMugimenduak = document.getElementById("elementuMugimenduak");

  // Titulo
  const h1 = document.createElement("h1");
  h1.textContent = elementua.izena;
  eTitulua.appendChild(h1);

  // Lista los componentes del elemento
  const ulOsagaiak = document.createElement("ul");
  ulOsagaiak.classList.add("elementuOsagaiak");

  const liDeskribapena = document.createElement("li");
  liDeskribapena.classList.add("deskribapena");
  liDeskribapena.textContent = `Deskribapena: ${elementua.deskribapena || "Ez dago"}`;

  const liMarka = document.createElement("li");
  liMarka.classList.add("marka");
  liMarka.textContent = `Marka: ${elementua.marka || "Ez dago"}`;

  const liModeloa = document.createElement("li");
  liModeloa.classList.add("modeloa");
  liModeloa.textContent = `Modeloa: ${elementua.modeloa || "Ez dago"}`;

  ulOsagaiak.appendChild(liDeskribapena);
  ulOsagaiak.appendChild(liMarka);
  ulOsagaiak.appendChild(liModeloa);
  eOsagaiak.appendChild(ulOsagaiak);

  // Imagen
  const img = document.createElement("img");
  img.src = elementua.irudia || "../../img/logotxikia.jpeg";
  img.alt = elementua.izena;
  eIrudia.appendChild(img);

  // Movimientos
  const ulMugimenduak = document.createElement("ul");
  const liMu = document.createElement("li");
  liMu.textContent = `Mugimenduak: ${elementua.mugimenduak || "Ez dago mugimendurik"}`;
  ulMugimenduak.appendChild(liMu);
  eMugimenduak.appendChild(ulMugimenduak);

  // Si el usuario es admin, también puede ir a editatu desde la pantalla ikusi
  const rol = sessionStorage.getItem("rol");
  if (rol === "admin") {
    const eBotoiak = document.getElementById("elementuBotoiak");
    if (eBotoiak && !document.getElementById("btnIkusiEditatu")) {
      const btnEditatu = document.createElement("button");
      btnEditatu.id = "btnIkusiEditatu";
      btnEditatu.type = "button";
      btnEditatu.className = "btn-atzera";
      btnEditatu.textContent = "Editatu";
      btnEditatu.addEventListener("click", () => {
        window.location.href = "../admin/editatu.html";
      });
      eBotoiak.appendChild(btnEditatu);
    }
  }
}

// **********************************************************************************************************************************************************
// ************************************************************** EDITATU JS ********************************************************************************
// **********************************************************************************************************************************************************

function elementuaEditatuHasieratu() {
  const datuakString = sessionStorage.getItem("aukeratutakoElementua");

  // Si no hay datos guardados en el sessionStorage, se redirige a la lista
  if (!datuakString) {
    window.location.href = "../pages/baliabideak.html";
    return;
  }

  const elementua = JSON.parse(datuakString);

  const eTitulua = document.getElementById("elementuTituluaEditatu");
  const eOsagaiak = document.getElementById("elementuOsagaiakEditatu");
  const eIrudia = document.getElementById("elementuIrudia");
  const eMugimenduak = document.getElementById("elementuMugimenduak");
  const eBotoiak = document.getElementById("elementuBotoiak");

  // 1. Título y campo editable para el nombre del elemento (izena)
  const h1 = document.createElement("h1");
  h1.textContent = "Elementua editatu";
  eTitulua.appendChild(h1);

  const divIzena = document.createElement("div");
  divIzena.className = "editTaldea tituluaTaldea";

  const labelIzena = document.createElement("label");
  labelIzena.htmlFor = "editIzena";
  labelIzena.textContent = "Elementuaren izena: *";

  const inputIzena = document.createElement("input");
  inputIzena.type = "text";
  inputIzena.id = "editIzena";
  inputIzena.className = "inputsEditatu";
  inputIzena.value = elementua.izena || "";
  inputIzena.placeholder = "Idatzi elementuaren izena...";
  inputIzena.required = true;

  divIzena.appendChild(labelIzena);
  divIzena.appendChild(inputIzena);
  eTitulua.appendChild(divIzena);

  // 2. Componentes editables (deskribapena, marka, modeloa)
  const ulOsagaiak = document.createElement("ul");
  ulOsagaiak.classList.add("elementuOsagaiak", "editatuOsagaiak");

  // Deskribapena
  const liDeskribapena = document.createElement("li");
  liDeskribapena.classList.add("deskribapena");
  const labelDeskribapena = document.createElement("label");
  labelDeskribapena.htmlFor = "editDeskribapena";
  labelDeskribapena.textContent = "Deskribapena:";
  const textareaDeskribapena = document.createElement("textarea");
  textareaDeskribapena.id = "editDeskribapena";
  textareaDeskribapena.className = "inputsEditatu textareaEditatu";
  textareaDeskribapena.rows = 4;
  textareaDeskribapena.placeholder = "Idatzi deskribapena...";
  textareaDeskribapena.value = elementua.deskribapena || "";

  liDeskribapena.appendChild(labelDeskribapena);
  liDeskribapena.appendChild(textareaDeskribapena);

  // Marka
  const liMarka = document.createElement("li");
  liMarka.classList.add("marka");
  const labelMarka = document.createElement("label");
  labelMarka.htmlFor = "editMarka";
  labelMarka.textContent = "Marka:";
  const inputMarka = document.createElement("input");
  inputMarka.type = "text";
  inputMarka.id = "editMarka";
  inputMarka.className = "inputsEditatu";
  inputMarka.placeholder = "Idatzi marka...";
  inputMarka.value = elementua.marka || "";

  liMarka.appendChild(labelMarka);
  liMarka.appendChild(inputMarka);

  // Modeloa
  const liModeloa = document.createElement("li");
  liModeloa.classList.add("modeloa");
  const labelModeloa = document.createElement("label");
  labelModeloa.htmlFor = "editModeloa";
  labelModeloa.textContent = "Modeloa:";
  const inputModeloa = document.createElement("input");
  inputModeloa.type = "text";
  inputModeloa.id = "editModeloa";
  inputModeloa.className = "inputsEditatu";
  inputModeloa.placeholder = "Idatzi modeloa...";
  inputModeloa.value = elementua.modeloa || "";

  liModeloa.appendChild(labelModeloa);
  liModeloa.appendChild(inputModeloa);

  ulOsagaiak.appendChild(liDeskribapena);
  ulOsagaiak.appendChild(liMarka);
  ulOsagaiak.appendChild(liModeloa);
  eOsagaiak.appendChild(ulOsagaiak);

  // Irudia
  if (eIrudia) {
    const img = document.createElement("img");
    img.src = elementua.irudia || "../../img/logotxikia.jpeg";
    img.alt = elementua.izena || "Elementuaren irudia";
    eIrudia.appendChild(img);
  }

  // Mugimenduak
  if (eMugimenduak) {
    const ulMugimenduak = document.createElement("ul");
    const liMu = document.createElement("li");
    liMu.textContent = `Mugimenduak: ${elementua.mugimenduak || "Ez dago mugimendurik"}`;
    ulMugimenduak.appendChild(liMu);
    eMugimenduak.appendChild(ulMugimenduak);
  }

  // Botoiak
  if (eBotoiak) {
    eBotoiak.innerHTML = "";

    const btnAtzera = document.createElement("button");
    btnAtzera.type = "button";
    btnAtzera.className = "btn-atzera";
    btnAtzera.textContent = "Atzera";
    btnAtzera.addEventListener("click", () => {
      window.history.back();
    });

    const btnGorde = document.createElement("button");
    btnGorde.type = "button";
    btnGorde.className = "btn-atzera btn-gorde";
    btnGorde.id = "btnGorde";
    btnGorde.textContent = "Gorde";

    btnGorde.addEventListener("click", async () => {
      const berriaIzena = inputIzena.value.trim();
      const berriaDeskribapena = textareaDeskribapena.value.trim();
      const berriaMarka = inputMarka.value.trim();
      const berriaModeloa = inputModeloa.value.trim();

      if (!berriaIzena) {
        alert("Mesedez, idatzi elementuaren izena.");
        inputIzena.focus();
        return;
      }

      btnGorde.disabled = true;
      btnGorde.textContent = "Gordetzen...";

      const rutaPHP =
        sessionStorage.getItem("aukeratutakoEndpoint") || "baliabideak.php";

      const datuak = {
        kategoriaId: elementua.kategoriaId || 1,
        izena: berriaIzena,
        deskribapena: berriaDeskribapena,
        marka: berriaMarka,
        modeloa: berriaModeloa,
      };

      const emaitza = await elementuaEguneratu(rutaPHP, elementua.id, datuak);

      btnGorde.disabled = false;
      btnGorde.textContent = "Gorde";

      if (emaitza) {
        // Actualizamos los datos en sessionStorage para que ikusi o la vista previa queden actualizados
        const elementuEguneratua = {
          ...elementua,
          izena: berriaIzena,
          deskribapena: berriaDeskribapena,
          marka: berriaMarka,
          modeloa: berriaModeloa,
        };
        sessionStorage.setItem(
          "aukeratutakoElementua",
          JSON.stringify(elementuEguneratua),
        );
        alert("Aldaketak ondo gorde dira!");
        window.location.href = "../gestion/ikusi.html";
      }
    });

    eBotoiak.appendChild(btnAtzera);
    eBotoiak.appendChild(btnGorde);
  }
}
