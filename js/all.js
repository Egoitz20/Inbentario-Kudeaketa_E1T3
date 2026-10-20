"use strict";

// 1. Datos de ejemplo (pueden venir de un array o una API)
const baliabideak = [
  {
    izena: "Ordenagailu eramangarria",
    mota: "gailua",
    irudia: "../img/logotxikia.jpeg",
  },
  { izena: "Proiektorea", mota: "gailua", irudia: "../img/logotxikia.jpeg" },
  { izena: "1. Gela", mota: "gela", irudia: "../img/logotxikia.jpeg" },
];

// 2. Función para crear UNA tarjeta individual
function sortuTxartelaElementua(baliabidea) {
  const divTxartela = document.createElement("div");
  divTxartela.classList.add("txartela");

  const img = document.createElement("img");
  img.src = baliabidea.irudia;

  const hr = document.createElement("hr");

  const p = document.createElement("p");
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
  const kontenedorea = document.getElementById("txartelakBlokea");

  // Limpiamos las tarjetas anteriores si las hubiera
  kontenedorea.innerHTML = "";

  // Recorremos la lista filtrada y las añadimos al DOM
  zerrenda.forEach((baliabidea) => {
    const txartela = sortuTxartelaElementua(baliabidea);
    kontenedorea.appendChild(txartela);
  });
}

erakutsiTxartelak(baliabideak);
