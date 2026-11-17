"use strict";
import { elementuakHartu } from "./api.js";
import { ezabatuBtn } from "./api.js";
import { sortuBtn } from "./api.js";
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

const kategoriaIrudiakIzenak = {
  portatil: "../img/PORTATIL.png",
  pc: "../img/PC.png",
  sobremesa: "../img/PC.png",
  monitor: "../img/MONITOR.png",
  teclado: "../img/TECLADO.svg",
  raton: "../img/RATON.png",
  proyector: "../img/PROYECTOR.png",
  "pantalla interactiva": "../img/PANTALLA INTERACTIVA.png",
  impresora: "../img/IMPRESORA.jpg",
  router: "../img/ROUTER.svg",
  switch: "../img/SWITCH.png",
  "punto de acceso wifi": "../img/PUNTO DE ACCESO DE WIFI.png",
  tablet: "../img/TABLET.png",
  servidor: "../img/SERVIDOR.png",
  sai: "../img/SAI.png",
  webcam: "../img/WEBCAM.png",
  auriculares: "../img/AURICULARES.jpg",
  altavoces: "../img/ALTAVOCES.png",
  "disco duro": "../img/DISCO DURO.png",
  microfono: "../img/MICROFONO.jpg",
  hub: "../img/HUB Y ADAPTADORES.jpg",
  adaptador: "../img/HUB Y ADAPTADORES.jpg",
};

const gelaIrudiak = {
  almacen: "../img/ALMACEN.png",
  aula: "../img/AULA.png",
  "laboratorio de redes": "../img/LABORATORIO DE REDES.jpg",
  "laboratorio de hardware": "../img/LABORATORIO DE HARDWARE.jpg",
  "sala de servidores": "../img/SALA DE SERVIDORES.jpg",
  "sala de profesores": "../img/SALA DE PROFESORES.jpg",
  secretaria: "../img/SECRETARIA.jpg",
  direccion: "../img/DIRECCION.jpg",
  biblioteca: "../img/BIBLIOTECA.jpg",
  "sala de reuniones": "../img/SALA DE REUNIONES.jpg",
  "taller de electronica": "../img/TALLER DE ELECTRONICA.jpg",
  "sala de informatica": "../img/SALA DE INFORMATICA.jpg",
};

function normalizeKategoriaIzena(izena = "") {
  return String(izena)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function irudiaElementoLortu(elementua) {
  const endpoint = document.body?.dataset?.endpoint || "";
  const id = Number(
    elementua?.kategoriaId ?? elementua?.kategoriaID ?? elementua?.kategoria_id ?? 0
  );

  const izena = String(elementua?.izena ?? elementua?.nombre ?? elementua?.kategoria ?? "");
  const izenaNormaliz = normalizeKategoriaIzena(izena);

  // 1) Si tiene ID, prioridad a categoría
  if (id && kategoriaIrudiak[id]) {
    return kategoriaIrudiak[id];
  }

  // 2) Si es una sala, busca por patrones
  if (endpoint === "gelak.php") {
    for (const [patron, ruta] of Object.entries(gelaIrudiak)) {
      if (izenaNormaliz.includes(patron)) {
        return ruta;
      }
    }
    return "../img/aula.png";
  }

  // 3) Si es categoría, busca por nombre
  if (izenaNormaliz) {
    const match = Object.entries(kategoriaIrudiakIzenak).find(([clave]) => {
      const claveNormaliz = normalizeKategoriaIzena(clave);
      return (
        izenaNormaliz === claveNormaliz ||
        izenaNormaliz.includes(claveNormaliz) ||
        claveNormaliz.includes(izenaNormaliz)
      );
    });

    if (match) {
      return match[1];
    }
  }

  return elementua?.irudia || "../img/logotxikia.jpeg";
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
  img.src = irudiaElementoLortu(elementua);
  img.alt = elementua.izena || elementua.etiketa || "Elementua";

console.log("GAILUA:", elementua);
console.log("KATEGORIA ID:", elementua.kategoriaId);
console.log("IMAGEN:", irudiaElementoLortu(elementua));

  const hr = document.createElement("hr");

  const p = document.createElement("p");
  p.classList.add("elementuIzena");
  p.textContent = elementua.izena || elementua.etiketa || "Elementua";

  const btn = document.createElement("input");
  btn.type = "button";
  btn.value = "Ikusi";
  btn.className = "btn-accion";

  // al hacer click sobre el boton, guarda el elemento y redirige
  btn.addEventListener("click", () => {
    sessionStorage.setItem("aukeratutakoElementua", JSON.stringify(elementua));
    sessionStorage.setItem("aukeratutakoEndpoint", rutaPHP || "baliabideak.php");

    // Guardar el tipo de tabla
    const tipoTabla = (rutaPHP || "baliabideak.php").replace(".php", "");
    sessionStorage.setItem("elementuMota", tipoTabla);
    window.location.href = getPagesBase() + "gestion/ikusi.html";
  });

  const akzioak = document.createElement("div");
  akzioak.className = "akzioak";
  akzioak.appendChild(btn);

  divTxartela.appendChild(img);
  divTxartela.appendChild(hr);
  divTxartela.appendChild(p);

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

    akzioak.appendChild(btnEditatu);
    akzioak.appendChild(btnEzabatu);
  }

  divTxartela.appendChild(akzioak);
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
  btnAurrekoa.value = "<";
  btnAurrekoa.disabled = oraingoOrria === 1; // Si nos encontramos en la primera página, se deshabilita el boton
  btnAurrekoa.addEventListener("click", () => orrikatu(oraingoOrria - 1)); // Al pulsar el boton retrocede una página

  // Generacion de informacion de la pagina en la que nos encontramos
  const orriInfo = document.createElement("span");
  orriInfo.textContent = ` Orria ${oraingoOrria} / ${orriTotalak} `;

  // Generación del boton "Siguiente"
  const btnHurrengoa = document.createElement("input");
  btnHurrengoa.type = "button";
  btnHurrengoa.value = ">";
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
    btnSortu.addEventListener("click", () => {
      const endpoint = document.body.dataset.endpoint;
      const tipo = endpoint.replace(".php", "");
      window.location.href = `./admin/sortu.html?tipo=${tipo}`;
    });
  }

  // Añadirlos al bloque
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

async function elementuaErrekuperatu() {
  const datuakString = sessionStorage.getItem("aukeratutakoElementua");
  const mota = sessionStorage.getItem("elementuMota");

  if (!datuakString || !mota) return;
  const elementua = JSON.parse(datuakString);

  const eTitulua = document.getElementById("elementuTitulua");
  const eOsagaiak = document.getElementById("elementuOsagaiak");
  const eIrudia = document.getElementById("elementuIrudia");
  const eMugimenduak = document.getElementById("elementuMugimenduak");

  if (!eTitulua || !eOsagaiak) return;

  eTitulua.innerHTML = "";
  eOsagaiak.innerHTML = "";
  eIrudia.innerHTML = "";
  eMugimenduak.innerHTML = "";

  const configuracion = {
    baliabideak: {
      titulo: elementua.izena,
      campos: ["deskribapena", "marka", "modeloa", "kategoriaId"],
      imagen: true
    },

    gailuak: {
      titulo: elementua.etiketa,
      campos: ["baliabideId", "etiketa", "erosketaData", "egoera"]
    },

    kategoriak: {
      titulo: elementua.izena,
      campos: ["izena"]
    },

    gelak: {
      titulo: elementua.izena,
      campos: ["izena", "taldea"]
    },

    mugimenduak: {
      titulo: "Mugimendua",
      campos: ["gelaId", "gailuId", "hasieraData"]
    }

  };

  const config = configuracion[mota];

  if (!config) return;

  console.log("Elemento seleccionado:", elementua);
  console.log("ID del recurso:", elementua.id);
  console.log("Movimientos:", elementua.mugimenduak);

  // HISTORIAL DE MOVIMIENTOS DE LOS RECURSOS
  if (mota === "baliabideak") {

    const gailuak = await elementuakHartu("gailuak.php");

    const gailuakBaliabide = Array.isArray(gailuak)
      ? gailuak.filter(gailua =>
        Number(gailua.baliabideId) === Number(elementua.id)
      )
      : [];

    const mugimenduZerrendak = await Promise.all(

      gailuakBaliabide.map(gailua =>
        elementuakHartu(
          `mugimenduak.php?gailuId=${gailua.id}`
        )
      )

    );

    const mugimenduGuztiak = mugimenduZerrendak
      .filter(zerrenda => Array.isArray(zerrenda))
      .flat();

    mugimenduakErakutsi(mugimenduGuztiak);
  }

  // Izenburua
  const h1 = document.createElement("h1");
  h1.textContent = config.titulo || "Elementua";
  eTitulua.appendChild(h1);

  // Eremuak
  const ul = document.createElement("ul");
  ul.classList.add("elementuOsagaiak");

  config.campos.forEach(campo => {

    const li = document.createElement("li");
    const valor = elementua[campo] ?? "Ez dago";

    li.textContent = `${campo}: ${valor}`;

    ul.appendChild(li);

  });

  eOsagaiak.appendChild(ul);

  // Irudia (Baliabideak bakarrik)
  if (config.imagen) {
    const img = document.createElement("img");

    img.src = elementua.irudia || "../../img/logotxikia.jpeg";
    img.alt = elementua.izena || "Baliabidea";

    eIrudia.appendChild(img);
  }

  // Admin editatzeko botoia
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

function mugimenduakErakutsi(mugimenduak) {
  const kontenedorea = document.getElementById(
    "baliabideMugimenduenHistoria"
  );

  if (!kontenedorea) return;

  kontenedorea.innerHTML = "";

  const titulua = document.createElement("h2");
  titulua.textContent = "Mugimenduen historikoa";

  kontenedorea.appendChild(titulua);

  if (!mugimenduak || mugimenduak.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Ez dago mugimendurik baliabide honetan.";

    kontenedorea.appendChild(p);
    return;
  }

  const taula = document.createElement("table");

  const thead = document.createElement("thead");
  const goiburua = document.createElement("tr");

  ["Gela ID", "Gailu ID", "Hasiera data"].forEach(izena => {
    const th = document.createElement("th");
    th.textContent = izena;
    goiburua.appendChild(th);
  });

  thead.appendChild(goiburua);
  taula.appendChild(thead);

  const tbody = document.createElement("tbody");

  mugimenduak.forEach(mugimendua => {

    const tr = document.createElement("tr");

    [
      mugimendua.gelaId,
      mugimendua.gailuId,
      mugimendua.hasieraData
    ].forEach(valor => {

      const td = document.createElement("td");
      td.textContent = valor ?? "Ez dago";

      tr.appendChild(td);

    });

    tbody.appendChild(tr);

  });

  taula.appendChild(tbody);
  kontenedorea.appendChild(taula);
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

// **********************************************************************************************************************************************************
// ************************************************************** SORTU JS ********************************************************************************
// **********************************************************************************************************************************************************

const konfigurazioa = {

  // 1. BALIABIDEAK
  baliabideak: {
    izenburua: "Baliabidea sortu",
    endpoint: "baliabideak.php",

    campos: [
      {
        id: "izena",
        label: "Izena",
        type: "text",
        required: true
      },
      {
        id: "deskribapena",
        label: "Deskribapena",
        type: "textarea",
        required: true
      },
      {
        id: "marka",
        label: "Marka",
        type: "text",
        required: true
      },
      {
        id: "modeloa",
        label: "Modeloa",
        type: "text",
        required: true
      },
      {
        id: "kategoriaId",
        label: "Kategoria",
        type: "select",
        required: true,

        options: [
          ["1", "Portátil"],
          ["2", "Ordenador de sobremesa"],
          ["3", "Monitor"],
          ["4", "Teclado"],
          ["5", "Ratón"],
          ["6", "Proyector"],
          ["7", "Pantalla interactiva"],
          ["8", "Impresora"],
          ["9", "Router"],
          ["10", "Switch"],
          ["11", "Punto de acceso WiFi"],
          ["12", "Tablet"],
          ["13", "Servidor"],
          ["14", "SAI"],
          ["15", "Webcam"],
          ["16", "Auriculares"],
          ["17", "Altavoces"],
          ["18", "Disco duro externo"],
          ["19", "Micrófono"],
          ["20", "Hub y adaptadores"]
        ]
      }
    ]
  },

  // 2. GAILUAK
  gailuak: {
    izenburua: "Gailua sortu",
    endpoint: "gailuak.php",

    campos: [
      {
        id: "baliabideId",
        label: "Baliabidearen ID",
        type: "number",
        required: true
      },
      {
        id: "etiketa",
        label: "Etiketa",
        type: "text",
        required: true
      },
      {
        id: "erosketaData",
        label: "Erosketa data",
        type: "date"
      },
      {
        id: "egoera",
        label: "Egoera",
        type: "select",

        options: [
          ["Operatiboa", "Operatiboa"],
          ["Matxuratua", "Matxuratua"],
          ["Baja", "Baja"]
        ]
      }
    ]
  },

  // 3. KATEGORIAK
  kategoriak: {
    izenburua: "Kategoria sortu",
    endpoint: "kategoriak.php",

    campos: [
      {
        id: "izena",
        label: "Izena",
        type: "text",
        required: true
      }
    ]
  },

  // 4. GELAK
  gelak: {
    izenburua: "Gela sortu",
    endpoint: "gelak.php",

    campos: [
      {
        id: "izena",
        label: "Izena",
        type: "text",
        required: true
      },
      {
        id: "taldea",
        label: "Taldea",
        type: "text"
      }
    ]
  },

  // 5. MUGIMENDUAK
  mugimenduak: {
    izenburua: "Mugimendua sortu",
    endpoint: "mugimenduak.php",

    campos: [
      {
        id: "gelaId",
        label: "Gela ID",
        type: "number",
        required: true
      },
      {
        id: "gailuId",
        label: "Gailu ID",
        type: "number",
        required: true
      },
      {
        id: "hasieraData",
        label: "Hasiera data",
        type: "date"
      }
    ]
  }
};

// Formulario mota
const formularioa = document.getElementById("sortuFormularioaS");
const titulua = document.getElementById("sortuIzenburua");

// Ejecutar únicamente en la página de creación
if (formularioa && titulua) {

  const parametros = new URLSearchParams(window.location.search);
  const tipo = parametros.get("tipo");

  const config = konfigurazioa[tipo];

  if (!config) {

    titulua.textContent = "Errorea";
    formularioa.innerHTML =
      "<p>Ez da formulario mota zuzena.</p>";

  } else {

    titulua.textContent = config.izenburua;

    // GENERAR LOS CAMPOS DINÁMICAMENTE
    config.campos.forEach(campo => {

      const div = document.createElement("div");
      div.className = "sortuInput";

      // LABEL
      const label = document.createElement("label");
      label.htmlFor = campo.id;
      label.textContent = campo.label;

      // INPUT
      let input;

      if (campo.type === "textarea") {

        input = document.createElement("textarea");

      } else if (campo.type === "select") {

        input = document.createElement("select");

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Aukeratu";
        input.appendChild(opcionInicial);

        campo.options.forEach(([valor, texto]) => {
          const opcion = document.createElement("option");
          opcion.value = valor;
          opcion.textContent = texto;
          input.appendChild(opcion);
        });

      } else {

        input = document.createElement("input");
        input.type = campo.type;

      }

      input.id = campo.id;
      input.name = campo.id;
      input.required = campo.required ?? false;

      div.appendChild(label);
      div.appendChild(input);
      formularioa.appendChild(div);

    });

    // ENVIAR EL FORMULARIO
    formularioa.addEventListener("submit", async (e) => {

      e.preventDefault();

      if (!formularioa.reportValidity()) {
        return;
      }

      const datos = {};

      config.campos.forEach(campo => {

        const input = document.getElementById(campo.id);
        let valor = input.value.trim();

        if (campo.type === "number" && valor !== "") {
          valor = Number(valor);
        }

        if (valor !== "") {
          datos[campo.id] = valor;
        }

      });

      const endpoint = config.endpoint;
      const paginaRetorno = "../" + tipo + ".html";

      await sortuBtn(endpoint, datos, paginaRetorno);

    });

  }
}
