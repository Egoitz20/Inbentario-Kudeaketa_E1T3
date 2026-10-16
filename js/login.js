'use strict'

document.getElementById("sartu").addEventListener("click", saioaHasi);

//Fetch erabiltzaileak
async function saioaHasi() {
    //let apiUrl = "https://random-word-api.herokuapp.com/word?lang=es";

    try {
        //let respuesta = await fetch(apiUrl);
        //let resultado = await respuesta.json();

        let erab = "admin";
        let pas = "ikasle123";
        let rola = "admin";
        let erabIndex = document.getElementById("erab").value;
        let pasIndex = document.getElementById("pas").value;

        /*
        console.log(erab);
        console.log(pas);
        console.log(erabIndex);
        console.log(pasIndex);
        */

        if (erab === erabIndex && pas === pasIndex) {
            if (rola === "admin") {
                window.location.href = "pages/ikusiB.html";
            } else {
                window.location.href = "pages/ikusiB.html";
            }
        } else {
            alert("Erabiltzailea edo/eta pasahitza okerrak dira.");
        }

    } catch (error) {
        console.log(error);
        alert("Errorea login egiterakoan.");
    }
}

//Fetch kategoriak

//Fetch baliabideak

//Fetch gailuak

//Fetch gelak

//Fetch mugimenduak
