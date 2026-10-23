'use strict'
import { apiUrl } from "./config.js";

document.getElementById("sortu").addEventListener("click", erabBerria);

//Fetch erabiltzaile berria
async function erabBerria() {
    const loginUrl = apiUrl + "erabiltzaileak.php";

    const username = document.getElementById("erab").value;
    const pasahitza = document.getElementById("pas").value;
    const rola = document.getElementById("rola").value;

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
                    pasahitza,
                    rola
                }),
                credentials: "include"
            }
        );

        let resultado = await respuesta.json();

        if (respuesta.ok === true) {
            alert("Erabiltzaile berria sortuta!: " + username);
            const formulario = document.getElementById('form');
            formulario.reset();
        } else {
            alert("Errorea.");
        }
    } catch (error) {
        console.log(error);
        alert("Errorea fetch egiterakoan.");
    }
}
