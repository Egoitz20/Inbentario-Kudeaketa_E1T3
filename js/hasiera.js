'use strict'

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
    aB.href = "#ikusiB";
    liB.appendChild(aB);
    ul.appendChild(liB);

    // Kategoriak
    let liK = document.createElement("li");
    let aK = document.createElement("a");
    aK.textContent = "Kategoriak";
    aK.href = "#ikusiK";
    liK.appendChild(aK);
    ul.appendChild(liK);

    // Gailuak
    let liGa = document.createElement("li");
    let aGa = document.createElement("a");
    aGa.textContent = "Gailuak";
    aGa.href = "#ikusiGa";
    liGa.appendChild(aGa);
    ul.appendChild(liGa);

    // Gelak
    let liGe = document.createElement("li");
    let aGe = document.createElement("a");
    aGe.textContent = "Gelak";
    aGe.href = "#ikusiGe";
    liGe.appendChild(aGe);
    ul.appendChild(liGe);

    // Mugimenduak
    let liM = document.createElement("li");
    let aM = document.createElement("a");
    aM.textContent = "Mugimenduak";
    aM.href = "#ikusiM";
    liM.appendChild(aM);
    ul.appendChild(liM);

    let divUser = document.createElement("div");
    let user = document.createElement("img");
    user.src = "../../img/user.svg";
    user.id = "logout";
    user.addEventListener("click", logout);

    divUser.appendChild(user);
    ul.appendChild(divUser);

    header.appendChild(ul);
}

async function logout() {
    //const erabiltzaileakUrl = apiUrl + "erabiltzaileak.php";

    try {
        //let respuesta = await fetch(erabiltzaileakUrl);
        //let resultado = await respuesta.json();

        let rola = "admin";

        if (rola === "admin") {
            window.location.href = "../pages/admin/admin.html";
        } else {
            window.location.href = "../index.html";
        }
    } catch (error) {
        console.log(error);
        alert("Errorea.");
    }
}

navbar();