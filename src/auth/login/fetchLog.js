document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    const inputs = document.querySelectorAll('#formulario input');
    const btnLogin = document.querySelector('.btn-login'); // Se usa la clase en vez de ID

    if (!formulario || !btnLogin) {
        console.error("❌ No se encontró el formulario o el botón de login.");
        return;
    }

    const expresiones = {
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.com$/,
        contraseña: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/,
    };

    const campos = {
        correo: false,
        contraseña: false
    };

    const validarCampo = (expresion, input, campo) => {
        const grupo = document.getElementById(`group_${campo === 'contraseña' ? 'password' : campo}`);
        if (!grupo) return;

        if (expresion.test(input.value)) {
            grupo.classList.remove('formulario_grupo-incorrecto');
            grupo.classList.add('formulario_grupo-correcto');
            campos[campo] = true;
        } else {
            grupo.classList.add('formulario_grupo-incorrecto');
            grupo.classList.remove('formulario_grupo-correcto');
            campos[campo] = false;
        }
    };

    const validarFormulario = (e) => {
        switch (e.target.name) {
            case 'correo':
                validarCampo(expresiones.correo, e.target, 'correo');
                break;
            case 'contraseña':
                validarCampo(expresiones.contraseña, e.target, 'contraseña');
                break;
        }
    };

    inputs.forEach((input) => {
        input.addEventListener('keyup', validarFormulario);
        input.addEventListener('blur', validarFormulario);
    });

    const mostrarMensaje = (tipo, texto) => {
        const mensajeElemento = document.getElementById('formulario_mensaje');
        const mensajeTexto = document.getElementById('mensaje_texto');
        const mensajeExito = document.getElementById('formulario_mensaje_exito');

        if (!mensajeElemento || !mensajeTexto) return;

        if (tipo === 'error') {
            mensajeTexto.textContent = texto;
            mensajeElemento.classList.add('formulario_mensaje-activo');
            if (mensajeExito) mensajeExito.classList.remove('formulario-mensaje-exito-activo');
        } else if (tipo === 'exito') {
            mensajeTexto.textContent = texto;
            if (mensajeExito) mensajeExito.classList.add('formulario-mensaje-exito-activo');
            mensajeElemento.classList.remove('formulario_mensaje-activo');
        }
    };

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        btnLogin.disabled = true;
        const textoOriginal = btnLogin.textContent;
        btnLogin.textContent = 'Iniciando...';

        const todosCamposValidos = Object.values(campos).every(campo => campo === true);
        if (!todosCamposValidos) {
            mostrarMensaje('error', 'Por favor, completa todos los campos correctamente.');
            btnLogin.disabled = false;
            btnLogin.textContent = textoOriginal;
            return;
        }

        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('contraseña').value;

        try {
            const response = await fetch('http://107.22.248.129:7001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, contraseña })
            });

            const responseText = await response.text();
            console.log("Respuesta cruda del backend:", responseText);

            if (!response.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    const errorMessage = errorData.message || errorData.error || 'Credenciales incorrectas';
                    mostrarMensaje('error', errorMessage);
                } catch {
                    mostrarMensaje('error', 'Correo o contraseña incorrectos');
                }
                return;
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log("Respuesta parseada:", data);
            } catch (error) {
                console.error("Error al parsear JSON:", error);
                mostrarMensaje('error', 'Error en la respuesta del servidor');
                return;
            }

            if (!data.id || isNaN(data.id)) {
                mostrarMensaje('error', 'El servidor no devolvió un ID de usuario válido.');
                return;
            }

            localStorage.setItem("id_usuario", data.id);
            localStorage.setItem("usuario", JSON.stringify(data));
            console.log("ID del usuario logueado:", data.id);

            mostrarMensaje('exito', '¡Inicio de sesión exitoso!');

            setTimeout(() => {
                if (data.es_admin) {
                    window.location.href = "./src/features/Gestion/index_admin.html";
                } else {
                    window.location.href = "./src/features/Reportes/reportes.html";
                }
            }, 2000);

        } catch (error) {
            console.error("Error al intentar iniciar sesión:", error);
            mostrarMensaje('error', 'Error de conexión. Intenta nuevamente.');
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = textoOriginal;
        }
    });

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const mensajeElemento = document.getElementById('formulario_mensaje');
            const mensajeExito = document.getElementById('formulario_mensaje_exito');

            if (mensajeElemento) mensajeElemento.classList.remove('formulario_mensaje-activo');
            if (mensajeExito) mensajeExito.classList.remove('formulario-mensaje-exito-activo');
        });
    });
});
