"use strict";

function navbar() {
  let header = document.getElementById("navbar");

  let ul = document.createElement("ul");
  ul.classList.add("nav");

  let divLogo = document.createElement("div");
  let logo = document.createElement("img");
  logo.src = "../../img/logo.png";
  divLogo.appendChild(logo);
  ul.appendChild(divLogo);

  // Baliabideak
  let liB = document.createElement("li");
  let aB = document.createElement("a");
  aB.textContent = "Baliabideak";
  aB.href = "../pages/baliabideak.html";
  liB.appendChild(aB);
  ul.appendChild(liB);

  // Kategoriak
  let liK = document.createElement("li");
  let aK = document.createElement("a");
  aK.textContent = "Kategoriak";
  aK.href = "../pages/kategoriak.html";
  liK.appendChild(aK);
  ul.appendChild(liK);

  // Gailuak
  let liGa = document.createElement("li");
  let aGa = document.createElement("a");
  aGa.textContent = "Gailuak";
  aGa.href = "../pages/gailuak.html";
  liGa.appendChild(aGa);
  ul.appendChild(liGa);

  // Gelak
  let liGe = document.createElement("li");
  let aGe = document.createElement("a");
  aGe.textContent = "Gelak";
  aGe.href = "../pages/gelak.html";
  liGe.appendChild(aGe);
  ul.appendChild(liGe);

  // Mugimenduak
  let liM = document.createElement("li");
  let aM = document.createElement("a");
  aM.textContent = "Mugimenduak";
  aM.href = "../pages/mugimenduak.html";
  liM.appendChild(aM);
  ul.appendChild(liM);

  let divUser = document.createElement("div");
  let user = document.createElement("img");
  user.src = "../../img/user.svg";
  user.id = "erabPantaila";
  user.addEventListener("click", erabPantaila);

  divUser.appendChild(user);
  ul.appendChild(divUser);

  header.appendChild(ul);
}

async function erabPantaila() {
  try {
    let rola = sessionStorage.getItem("rol");

    if (rola === "admin") {
      window.location.href = "../pages/admin/adminPantaila.html";
    } else {
      window.location.href = "../pages/userPantaila.html";
    }
  } catch (error) {
    console.log(error);
    alert("Errorea logout egiterakoan.");
  }
}

function footer() {
  let footer = document.getElementById("footer");

  footer.classList.add("foo");

  let divLogo = document.createElement("div");
  let logo = document.createElement("img");
  logo.src = "../../img/logo.png";
  divLogo.appendChild(logo);
  footer.appendChild(divLogo);

  let p = document.createElement("p");
  p.textContent = "INFORMATIKA SANTURTZI MINTEGIA"
  footer.appendChild(p);
}

navbar();
footer();
