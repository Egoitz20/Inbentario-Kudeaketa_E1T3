"use strict";
import { apiUrl } from "./config.js";

// Variables globales
let baliabideGuztiak = []; // Variable que guarda los baliabideak que vengan de la BBDD en un array
let oraingoOrria = 1; // Variable para definir la página actual en la que se encuentra el usuario
const orrikoTxartelLimitea = 9; // Variable dedicada para definir el limite de txartelas que tiene que haber por pagina.

// Función para pedir la informacion de los "baliabideak" a la API
async function baliabideakHartu() {
  const baliabideURL = apiUrl + "baliabideak.php";

  try {
    const erantzuna = await fetch(baliabideURL, {
      method: "GET", // Se usa el metodo GET ya que lo unico que queremos es recoger la información
      credentials: "include",
    });

    if (!erantzuna.ok) {
      throw new Error(
        "Errorea zerbitzariaren erantzunean: " + erantzuna.status,
      );
    }

    // Los datos recibidos se guardan en la variable global
    baliabideGuztiak = await erantzuna.json();

    // Predeterminadante se mostrara la primera página
    orrikatu(1);
  } catch (error) {
    console.log(error);
    alert("Errorea baliabideak lortzean API-ren kontra");
  }
}

// Función para crear las txartelas dinamicamnete por cada baliabide que se traiga de la BBD
function sortuTxartelaElementua(baliabidea) {
  const divTxartela = document.createElement("div");
  divTxartela.classList.add("txartela");

  const img = document.createElement("img");
  // Si no tiene una imagen que trae desde la base de datos, se pone una por defecto
  img.src = baliabidea.irudia || "../img/logotxikia.jpeg";

  const hr = document.createElement("hr");

  const p = document.createElement("p");
  p.classList.add("baliabideIzena");
  p.textContent = baliabidea.izena;

  const btn = document.createElement("input");
  btn.type = "button";
  btn.value = "Ikusi";

  divTxartela.appendChild(img);
  divTxartela.appendChild(hr);
  divTxartela.appendChild(p);
  divTxartela.appendChild(btn);

  return divTxartela;
}

// Función para pintar en el HTML las txartelak
function erakutsiTxartelak(datuZerrenda) {
  const txartelakBlokea = document.getElementById("txartelakBlokea");

  // Limpiamos las tarjetas anteriores si anteriormente se han generado
  txartelakBlokea.innerHTML = "";

  // Recorremos la lista filtrada y se añaden al DOM
  for (const baliabidea of datuZerrenda) {
    const txartela = sortuTxartelaElementua(baliabidea);
    txartelakBlokea.appendChild(txartela);
  }
}

// Funcion para paginar si hay mas de 9 productos
function orrikatu(orriZenbakia) {
  // Se actualiza la página actual
  oraingoOrria = orriZenbakia;

  // Se calcula desde donde empezar hasta donde terminar de cortar la lista
  // Ejemplo en la primera página: (1 - 1) * 9 = empieza en 0, termina en 9
  const txarteHasiera = (oraingoOrria - 1) * orrikoTxartelLimitea;
  const txartelAmaiera = txarteHasiera + orrikoTxartelLimitea;

  // con .slice() definimos desde que elemento debe de empezar y en que elemento debe terminar, asi sacando solo la información que queremos que slaga del array global
  const orrikoBaliabideak = baliabideGuztiak.slice(
    txarteHasiera,
    txartelAmaiera,
  );

  // Se llama a la función que genera los txartelas y genera solamente los 9 baliabideak de la correspondiente página
  erakutsiTxartelak(orrikoBaliabideak);

  // Se generan los botones de la paginación
  sortuOrrikatzeBotoiak();
}

// Funcion para generar los botones de la páginacion
function sortuOrrikatzeBotoiak() {
  const orrikatzeBlokea = document.getElementById("orrikatzeBlokea");

  // En caso de saltar a la siguiente página, se limpian los botones generados anteriormente
  orrikatzeBlokea.innerHTML = "";

  // Calculo del total de páginas generadas redondeando hacia arriba
  const orriTotalak = Math.ceil(baliabideGuztiak.length / orrikoTxartelLimitea);

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

// Se inicia la carga de datos
baliabideakHartu();
