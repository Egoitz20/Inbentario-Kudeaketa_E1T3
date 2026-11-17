"use strict";

// --- CALCULAR LA RUTA BASE GLOBAL ---
// Al estar fuera de las funciones, se calcula una sola vez al cargar el script
const scriptPath = document.currentScript
  ? document.currentScript.src
  : window.location.pathname;
const jsIndex = scriptPath.indexOf("/js/");
let basePath = "";

if (jsIndex !== -1) {
  basePath = scriptPath.substring(0, jsIndex);
} else {
  basePath = window.location.origin;
}
// ------------------------------------

function navbar() {
  let header = document.getElementById("navbar");
  if (!header) return; // Buena práctica por si no existe el div

  let ul = document.createElement("ul");
  ul.classList.add("nav");

  let divLogo = document.createElement("div");
  let logo = document.createElement("img");
  logo.src = basePath + "/img/logo.png"; // Usa basePath global
  divLogo.appendChild(logo);
  ul.appendChild(divLogo);

  // Baliabideak
  let liB = document.createElement("li");
  let aB = document.createElement("a");
  aB.textContent = "Baliabideak";
  aB.href = basePath + "/pages/baliabideak.html";
  liB.appendChild(aB);
  ul.appendChild(liB);

  // Kategoriak
  let liK = document.createElement("li");
  let aK = document.createElement("a");
  aK.textContent = "Kategoriak";
  aK.href = basePath + "/pages/kategoriak.html";
  liK.appendChild(aK);
  ul.appendChild(liK);

  // Gailuak
  let liGa = document.createElement("li");
  let aGa = document.createElement("a");
  aGa.textContent = "Gailuak";
  aGa.href = basePath + "/pages/gailuak.html";
  liGa.appendChild(aGa);
  ul.appendChild(liGa);

  // Gelak
  let liGe = document.createElement("li");
  let aGe = document.createElement("a");
  aGe.textContent = "Gelak";
  aGe.href = basePath + "/pages/gelak.html";
  liGe.appendChild(aGe);
  ul.appendChild(liGe);

  // // Mugimenduak
  // let liM = document.createElement("li");
  // let aM = document.createElement("a");
  // aM.textContent = "Mugimenduak";
  // aM.href = basePath + "/pages/mugimenduak.html";
  // liM.appendChild(aM);
  // ul.appendChild(liM);

  let divUser = document.createElement("div");
  let user = document.createElement("img");
  user.src = basePath + "/img/user.svg"; // Usa basePath global
  user.id = "erabPantaila";
  user.addEventListener("click", erabPantaila);

  divUser.appendChild(user);
  ul.appendChild(divUser);

  header.appendChild(ul);
}

async function erabPantaila() {
  try {
    let rola = sessionStorage.getItem("rol");

    // Usamos basePath para redirigir correctamente desde cualquier ubicación
    if (rola === "admin") {
      window.location.href = basePath + "/pages/admin/adminPantaila.html";
    } else {
      window.location.href = basePath + "/pages/userPantaila.html";
    }
  } catch (error) {
    console.log(error);
    alert("Errorea logout egiterakoan.");
  }
}

function footer() {
  let footer = document.getElementById("footer");
  if (!footer) return;

  footer.classList.add("foo");

  let divLogo = document.createElement("div");
  let logo = document.createElement("img");
  logo.src = basePath + "/img/logo.png"; // Usa basePath global
  divLogo.appendChild(logo);
  footer.appendChild(divLogo);

  let p = document.createElement("p");
  p.textContent = "INFORMATIKA SANTURTZI MINTEGIA";
  footer.appendChild(p);
}

document.addEventListener("DOMContentLoaded", () => {
  navbar();
  footer();
});
