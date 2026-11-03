'use strict'
import { apiUrl } from "./config.js";

document.getElementById("sartu").addEventListener("click", saioaHasi);

//Fetch erabiltzaileak
async function saioaHasi() {
    const loginUrl = apiUrl + "auth.php?action=login";

    const username = document.getElementById("erab").value;
    const pasahitza = document.getElementById("pas").value;

    try {
        const respuesta = await fetch(
            loginUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    pasahitza
                }),
                credentials: "include"
            }
        );

        let resultado = await respuesta.json();

        if (respuesta.ok === true) {
            sessionStorage.setItem("rol", resultado.rol);
            sessionStorage.setItem("erab", resultado.username);
            if (resultado.rol === "admin") {
                window.location.href = "pages/baliabideak.html";
            } else {
                window.location.href = "pages/baliabideak.html";
            }
        } else {
            alert("Erabiltzailea edo/eta pasahitza okerrak dira.");
        }

    } catch (error) {
        console.log(error);
        alert("Errorea login egiterakoan.");
    }
}
