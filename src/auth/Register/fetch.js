// --- Cargar calles dinámicamente ---
document.addEventListener('change', async () => {
 const seccionNombre = seccionSelect.value;
 const idSeccion = seccionIdMap[seccionNombre];

 calleSelect.innerHTML = '<option value="">Calles</option>';

  if (!idSeccion) {
     calleSelect.innerHTML = '<option value="">secciones</option>';
     return;
    }

   try {
      const response = await fetch('http://localhost:7001/id-ubicacion/{id_seccion}');
      if (!response.ok) throw new Error('No se pudieron cargar las calles');

      const calles = await response.json();

      if (calles.length === 0) {
         calleSelect.innerHTML = '<option value="">No hay calles disponibles</option>';
         return;
        }

            calleSelect.innerHTML = '<option value="" >Primero selecciona una sección</option>';
            console.log('calles recibidas', calles);
            calles.forEach(calle => {
                const option = document.createElement('option');
                option.value = calle.id_calle;
                option.textContent = calle.nombre_calle;
                calleSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al obtener calles:', error);
            calleSelect.innerHTML = '<option value="">Error al cargar calles</option>';
    }
});




document.getElementById("formulario").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido_paterno = document.getElementById("apellido_paterno").value;
    const apellido_materno = document.getElementById("apellido_materno").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;
    const seccion= document.getElementById("seccion").value;
    const calle=document.getElementById("calle").value;

    const userData = {
        nombre: nombre,
        apellido_paterno: apellido_paterno,
        apellido_materno: apellido_materno,
        correo: correo,
        contraseña: password,
    };

    try {
        const response = await fetch('http://localhost:7001/usuarios', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        console.log("Status:", response.status); 
        console.log("Headers:", response.headers.get("content-type")); 

        // Obtener el texto de la respuesta primero
        const responseText = await response.text(); 
        console.log("Respuesta del servidor:", responseText); 

        if (response.ok) {
            try {
                const data = responseText ? JSON.parse(responseText) : {};
                alert("Registro exitoso: " + JSON.stringify(data));
                window.location.href = "/Login.html";
            } catch (parseError) {
                alert("Registro exitoso: " + responseText);
                window.location.href = "/Login.html";
            }
        } else {
            try {
                const errorData = responseText ? JSON.parse(responseText) : {};
                alert("Error: " + (errorData.message || errorData.error || "Error desconocido"));
            } catch (parseError) {
                alert("Error: " + responseText);
            }
        }
    } catch (error) {
        console.error("Error al enviar los datos:", error);
        alert("Error de conexión. Intenta nuevamente.");
    }
});

