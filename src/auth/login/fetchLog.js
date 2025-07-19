document.addEventListener("submit", async function (e) {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contraseña = document.getElementById("contraseña").value;

  try {
    const response = await fetch('http://107.22.248.129:7001/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contraseña })
    });

    const responseText = await response.text();
    console.log("Respuesta cruda del backend:", responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        alert(errorData.message || "Correo o contraseña incorrectos");
      } catch {
        alert("Correo o contraseña incorrectos");
      }
      return;
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Respuesta parseada:", data);
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      alert("Error en la respuesta del servidor");
      return;
    }

    // Cambia de data.id_usuario a data.id
    if (!data.id || isNaN(data.id)) {
      alert("❌ El servidor no devolvió un ID de usuario válido.");
      return;
    }

    localStorage.setItem("id_usuario", data.id);
    console.log("🆔 ID del usuario logueado:", data.id);

    if (data.es_admin) {
      window.location.href = "/Proyect-web/src/features/Gestion/index_admin.html";
    } else {
      window.location.href = "/Proyect-web/src/features/Reportes/reportes.html";
    }

  } catch (error) {
    console.error("Error al intentar iniciar sesión:", error);
    alert("Error en el servidor");
  }
});
