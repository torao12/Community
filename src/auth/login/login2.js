document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    const inputs = document.querySelectorAll('#formulario input');
    const btnLogin = document.getElementById('Login'); 

    const expresiones = {
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.com$/,
        password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$/,
    };

    const campos = {
        correo: false,
        Contraseña: false
    };

    // Validar cada campo
    const validarCampo = (expresion, input, campo) => {
        if (expresion.test(input.value)) {
            document.getElementById(`group_${campo}`).classList.remove('formulario_grupo-incorrecto');
            document.getElementById(`group_${campo}`).classList.add('formulario_grupo-correcto');
            campos[campo] = true;
        } else {
            document.getElementById(`group_${campo}`).classList.add('formulario_grupo-incorrecto');
            document.getElementById(`group_${campo}`).classList.remove('formulario_grupo-correcto');
            campos[campo] = false;
        }
    };

    // Validar al escribir o salir del campo
    inputs.forEach((input) => {
        input.addEventListener('keyup', (e) => validarFormulario(e));
        input.addEventListener('blur', (e) => validarFormulario(e));
    });

    const validarFormulario = (e) => {
        switch (e.target.name) {
            case 'correo':
                validarCampo(expresiones.correo, e.target, 'correo');
                break;
            case 'password':
                validarCampo(expresiones.password, e.target, 'password');
                break;
        }
    };

    const mostrarMensaje = (tipo, texto) => {
        const mensajeElemento = document.getElementById('formulario_mensaje');
        const mensajeTexto = document.getElementById('mensaje_texto');
        const mensajeExito = document.getElementById('formulario_mensaje_exito');

        if (tipo === 'error') {
            mensajeTexto.textContent = texto;
            mensajeElemento.classList.add('formulario_mensaje-activo');
            mensajeExito.classList.remove('formulario-mensaje-exito-activo');
        } else if (tipo === 'exito') {
            mensajeTexto.textContent = texto;
            mensajeExito.classList.add('formulario-mensaje-exito-activo');
            mensajeElemento.classList.remove('formulario_mensaje-activo');
        }
    };

    // Enviar datos al backend
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnLogin.disabled = true;
        btnLogin.textContent = 'Validando...';

        // Validar todos los campos antes de enviar
        const todosCamposValidos = Object.values(campos).every(campo => campo === true);
        if (!todosCamposValidos) {
            mostrarMensaje('error', 'Por favor, completa todos los campos correctamente.');
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
            return;
        }

        const correo = document.getElementById('correo').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:7001/login', { // Ajusta la URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, password })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarMensaje('exito', '¡Inicio de sesión exitoso!');
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Redirigir tras éxito
                }, 2000);
            } else {
                // Manejar errores específicos del backend
                const errorMessage = data.error || data.message || 'Credenciales incorrectas';
                mostrarMensaje('error', errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', 'Error de conexión. Intenta nuevamente.');
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    });

    // Ocultar mensajes al empezar a escribir
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            document.getElementById('formulario_mensaje').classList.remove('formulario_mensaje-activo');
        });
    });
});