'use strict'

//Logout
document.getElementById("logout").addEventListener("click", logout);

async function logout() {
    //let apiUrl = "https://random-word-api.herokuapp.com/word?lang=es";

    try {
        //let respuesta = await fetch(apiUrl);
        //let resultado = await respuesta.json();

        let rola = "admin";

        if (rola === "admin") {
            window.location.href = "../pages/admin.html";
        } else {
            window.location.href = "../index.html";
        }
    } catch (error) {
        console.log(error);
        alert("Errorea.");
    }
}
