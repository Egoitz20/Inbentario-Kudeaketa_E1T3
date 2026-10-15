'use strict'

document.getElementById("sartu").addEventListener("click", saioaHasi);

//Fetch erabiltzaileak
async function saioaHasi() {
    //let apiUrl = "http://192.168.207.66/wes/e1proeiktuak/erronka1/api/erabiltzaileak.php";
    let apiUrl = "https://random-word-api.herokuapp.com/word?lang=es";

    try {
        let respuesta = await fetch(apiUrl);
        let resultado = await respuesta.json();

        erab = resultado[0];

        console.log(erab);
    } catch (error) {
        console.log(error);
        //alert("Errorea erabiltzailea lortzerakoan.");
    }
}

//Fetch kategoriak

//Fetch baliabideak

//Fetch gailuak

//Fetch gelak

//Fetch mugimenduak
