async function loginUsuario(email, password) {
    try {
        const response = await fetch('http://107.22.248.129:7001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            alert('Error al iniciar sesión: ' + errorMsg);
            return;
        }

        const data = await response.json();

        // Ejemplo: si la respuesta trae id_admin, lo guardamos:
        if (data.id_admin) {
            localStorage.setItem('id_admin', data.id_admin);
            alert('ID de administrador guardado: ' + data.id_admin);
        } else {
            alert('La respuesta no contiene id_admin');
        }

        // Aquí continúas con tu flujo (redirigir, cargar dashboard, etc.)

    } catch (error) {
        console.error('Error en login:', error);
        alert('Error al conectar con el servidor.');
    }
}
