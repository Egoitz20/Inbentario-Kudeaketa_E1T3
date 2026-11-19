'use strict'

const projectBase = window.location.pathname.includes("/pages/")
    ? window.location.pathname.split("/pages/")[0]
    : window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

document.getElementById("logout").addEventListener("click", logout);

async function logout() {
    try {
        sessionStorage.removeItem("rol");
        window.location.href = `${window.location.origin}${projectBase}/index.html`;

    } catch (error) {
        console.log(error);
        alert("Errorea logout egiterakoan.");
    }
}

document.getElementById("atzera").addEventListener("click", atzera);

async function atzera() {
    try {
        let rola = sessionStorage.getItem("rol");

        window.location.href = `${window.location.origin}${projectBase}/pages/baliabideak.html`;

    } catch (error) {
        console.log(error);
        alert("Errorea logout egiterakoan.");
    }
}

const erabIzena = sessionStorage.getItem("erab");
document.getElementById("erabIzena").textContent = erabIzena;
