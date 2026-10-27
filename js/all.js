"use strict";
import { elementuakHartu } from "./api.js";
import { ezabatuBtn } from "./api.js";

// ----------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------- ALDAGAI GLOBALAK -----------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------

let elementuGuztiak = []; // Variable que guarda los elementos que vengan de la BBDD en un array
let oraingoOrria = 1; // Variable para definir la página actual en la que se encuentra el usuario
const orrikoTxartelLimitea = 9; // Variable dedicada para definir el limite de txartelas que tiene que haber por pagina.
let filtratutakoElementuak = []; // guarda los elementos que contenagn el nombre buscado desde el buscador

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
  const divTxartela = document.createElement("div");
  divTxartela.classList.add("txartela");
  divTxartela.id = elementua.id;

  const img = document.createElement("img");
  // Si no tiene una imagen que trae desde la base de datos, se pone una por defecto
  img.src = elementua.irudia || "../img/logotxikia.jpeg";

  const hr = document.createElement("hr");

  const p = document.createElement("p");
  p.classList.add("elementuIzena");
  p.textContent = elementua.izena;

  const btn = document.createElement("input");
  btn.type = "button";
  btn.value = "Ikusi";
  btn.className = "btn-accion";

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

    const btnEzabatu = document.createElement("button");
    btnEzabatu.type = "button";
    btnEzabatu.textContent = "Ezabatu";
    btnEzabatu.className = "btn-accion";
    btnEzabatu.addEventListener("click", () => {
      ezabatuBtn("baliabideak.php", divTxartela);
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

// Se inicia la carga de datos
hasieratu();
