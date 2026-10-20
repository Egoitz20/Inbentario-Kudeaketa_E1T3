"use strict";
import { apiUrl } from "./config.js";

// Función para pedir la informacion de los "baliabideak a la API"
async function baliabideakHartu() {
  const baliabideURL = apiUrl + "baliabideak.php";

  try {
    const respuesta = await fetch(
      baliabideURL, {
      method: "GET", // Se usa el metodo GET ya que lo unico que queremos es recoger la información
      credentials: "include"
    });

    if (!respuesta.ok) {
      throw new Error("Errorea zerbitzariaren erantzunean: " + respuesta.status);
    }

    // La respuesta se convierte en un array de objetos
    const datuak = await respuesta.json();

    // Se llama a la función que genera los txartelas y se le pasa el array de objetos que trae de la BBDD
    erakutsiTxartelak(datuak);

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

// 3. Función para pintar en el HTML solo las que quieras (por ejemplo, por filtro)
function erakutsiTxartelak(zerrenda) {
  const txartelakBlokea = document.getElementById("txartelakBlokea");

  // Limpiamos las tarjetas anteriores si las hubiera
  txartelakBlokea.innerHTML = "";

  // Recorremos la lista filtrada y las añadimos al DOM
  zerrenda.forEach((baliabidea) => {
    const txartela = sortuTxartelaElementua(baliabidea);
    txartelakBlokea.appendChild(txartela);
  });
}


baliabideakHartu();
