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
