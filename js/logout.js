'use strict'

document.getElementById("logout").addEventListener("click", logout);

async function logout() {
    try {
        sessionStorage.removeItem("rol");
        window.location.href = "../../index.html";

    } catch (error) {
        console.log(error);
        alert("Errorea logout egiterakoan.");
    }
}

document.getElementById("atzera").addEventListener("click", atzera);

async function atzera() {
    try {
        window.location.href = "../baliabideak.html";

    } catch (error) {
        console.log(error);
        alert("Errorea logout egiterakoan.");
    }
}

const erabIzena = sessionStorage.getItem("erab");
document.getElementById("erabIzena").textContent = erabIzena ;
