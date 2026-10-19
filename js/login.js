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

            if (respuesta.ok && resultado.success === true) {
                if (resultado.rol === "admin") {
                    window.location.href = "pages/admin/hasieraAdmin.html";
                } else {
                    window.location.href = "pages/hasiera.html";
                }
            } else {
                alert("Erabiltzailea edo/eta pasahitza okerrak dira.");
            }

        // let erab2 = "admin";
        // let pas2 = "ikasle123";
        // let rola2 = "admin";
        // let erabIndex = document.getElementById("erab").value;
        // let pasIndex = document.getElementById("pas").value;

        // if (erab2 === erabIndex && pas2 === pasIndex) {
        //     if (rola2 === "admin") {
        //         window.location.href = "pages/admin/hasieraAdmin.html";
        //     } else {
        //         window.location.href = "pages/hasiera.html";
        //     }
        // } else {
        //     alert("Erabiltzailea edo/eta pasahitza okerrak dira.");
        // }

    } catch (error) {
        console.log(error);
        alert("Errorea login egiterakoan.");
    }
}
