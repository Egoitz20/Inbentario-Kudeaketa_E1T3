"use strict";
import { apiUrl } from "./config.js";

// Función para pedir la informacion de los elementos a la API
export async function elementuakHartu(rutaPHP) {
  const elementuenURL = apiUrl + rutaPHP;

  try {
    const erantzuna = await fetch(elementuenURL, {
      method: "GET", // Se usa el metodo GET ya que lo unico que queremos es recoger la información
      credentials: "include",
    });

    if (erantzuna.status === 401) {
      alert("Saioa hasi behar duzu lehenengo.");
      window.location.href = "../index.html";
      return null;
    }

    if (!erantzuna.ok) {
      throw new Error(
        "Errorea zerbitzariaren erantzunean: " + erantzuna.status,
      );
    }

    // Devuelve el array de los correspondientes elementos obtenidos desde la BBDD
    return await erantzuna.json();
  } catch (error) {
    console.log("API Errorea:", error);
    alert("Errorea elementuak lortzean API-ren kontra");
    return null;
  }
}

export async function ezabatuBtn(rutaPHP, divTxartela) {
  const id = divTxartela.id;

  const elementuURL = apiUrl + rutaPHP + "?id=" + id;
  console.log(elementuURL);

  try {
    if (confirm("Ezabaketa konfirmatu") == true) {

      const respuesta = await fetch(elementuURL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, ekintza: "ezabatu" }),
        credentials: "include"
      });

      if (!respuesta.ok) {
        console.log(respuesta);
        throw new Error("Errorea zerbitzariarekin konektatzean.");
      }

      const emaitza = await respuesta.json();
      console.log(emaitza);

      if (emaitza.ok) {
        divTxartela.remove();
        window.location.reload();
      } else {
        alert("Ezin izan da elementua ezabatu.");
      }
    } else {
      return;
    }

  } catch (error) {
    console.error(error);
    alert("Errorea ezabaketa egiterakoan.");
  }
}
